"""
ML Career Recommender
Uses cosine similarity to match user skills to career profiles.
Run train.py first to generate model, then use this for predictions.
"""
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MultiLabelBinarizer
import json

# Career profiles: (career_name, required_skills, avg_salary_lpa)
CAREER_PROFILES = [
    ("Data Scientist",         ["python","statistics","machine_learning","pandas","sql","visualization"], 15),
    ("ML Engineer",            ["python","machine_learning","deep_learning","tensorflow","mlops","docker"], 18),
    ("Data Engineer",          ["python","sql","spark","airflow","aws","etl","kafka"], 16),
    ("Backend Developer",      ["python","nodejs","sql","rest_api","docker","postgresql"], 12),
    ("Full Stack Developer",   ["javascript","react","nodejs","sql","html","css","rest_api"], 11),
    ("Cloud Architect",        ["aws","azure","gcp","kubernetes","docker","terraform","networking"], 20),
    ("DevOps Engineer",        ["docker","kubernetes","ci_cd","linux","aws","terraform","monitoring"], 17),
    ("Cybersecurity Analyst",  ["networking","linux","python","penetration_testing","siem","cryptography"], 14),
    ("Data Analyst",           ["sql","excel","python","tableau","statistics","visualization"], 9),
    ("AI Research Engineer",   ["python","deep_learning","pytorch","mathematics","research","nlp"], 22),
    ("Product Manager",        ["communication","analytics","sql","agile","roadmapping","stakeholders"], 18),
    ("System Design Engineer", ["distributed_systems","sql","caching","microservices","api_design","scalability"], 20),
]

ALL_SKILLS = sorted(set(s for _, skills, _ in CAREER_PROFILES for s in skills))

def encode_skills(user_skills: list[str]) -> np.ndarray:
    """Encode user skills as a binary vector over ALL_SKILLS"""
    vec = np.zeros(len(ALL_SKILLS))
    for skill in user_skills:
        skill_lower = skill.lower().replace(" ", "_").replace("-", "_")
        if skill_lower in ALL_SKILLS:
            idx = ALL_SKILLS.index(skill_lower)
            vec[idx] = 1
    return vec.reshape(1, -1)

def career_vector(required_skills: list[str]) -> np.ndarray:
    return encode_skills(required_skills)

def recommend_careers(user_skills: list[str], top_n: int = 5) -> list[dict]:
    """
    Returns top N career recommendations with match score, skill gap, salary.
    """
    if not user_skills:
        return []

    user_vec = encode_skills(user_skills)
    results = []

    for career_name, req_skills, salary in CAREER_PROFILES:
        career_vec = career_vector(req_skills)
        sim = cosine_similarity(user_vec, career_vec)[0][0]

        user_set = set(s.lower().replace(" ", "_") for s in user_skills)
        req_set = set(req_skills)
        matched = user_set & req_set
        missing = req_set - user_set

        results.append({
            "career": career_name,
            "match_score": round(float(sim) * 100, 1),
            "matched_skills": list(matched),
            "missing_skills": list(missing),
            "total_required": len(req_skills),
            "avg_salary_lpa": salary,
            "readiness_pct": round(len(matched) / len(req_set) * 100, 1),
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:top_n]

def analyze_skill_gap(user_skills: list[str], target_career: str) -> dict:
    """Detailed gap analysis for a specific career"""
    target = next((c for c in CAREER_PROFILES if c[0] == target_career), None)
    if not target:
        return {"error": "Career not found"}

    career_name, req_skills, salary = target
    user_set = set(s.lower().replace(" ", "_") for s in user_skills)
    req_set = set(req_skills)
    matched = user_set & req_set
    missing = req_set - user_set

    # Map missing skills to courses on the platform
    skill_to_course = {
        "python": "Machine Learning with Python",
        "machine_learning": "Machine Learning with Python",
        "deep_learning": "Machine Learning with Python",
        "sql": "Data Analysis with Pandas",
        "pandas": "Data Analysis with Pandas",
        "react": "Full Stack React & Node.js",
        "nodejs": "Full Stack React & Node.js",
        "aws": "AWS Cloud Practitioner",
        "docker": "AWS Cloud Practitioner",
        "networking": "Cybersecurity Essentials",
        "penetration_testing": "Cybersecurity Essentials",
    }

    skill_courses = {s: skill_to_course.get(s, "Search on platform") for s in missing}

    return {
        "career": career_name,
        "matched_skills": list(matched),
        "missing_skills": list(missing),
        "match_pct": round(len(matched) / max(len(req_set), 1) * 100, 1),
        "salary_lpa": salary,
        "recommended_courses": skill_courses,
        "estimated_learning_weeks": len(missing) * 2,
    }

def generate_study_plan(user_skills: list[str], target_career: str, months: int = 3) -> list[dict]:
    """Generate a month-by-month study plan"""
    gap = analyze_skill_gap(user_skills, target_career)
    if "error" in gap:
        return []

    missing = gap["missing_skills"]
    per_month = max(1, len(missing) // months)
    plan = []

    for i in range(months):
        chunk = missing[i*per_month:(i+1)*per_month]
        courses = list(set(gap["recommended_courses"].get(s, "Platform search") for s in chunk))
        plan.append({
            "month": i + 1,
            "focus_skills": chunk,
            "recommended_courses": courses,
            "goal": f"Complete {len(courses)} course(s) and build 1 project",
        })

    return plan


if __name__ == "__main__":
    # Demo
    my_skills = ["python", "sql", "pandas", "machine_learning", "statistics"]
    print("\n=== Career Recommendations ===")
    for r in recommend_careers(my_skills):
        print(f"{r['career']:30s} Match: {r['match_score']:5.1f}%  Gap: {r['missing_skills']}  Salary: ₹{r['avg_salary_lpa']} LPA")

    print("\n=== Skill Gap: Data Scientist ===")
    gap = analyze_skill_gap(my_skills, "Data Scientist")
    print(json.dumps(gap, indent=2))

    print("\n=== 3-Month Study Plan ===")
    for month in generate_study_plan(my_skills, "ML Engineer", 3):
        print(f"Month {month['month']}: {month['focus_skills']} → {month['recommended_courses']}")
