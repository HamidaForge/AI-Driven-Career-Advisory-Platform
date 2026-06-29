# SkillPath AI — Full Stack Career Advisory Platform

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind (zero external UI libs)
- **Backend**: FastAPI (Python) — async, fast, auto-docs at /docs
- **ML**: scikit-learn cosine similarity recommender
- **PDF Certs**: ReportLab
- **DB**: PostgreSQL (in-memory dict for dev)
- **AI Chat**: Gemini API (plug in key)
- **Auth**: JWT + bcrypt

---

## Quick Start

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt --break-system-packages
uvicorn main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

### 3. Database (PostgreSQL)
```bash
psql -U postgres -c "CREATE DATABASE skillpath;"
psql -U postgres -d skillpath -f ../data/schema.sql
```

### 4. Generate a sample certificate (standalone)
```bash
cd backend
python certificate_generator.py
# Output: certs/sample_certificate.pdf
```

### 5. Test ML recommender
```bash
cd backend
python ml/recommender.py
```

---

## Credentials

| Role  | Email             | Password   | Note               |
|-------|-------------------|------------|--------------------|
| User  | any email         | any pass   | Auto-registers     |
| Admin | any email         | any pass   | Admin key: admin123|

---

## Project Structure
```
skillpath/
├── frontend/
│   └── src/
│       ├── App.jsx                  ← Router (state-based)
│       └── pages/
│           ├── Landing.jsx          ← Login / Signup page
│           ├── Dashboard.jsx        ← Student dashboard (5 tabs)
│           ├── CoursePage.jsx       ← Course player + quiz + cert
│           └── AdminDashboard.jsx   ← Admin (users/courses/analytics)
├── backend/
│   ├── main.py                      ← FastAPI app + all routes
│   ├── certificate_generator.py     ← ReportLab PDF generator
│   ├── requirements.txt
│   └── ml/
│       └── recommender.py           ← Cosine similarity career matcher
└── data/
    └── schema.sql                   ← Full PostgreSQL schema
```

---

## API Endpoints

| Method | Path                          | Auth     | Description              |
|--------|-------------------------------|----------|--------------------------|
| POST   | /auth/register                | None     | Register user            |
| POST   | /auth/login                   | None     | Login (user/admin)       |
| GET    | /courses                      | None     | List all courses         |
| GET    | /courses/{id}                 | None     | Single course            |
| POST   | /courses                      | Admin    | Create course            |
| DELETE | /courses/{id}                 | Admin    | Delete course            |
| GET    | /progress/{course_id}         | User     | Get lesson progress      |
| POST   | /progress                     | User     | Update lesson progress   |
| POST   | /certificates/generate/{id}   | User     | Generate certificate     |
| GET    | /certificates/user            | User     | My certificates          |
| GET    | /certificates/download/{id}   | User     | Download cert data       |
| POST   | /advisor/chat                 | User     | AI career chat           |
| GET    | /admin/users                  | Admin    | All users                |
| GET    | /admin/stats                  | Admin    | Platform stats           |
| DELETE | /admin/users/{email}          | Admin    | Remove user              |

---

## Adding Gemini AI (Free)

1. Get API key: https://aistudio.google.com/app/apikey
2. In `backend/main.py`, replace the `/advisor/chat` route:

```python
import google.generativeai as genai
genai.configure(api_key="YOUR_KEY_HERE")
model = genai.GenerativeModel('gemini-pro')

@app.post("/advisor/chat")
async def advisor_chat(data: ChatMessage, user=Depends(get_current_user)):
    prompt = f"""You are an AI career advisor on SkillPath AI platform.
User role: {user.get('role', 'Student')}
User message: {data.message}
Give practical, concise career advice. Mention specific courses when relevant."""
    response = model.generate_content(prompt)
    return {"reply": response.text}
```

---

## Deploying Free

| Service     | What             | URL                    |
|-------------|------------------|------------------------|
| Render.com  | Backend (FastAPI)| render.com             |
| Vercel      | Frontend (React) | vercel.com             |
| Supabase    | PostgreSQL DB    | supabase.com           |
| All free tier — no credit card needed for small projects |
