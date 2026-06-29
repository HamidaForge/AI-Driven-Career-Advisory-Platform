from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import jwt
import bcrypt
import uuid

app = FastAPI(title="SkillPath AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "skillpath-secret-2025-change-in-production"
ALGORITHM = "HS256"
security = HTTPBearer()

# ─── In-memory DB (replace with PostgreSQL in production) ─────────────────────
users_db = {}
progress_db = {}
certificates_db = {}

courses_db = {
    "1": {"id":"1","title":"Machine Learning with Python","category":"ML & AI","lessons":14,"hours":6,"thumb":"🤖","color":"#6366f1","rating":4.9,"enrolled":842,"published":True},
    "2": {"id":"2","title":"Full Stack React & Node.js","category":"Web Dev","lessons":22,"hours":9,"thumb":"⚛️","color":"#10b981","rating":4.8,"enrolled":1204,"published":True},
    "3": {"id":"3","title":"Data Analysis with Pandas","category":"Data Science","lessons":16,"hours":7,"thumb":"📊","color":"#f59e0b","rating":4.7,"enrolled":673,"published":True},
    "4": {"id":"4","title":"System Design Fundamentals","category":"Engineering","lessons":10,"hours":5,"thumb":"🏗️","color":"#ec4899","rating":4.9,"enrolled":521,"published":True},
    "5": {"id":"5","title":"AWS Cloud Practitioner","category":"Cloud","lessons":18,"hours":8,"thumb":"☁️","color":"#0ea5e9","rating":4.6,"enrolled":389,"published":True},
    "6": {"id":"6","title":"Cybersecurity Essentials","category":"Security","lessons":12,"hours":5,"thumb":"🔐","color":"#8b5cf6","rating":4.8,"enrolled":274,"published":True},
}

# ─── Pydantic models ──────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "Student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    is_admin: bool = False
    admin_key: Optional[str] = None

class ProgressUpdate(BaseModel):
    course_id: str
    lesson_id: int
    completed: bool

class ChatMessage(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class CourseCreate(BaseModel):
    title: str
    category: str
    lessons: int
    hours: float
    description: Optional[str] = ""

# ─── Auth helpers ─────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(data: dict, expires_hours: int = 24) -> str:
    payload = {**data, "exp": datetime.utcnow() + timedelta(hours=expires_hours)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return decode_token(credentials.credentials)

# ─── AUTH ROUTES ──────────────────────────────────────────────────────────────
@app.post("/auth/register")
def register(data: UserRegister):
    if data.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    users_db[data.email] = {
        "id": user_id,
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "role": data.role,
        "is_admin": False,
        "joined": datetime.utcnow().isoformat(),
        "skills": [],
    }
    token = create_token({"sub": user_id, "email": data.email, "is_admin": False})
    return {"token": token, "user": {k:v for k,v in users_db[data.email].items() if k != "password"}}

@app.post("/auth/login")
def login(data: UserLogin):
    if data.is_admin:
        if data.admin_key != "admin123":
            raise HTTPException(status_code=401, detail="Invalid admin key")
        token = create_token({"sub": "admin", "email": data.email, "is_admin": True})
        return {"token": token, "user": {"name": "Admin", "email": data.email, "is_admin": True}}

    user = users_db.get(data.email)
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": user["id"], "email": data.email, "is_admin": False})
    return {"token": token, "user": {k:v for k,v in user.items() if k != "password"}}

# ─── COURSE ROUTES ────────────────────────────────────────────────────────────
@app.get("/courses")
def get_courses(category: Optional[str] = None, search: Optional[str] = None):
    result = list(courses_db.values())
    if category and category != "All":
        result = [c for c in result if c["category"] == category]
    if search:
        result = [c for c in result if search.lower() in c["title"].lower()]
    return result

@app.get("/courses/{course_id}")
def get_course(course_id: str):
    course = courses_db.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.post("/courses")
def create_course(data: CourseCreate, user=Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    cid = str(len(courses_db) + 1)
    courses_db[cid] = {**data.dict(), "id": cid, "enrolled": 0, "rating": 0, "published": False, "thumb": "📚", "color": "#6366f1"}
    return courses_db[cid]

@app.delete("/courses/{course_id}")
def delete_course(course_id: str, user=Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    if course_id not in courses_db:
        raise HTTPException(status_code=404, detail="Course not found")
    del courses_db[course_id]
    return {"message": "Course deleted"}

# ─── PROGRESS ROUTES ──────────────────────────────────────────────────────────
@app.get("/progress/{course_id}")
def get_progress(course_id: str, user=Depends(get_current_user)):
    key = f"{user['sub']}:{course_id}"
    return progress_db.get(key, {"completed_lessons": [], "progress_pct": 0})

@app.post("/progress")
def update_progress(data: ProgressUpdate, user=Depends(get_current_user)):
    key = f"{user['sub']}:{data.course_id}"
    record = progress_db.get(key, {"completed_lessons": []})
    lessons = set(record["completed_lessons"])
    if data.completed:
        lessons.add(data.lesson_id)
    else:
        lessons.discard(data.lesson_id)
    course = courses_db.get(data.course_id, {})
    total = course.get("lessons", 1)
    pct = round(len(lessons) / total * 100)
    progress_db[key] = {"completed_lessons": list(lessons), "progress_pct": pct}
    return progress_db[key]

# ─── CERTIFICATE ROUTES ───────────────────────────────────────────────────────
@app.post("/certificates/generate/{course_id}")
def generate_certificate(course_id: str, user=Depends(get_current_user)):
    course = courses_db.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    key = f"{user['sub']}:{course_id}"
    cert_id = f"SKP-{datetime.utcnow().strftime('%Y')}-{uuid.uuid4().hex[:6].upper()}"
    cert = {
        "id": cert_id,
        "user_email": user["email"],
        "course_id": course_id,
        "course_title": course["title"],
        "issued_at": datetime.utcnow().isoformat(),
        "valid": True,
    }
    certificates_db[cert_id] = cert
    return cert

@app.get("/certificates/download/{cert_id}")
def download_certificate(cert_id: str, user=Depends(get_current_user)):
    """Returns certificate data — frontend generates PDF using jsPDF"""
    cert = certificates_db.get(cert_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return cert

@app.get("/certificates/user")
def user_certificates(user=Depends(get_current_user)):
    return [c for c in certificates_db.values() if c["user_email"] == user["email"]]

# ─── AI ADVISOR ROUTE ─────────────────────────────────────────────────────────
@app.post("/advisor/chat")
async def advisor_chat(data: ChatMessage, user=Depends(get_current_user)):
    """
    In production: integrate Gemini API here.
    pip install google-generativeai
    import google.generativeai as genai
    genai.configure(api_key="YOUR_GEMINI_API_KEY")
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    """
    msg = data.message.lower()
    if any(w in msg for w in ["career","job","path","role"]):
        reply = "Based on your profile, I recommend exploring Data Engineering or ML Engineering. Key skills: Python, SQL, Spark, and cloud (AWS/GCP). Want a step-by-step 90-day plan?"
    elif any(w in msg for w in ["course","learn","study","skill"]):
        reply = "I'd suggest: 1) Complete ML with Python first (you're 65% done!), 2) Pick up AWS basics, 3) System Design for interviews. This combo opens ₹10-18 LPA roles."
    elif any(w in msg for w in ["salary","pay","lpa","package"]):
        reply = "With Python + ML + SQL skills, expect ₹6-10 LPA fresher, ₹12-20 LPA with 2 yrs exp. Bangalore/Hyderabad markets are strongest right now."
    elif any(w in msg for w in ["resume","cv","interview"]):
        reply = "Top resume tips: 1) Quantify achievements (improved accuracy by 15%), 2) Add GitHub with 2-3 ML projects, 3) List frameworks not just languages. Want a template?"
    else:
        reply = f"Great question! As a {user.get('role','learner')}, I'd focus on building hands-on projects alongside your courses. Which area interests you most — data, backend, or AI?"
    return {"reply": reply, "timestamp": datetime.utcnow().isoformat()}

# ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────
@app.get("/admin/users")
def admin_get_users(user=Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    return [{"email": e, **{k:v for k,v in u.items() if k!="password"}} for e,u in users_db.items()]

@app.get("/admin/stats")
def admin_stats(user=Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    return {
        "total_users": len(users_db),
        "total_courses": len(courses_db),
        "total_certificates": len(certificates_db),
        "published_courses": sum(1 for c in courses_db.values() if c.get("published")),
    }

@app.delete("/admin/users/{email}")
def admin_delete_user(email: str, user=Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    if email not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    del users_db[email]
    return {"message": "User deleted"}

@app.get("/")
def root():
    return {"message": "SkillPath AI API is running 🚀", "docs": "/docs"}

# ─── SKILL GAP & CAREER ROUTES ────────────────────────────────────────────────
from ml.recommender import recommend_careers, analyze_skill_gap, generate_study_plan

class SkillsInput(BaseModel):
    skills: List[str]
    top_n: int = 5

class SkillGapInput(BaseModel):
    skills: List[str]
    target_career: str

class StudyPlanInput(BaseModel):
    skills: List[str]
    target_career: str
    months: int = 3

class ResumeTextInput(BaseModel):
    text: str

@app.post("/advisor/recommend")
def get_recommendations(data: SkillsInput, user=Depends(get_current_user)):
    return recommend_careers(data.skills, data.top_n)

@app.post("/advisor/skill-gap")
def get_skill_gap(data: SkillGapInput, user=Depends(get_current_user)):
    return analyze_skill_gap(data.skills, data.target_career)

@app.post("/advisor/study-plan")
def get_study_plan(data: StudyPlanInput, user=Depends(get_current_user)):
    return generate_study_plan(data.skills, data.target_career, data.months)

# ─── RESUME PARSER ROUTES ─────────────────────────────────────────────────────
from fastapi import UploadFile, File
from ml.resume_parser import parse_resume, parse_resume_from_pdf

@app.post("/resume/parse-text")
async def parse_resume_text(data: ResumeTextInput, user=Depends(get_current_user)):
    return parse_resume(data.text)

@app.post("/resume/parse-pdf")
async def parse_resume_pdf(file: UploadFile = File(...), user=Depends(get_current_user)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files accepted")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        result = parse_resume_from_pdf(tmp_path)
    finally:
        import os as _os
        _os.unlink(tmp_path)
    return result

# ─── CERTIFICATE PDF DOWNLOAD ─────────────────────────────────────────────────
@app.get("/certificates/pdf/{cert_id}")
def download_cert_pdf(cert_id: str, user=Depends(get_current_user)):
    """Generate and stream the PDF certificate"""
    cert = certificates_db.get(cert_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    user_data = users_db.get(cert["user_email"], {})
    student_name = user_data.get("name", cert["user_email"])
    
    try:
        from certificate_generator import generate_certificate
        import os
        os.makedirs("certs", exist_ok=True)
        output_path = f"certs/{cert_id}.pdf"
        generate_certificate(
            output_path=output_path,
            student_name=student_name,
            course_title=cert["course_title"],
            cert_id=cert_id,
            issue_date=datetime.fromisoformat(cert["issued_at"]).strftime("%B %d, %Y"),
        )
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename=f"SkillPath-Certificate-{cert_id}.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

# ─── USER PROFILE UPDATE ──────────────────────────────────────────────────────
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None

@app.get("/users/me")
def get_profile(user=Depends(get_current_user)):
    u = users_db.get(user["email"])
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return {k: v for k, v in u.items() if k != "password"}

@app.patch("/users/me")
def update_profile(data: ProfileUpdate, user=Depends(get_current_user)):
    u = users_db.get(user["email"])
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in data.dict(exclude_none=True).items():
        u[field] = value
    users_db[user["email"]] = u
    return {k: v for k, v in u.items() if k != "password"}

# ─── ADMIN PUBLISH/UNPUBLISH ──────────────────────────────────────────────────
@app.patch("/courses/{course_id}/publish")
def toggle_publish(course_id: str, user=Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    course = courses_db.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course["published"] = not course["published"]
    return course

# ─── ENROLL ───────────────────────────────────────────────────────────────────
@app.post("/progress/enroll")
def enroll(data: dict, user=Depends(get_current_user)):
    course_id = data.get("course_id")
    if not courses_db.get(course_id):
        raise HTTPException(status_code=404, detail="Course not found")
    key = f"{user['sub']}:{course_id}"
    if key not in progress_db:
        progress_db[key] = {"completed_lessons": [], "progress_pct": 0, "enrolled_at": datetime.utcnow().isoformat()}
        course = courses_db[course_id]
        course["enrolled_count"] = course.get("enrolled_count", 0) + 1
    return {"enrolled": True, "course_id": course_id}

# ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat(), "version": "1.0.0"}
