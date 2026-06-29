"""
SkillPath AI — Resume Parser
Extracts skills, education, experience from uploaded resume (PDF or text).

Install: pip install pdfplumber spacy --break-system-packages
         python -m spacy download en_core_web_sm
"""
import re
from typing import Optional

# ─── Master skill dictionary ──────────────────────────────────────────────────
SKILL_KEYWORDS = {
    # Programming languages
    "python": ["python", "py"],
    "javascript": ["javascript", "js", "es6", "es2015"],
    "typescript": ["typescript", "ts"],
    "java": ["java", "jvm"],
    "c++": ["c++", "cpp", "c plus plus"],
    "golang": ["golang", "go lang"],
    "rust": ["rust"],
    "scala": ["scala"],
    "r": [" r ", "r programming", "rstudio"],
    "kotlin": ["kotlin"],
    "swift": ["swift"],
    "php": ["php"],
    "ruby": ["ruby", "ruby on rails"],

    # ML/AI
    "machine_learning": ["machine learning", "ml ", "sklearn", "scikit-learn", "scikit learn"],
    "deep_learning": ["deep learning", "dl ", "neural network", "ann", "cnn", "rnn", "lstm"],
    "tensorflow": ["tensorflow", "tf "],
    "pytorch": ["pytorch", "torch"],
    "nlp": ["nlp", "natural language processing", "spacy", "nltk", "hugging face", "bert", "gpt", "transformers"],
    "computer_vision": ["computer vision", "opencv", "image recognition", "object detection"],
    "reinforcement_learning": ["reinforcement learning", "rl "],
    "statistics": ["statistics", "statistical", "probability", "bayesian", "regression", "hypothesis"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "matplotlib": ["matplotlib", "seaborn", "plotly"],
    "mlops": ["mlops", "ml ops", "mlflow", "kubeflow", "model deployment"],

    # Web
    "react": ["react", "reactjs", "react.js"],
    "nextjs": ["next.js", "nextjs", "next js"],
    "vue": ["vue", "vuejs", "vue.js"],
    "angular": ["angular", "angularjs"],
    "nodejs": ["node.js", "nodejs", "node js", "express"],
    "django": ["django"],
    "fastapi": ["fastapi", "fast api"],
    "flask": ["flask"],
    "graphql": ["graphql"],
    "rest_api": ["rest api", "restful", "rest ", "api design"],
    "html": ["html", "html5"],
    "css": ["css", "css3", "sass", "scss", "tailwind"],

    # Data
    "sql": ["sql", "mysql", "postgresql", "postgres", "sqlite", "oracle db", "t-sql", "pl/sql"],
    "nosql": ["nosql", "mongodb", "cassandra", "dynamodb", "couchdb"],
    "spark": ["apache spark", "pyspark", "spark"],
    "kafka": ["apache kafka", "kafka"],
    "airflow": ["apache airflow", "airflow"],
    "dbt": ["dbt", "data build tool"],
    "snowflake": ["snowflake"],
    "redshift": ["amazon redshift", "redshift"],
    "tableau": ["tableau"],
    "power_bi": ["power bi", "powerbi"],

    # Cloud
    "aws": ["aws", "amazon web services", "ec2", "s3", "lambda", "sagemaker", "rds"],
    "azure": ["azure", "microsoft azure", "aks"],
    "gcp": ["gcp", "google cloud", "bigquery", "gke"],
    "kubernetes": ["kubernetes", "k8s"],
    "docker": ["docker", "containerization", "container"],
    "terraform": ["terraform", "infrastructure as code", "iac"],
    "ansible": ["ansible"],

    # DevOps / tools
    "ci_cd": ["ci/cd", "ci cd", "continuous integration", "continuous deployment", "jenkins", "github actions", "gitlab ci"],
    "linux": ["linux", "unix", "bash", "shell scripting", "ubuntu", "centos"],
    "git": ["git", "github", "gitlab", "version control"],
    "monitoring": ["monitoring", "prometheus", "grafana", "datadog", "elk", "kibana"],

    # Security
    "networking": ["networking", "tcp/ip", "dns", "firewall", "vpn", "osi model"],
    "penetration_testing": ["penetration testing", "pen test", "pentest", "ethical hacking"],
    "cryptography": ["cryptography", "encryption", "ssl", "tls", "pki"],

    # Soft / career
    "communication": ["communication", "presentation", "public speaking"],
    "agile": ["agile", "scrum", "kanban", "sprint", "jira"],
    "leadership": ["leadership", "team lead", "mentoring", "managed a team"],
}

EDUCATION_PATTERNS = [
    r"b\.?tech|bachelor of technology",
    r"b\.?e\.?|bachelor of engineering",
    r"b\.?sc|bachelor of science",
    r"b\.?ca|bachelor of computer applications",
    r"m\.?tech|master of technology",
    r"m\.?sc|master of science",
    r"m\.?ca|master of computer applications",
    r"mba|master of business administration",
    r"ph\.?d|doctorate",
    r"diploma",
    r"10th|ssc|matriculation",
    r"12th|hsc|intermediate",
]

DEGREE_GRADES = r"(\d{1,2}\.?\d{0,2})\s*(cgpa|gpa|%|percent|marks)"

EXPERIENCE_PATTERNS = [
    r"(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)",
    r"(\d+)\s*months?\s*(of\s*)?(experience|exp)",
]

ROLE_KEYWORDS = [
    "software engineer", "developer", "data scientist", "data analyst",
    "ml engineer", "backend", "frontend", "full stack", "devops",
    "cloud engineer", "intern", "trainee", "associate", "senior", "junior",
]


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract raw text from a PDF file."""
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += (page.extract_text() or "") + "\n"
        return text
    except ImportError:
        raise ImportError("Install pdfplumber: pip install pdfplumber --break-system-packages")


def parse_resume(text: str) -> dict:
    """
    Parse resume text and extract structured information.
    Works on plain text or text extracted from PDF.
    """
    text_lower = text.lower()

    # ── Skills extraction ─────────────────────────────────────────────────────
    found_skills = []
    for skill_key, aliases in SKILL_KEYWORDS.items():
        for alias in aliases:
            if alias in text_lower:
                found_skills.append(skill_key)
                break

    # ── Education extraction ──────────────────────────────────────────────────
    education = []
    for pattern in EDUCATION_PATTERNS:
        if re.search(pattern, text_lower):
            # Try to find the degree label in context
            match = re.search(pattern, text_lower)
            start = max(0, match.start() - 20)
            end = min(len(text_lower), match.end() + 60)
            snippet = text[start:end].strip()
            education.append(snippet.replace("\n", " "))

    grade_match = re.search(DEGREE_GRADES, text_lower)
    grade = grade_match.group(0) if grade_match else None

    # ── Experience extraction ─────────────────────────────────────────────────
    experience_years = 0
    for pattern in EXPERIENCE_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            n = int(match.group(1))
            if "month" in pattern:
                experience_years = round(n / 12, 1)
            else:
                experience_years = n
            break

    # ── Role / title extraction ───────────────────────────────────────────────
    current_role = None
    for role in ROLE_KEYWORDS:
        if role in text_lower:
            current_role = role.title()
            break

    # ── Contact info (basic) ──────────────────────────────────────────────────
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    phone_match = re.search(r"(\+91[\s-]?)?[6-9]\d{9}", text)
    linkedin_match = re.search(r"linkedin\.com/in/[\w-]+", text_lower)
    github_match = re.search(r"github\.com/[\w-]+", text_lower)

    # ── Name (first non-empty line heuristic) ─────────────────────────────────
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    name_candidate = lines[0] if lines and len(lines[0].split()) <= 5 else None

    # ── Career recommendation ─────────────────────────────────────────────────
    from recommender import recommend_careers
    recommendations = recommend_careers(found_skills, top_n=3)

    return {
        "name": name_candidate,
        "email": email_match.group(0) if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "linkedin": linkedin_match.group(0) if linkedin_match else None,
        "github": github_match.group(0) if github_match else None,
        "skills": sorted(set(found_skills)),
        "skill_count": len(set(found_skills)),
        "education": education[:3],
        "grade": grade,
        "experience_years": experience_years,
        "current_role": current_role,
        "career_recommendations": recommendations,
        "resume_score": min(100, len(set(found_skills)) * 5 + (20 if experience_years > 0 else 0) + (10 if email_match else 0)),
    }


def parse_resume_from_pdf(pdf_path: str) -> dict:
    text = extract_text_from_pdf(pdf_path)
    return parse_resume(text)


# ─── FastAPI integration ──────────────────────────────────────────────────────
# In main.py, add:
#
# from fastapi import UploadFile, File
# import tempfile, os
# from ml.resume_parser import parse_resume_from_pdf, parse_resume
#
# @app.post("/resume/parse")
# async def parse_resume_route(file: UploadFile = File(...), user=Depends(get_current_user)):
#     if file.content_type == "application/pdf":
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
#             tmp.write(await file.read())
#             tmp_path = tmp.name
#         result = parse_resume_from_pdf(tmp_path)
#         os.unlink(tmp_path)
#     else:
#         text = (await file.read()).decode("utf-8")
#         result = parse_resume(text)
#     return result
#
# @app.post("/resume/parse-text")
# async def parse_resume_text(data: dict, user=Depends(get_current_user)):
#     return parse_resume(data.get("text", ""))


if __name__ == "__main__":
    import json
    sample = """
    Priya Sharma
    priya.sharma@gmail.com | +91 9876543210 | linkedin.com/in/priyasharma | github.com/priyasharma

    B.Tech Computer Science Engineering | Anna University | 2021 | 8.5 CGPA

    EXPERIENCE
    Data Science Intern — ABC Analytics (6 months)
    - Built ML models using Python and scikit-learn, improving prediction accuracy by 18%
    - Performed data analysis and visualization using Pandas and Matplotlib
    - Developed SQL queries for large-scale data extraction from PostgreSQL

    SKILLS
    Python, Machine Learning, Pandas, NumPy, SQL, Tableau, Statistics, Git, Linux
    Deep Learning basics, TensorFlow, Docker
    """
    result = parse_resume(sample)
    print(json.dumps(result, indent=2))
