-- SkillPath AI — PostgreSQL Schema
-- Run: psql -U postgres -d skillpath -f schema.sql

CREATE DATABASE IF NOT EXISTS skillpath;
\c skillpath;

-- ─── EXTENSIONS ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fast text search

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(120) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(50) DEFAULT 'Student'
                CHECK (role IN ('Student','Working Professional','Career Switcher','Fresher')),
    is_admin    BOOLEAN DEFAULT FALSE,
    avatar_url  TEXT,
    bio         TEXT,
    linkedin    VARCHAR(255),
    github      VARCHAR(255),
    joined_at   TIMESTAMP DEFAULT NOW(),
    last_login  TIMESTAMP,
    is_active   BOOLEAN DEFAULT TRUE
);
CREATE INDEX idx_users_email ON users(email);

-- ─── SKILLS ───────────────────────────────────────────────────────────────────
CREATE TABLE skills (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(100) UNIQUE NOT NULL,
    slug    VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(60)
);

CREATE TABLE user_skills (
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id    INT  REFERENCES skills(id) ON DELETE CASCADE,
    level       SMALLINT DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
    added_at    TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, skill_id)
);

-- ─── COURSES ──────────────────────────────────────────────────────────────────
CREATE TABLE courses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    category    VARCHAR(80),
    thumb_emoji VARCHAR(10) DEFAULT '📚',
    color_hex   VARCHAR(10) DEFAULT '#6366f1',
    total_lessons   SMALLINT DEFAULT 0,
    total_hours     NUMERIC(4,1) DEFAULT 0,
    rating          NUMERIC(3,2) DEFAULT 0,
    enrolled_count  INT DEFAULT 0,
    is_published    BOOLEAN DEFAULT FALSE,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_title_trgm ON courses USING GIN (title gin_trgm_ops);

-- ─── LESSONS ──────────────────────────────────────────────────────────────────
CREATE TABLE lessons (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id   UUID REFERENCES courses(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    lesson_order SMALLINT NOT NULL,
    type        VARCHAR(20) DEFAULT 'video' CHECK (type IN ('video','reading','quiz','exercise')),
    duration_min SMALLINT,
    video_url   TEXT,
    content_md  TEXT,
    is_free_preview BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_lessons_course ON lessons(course_id, lesson_order);

-- ─── QUIZ ─────────────────────────────────────────────────────────────────────
CREATE TABLE quiz_questions (
    id          SERIAL PRIMARY KEY,
    lesson_id   UUID REFERENCES lessons(id) ON DELETE CASCADE,
    question    TEXT NOT NULL,
    option_a    VARCHAR(300),
    option_b    VARCHAR(300),
    option_c    VARCHAR(300),
    option_d    VARCHAR(300),
    correct_opt CHAR(1) CHECK (correct_opt IN ('a','b','c','d')),
    explanation TEXT
);

-- ─── ENROLLMENTS & PROGRESS ───────────────────────────────────────────────────
CREATE TABLE enrollments (
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id   UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    completed   BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    PRIMARY KEY (user_id, course_id)
);

CREATE TABLE lesson_progress (
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id   UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed   BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    PRIMARY KEY (user_id, lesson_id)
);

-- View: course progress per user
CREATE OR REPLACE VIEW course_progress_view AS
SELECT
    e.user_id,
    e.course_id,
    c.title AS course_title,
    c.total_lessons,
    COUNT(lp.lesson_id) FILTER (WHERE lp.completed) AS completed_lessons,
    ROUND(
        COUNT(lp.lesson_id) FILTER (WHERE lp.completed)::numeric
        / NULLIF(c.total_lessons, 0) * 100
    ) AS progress_pct
FROM enrollments e
JOIN courses c ON c.id = e.course_id
LEFT JOIN lessons l ON l.course_id = e.course_id
LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = e.user_id
GROUP BY e.user_id, e.course_id, c.title, c.total_lessons;

-- ─── CERTIFICATES ─────────────────────────────────────────────────────────────
CREATE TABLE certificates (
    id          VARCHAR(30) PRIMARY KEY,   -- e.g. SKP-2025-AB12CD
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id   UUID REFERENCES courses(id),
    issued_at   TIMESTAMP DEFAULT NOW(),
    pdf_path    TEXT,
    is_valid    BOOLEAN DEFAULT TRUE
);
CREATE INDEX idx_certs_user ON certificates(user_id);

-- ─── CHAT HISTORY ─────────────────────────────────────────────────────────────
CREATE TABLE advisor_chats (
    id          SERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(10) CHECK (role IN ('user','ai')),
    message     TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_chats_user ON advisor_chats(user_id, created_at DESC);

-- ─── CAREER RECOMMENDATIONS ───────────────────────────────────────────────────
CREATE TABLE career_recommendations (
    id          SERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    career_name VARCHAR(120),
    match_score NUMERIC(5,2),
    missing_skills TEXT[],
    salary_lpa  SMALLINT,
    generated_at TIMESTAMP DEFAULT NOW()
);

-- ─── SEED: Sample skills ──────────────────────────────────────────────────────
INSERT INTO skills (name, slug, category) VALUES
('Python',          'python',           'Programming'),
('JavaScript',      'javascript',       'Programming'),
('SQL',             'sql',              'Data'),
('Machine Learning','machine_learning', 'AI/ML'),
('Deep Learning',   'deep_learning',    'AI/ML'),
('React',           'react',            'Frontend'),
('Node.js',         'nodejs',           'Backend'),
('AWS',             'aws',              'Cloud'),
('Docker',          'docker',           'DevOps'),
('Data Analysis',   'data_analysis',    'Data'),
('Statistics',      'statistics',       'Data'),
('System Design',   'system_design',    'Engineering')
ON CONFLICT DO NOTHING;

-- ─── FUNCTION: update enrolled_count ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses
    SET enrolled_count = (
        SELECT COUNT(*) FROM enrollments WHERE course_id = NEW.course_id
    )
    WHERE id = NEW.course_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enrollment_count
AFTER INSERT OR DELETE ON enrollments
FOR EACH ROW EXECUTE FUNCTION update_enrolled_count();
