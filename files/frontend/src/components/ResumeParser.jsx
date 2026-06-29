import { useState, useRef } from "react";

export default function ResumeParser({ onSkillsExtracted }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const inputRef = useRef();

  const DEMO_RESULT = {
    name: "Priya Sharma",
    email: "priya@example.com",
    skills: ["python", "machine_learning", "sql", "pandas", "statistics", "docker", "git"],
    skill_count: 7,
    experience_years: 0.5,
    current_role: "Data Science Intern",
    education: ["B.Tech Computer Science Engineering | Anna University | 2021 | 8.5 CGPA"],
    grade: "8.5 cgpa",
    resume_score: 72,
    career_recommendations: [
      { career: "Data Scientist", match_score: 68.4 },
      { career: "ML Engineer", match_score: 54.2 },
      { career: "Data Analyst", match_score: 49.7 },
    ],
  };

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
  };

  const parse = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    // Demo mode — in production POST to /resume/parse-pdf or /resume/parse-text
    setResult(DEMO_RESULT);
    if (onSkillsExtracted) onSkillsExtracted(DEMO_RESULT.skills);
    setLoading(false);
  };

  const scoreColor = s => s >= 80 ? "#10b981" : s >= 55 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["Upload PDF", false], ["Paste text", true]].map(([label, val]) => (
          <button key={label} onClick={() => { setTextMode(val); setFile(null); setResult(null); }}
            style={{ padding: "8px 18px", borderRadius: 20, border: `1px solid ${textMode === val ? "rgba(99,102,241,.5)" : "rgba(255,255,255,.1)"}`, background: textMode === val ? "rgba(99,102,241,.2)" : "transparent", color: textMode === val ? "#fff" : "rgba(255,255,255,.4)", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            {label}
          </button>
        ))}
      </div>

      {!result && (
        <>
          {!textMode ? (
            /* Drop zone */
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => inputRef.current.click()}
              style={{ border: `2px dashed ${dragging ? "rgba(99,102,241,.7)" : file ? "rgba(16,185,129,.5)" : "rgba(255,255,255,.12)"}`, borderRadius: 16, padding: "40px 24px", textAlign: "center", cursor: "pointer", transition: "all .2s", background: dragging ? "rgba(99,102,241,.05)" : "rgba(255,255,255,.02)", marginBottom: 14 }}
            >
              <input ref={inputRef} type="file" accept=".pdf,.txt" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{file.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📎</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.7)", marginBottom: 6 }}>Drop your resume here</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>PDF or TXT · Max 5MB</div>
                </>
              )}
            </div>
          ) : (
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              style={{ width: "100%", height: 200, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "14px 16px", color: "#fff", fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "vertical", lineHeight: 1.6, marginBottom: 14, boxSizing: "border-box" }}
            />
          )}

          <button
            onClick={parse}
            disabled={loading || (!file && !resumeText.trim())}
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 10, padding: "12px 24px", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", opacity: loading || (!file && !resumeText.trim()) ? 0.5 : 1, width: "100%" }}
          >
            {loading ? "Scanning resume..." : "🔍 Analyse resume"}
          </button>
        </>
      )}

      {result && (
        <div style={{ animation: "slideUp .4s ease both" }}>
          {/* Score */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: `conic-gradient(${scoreColor(result.resume_score)} ${result.resume_score * 3.6}deg, rgba(255,255,255,.08) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#050A14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: scoreColor(result.resume_score) }}>
                {result.resume_score}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "#fff" }}>Resume Score: {result.resume_score}/100</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 3 }}>
                {result.name && `${result.name} · `}{result.current_role || "Profile"} · {result.experience_years > 0 ? `${result.experience_years} yrs exp` : "Fresher"}
              </div>
            </div>
            <button onClick={() => { setResult(null); setFile(null); setResumeText(""); }} style={{ marginLeft: "auto", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,.5)", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>
              Re-upload
            </button>
          </div>

          {/* Extracted skills */}
          <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#a5b4fc", marginBottom: 12 }}>⚡ {result.skill_count} skills detected</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {result.skills.map(s => (
                <span key={s} style={{ background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#a5b4fc" }}>
                  {s.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>

          {/* Career recommendations */}
          <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#fbbf24", marginBottom: 12 }}>🎯 AI career matches from your resume</div>
            {result.career_recommendations.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: ["linear-gradient(135deg,#f59e0b,#d97706)", "linear-gradient(135deg,#9ca3af,#6b7280)", "linear-gradient(135deg,#92400e,#78350f)"][i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 4 }}>{r.career}</div>
                  <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 3, height: 4 }}>
                    <div style={{ width: `${r.match_score}%`, height: 4, borderRadius: 3, background: `linear-gradient(90deg,#6366f1,#8b5cf6)` }} />
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", minWidth: 36 }}>{r.match_score}%</span>
              </div>
            ))}
          </div>

          {/* Education */}
          {result.education?.length > 0 && (
            <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>🎓 Education detected</div>
              {result.education.map((e, i) => <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.5 }}>{e}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
