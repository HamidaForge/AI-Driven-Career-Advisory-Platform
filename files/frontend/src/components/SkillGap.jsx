import { useState } from "react";

const ALL_CAREERS = [
  "Data Scientist","ML Engineer","Data Engineer","Backend Developer",
  "Full Stack Developer","Cloud Architect","DevOps Engineer",
  "Cybersecurity Analyst","Data Analyst","AI Research Engineer",
];

export default function SkillGap({ userSkills = [] }) {
  const [targetCareer, setTargetCareer] = useState("Data Scientist");
  const [gap, setGap] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = () => {
    setLoading(true);
    setTimeout(() => {
      setGap({
        career: targetCareer,
        matched_skills: ["python", "sql", "pandas", "statistics"],
        missing_skills: ["machine_learning", "visualization", "deep_learning"],
        match_pct: 57,
        salary_lpa: 15,
        estimated_learning_weeks: 6,
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <select value={targetCareer} onChange={e => { setTargetCareer(e.target.value); setGap(null); }}
          style={{ flex: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none" }}>
          {ALL_CAREERS.map(c => <option key={c} value={c} style={{ background: "#0d1220" }}>{c}</option>)}
        </select>
        <button onClick={analyze} disabled={loading}
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 10, padding: "13px 24px", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          {loading ? "Analyzing..." : "Analyze gap →"}
        </button>
      </div>
      {gap && (
        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: "#fff" }}>
              Match for {gap.career}
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color: gap.match_pct >= 70 ? "#10b981" : gap.match_pct >= 50 ? "#f59e0b" : "#ef4444" }}>
              {gap.match_pct}%
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 8, height: 10, marginBottom: 20 }}>
            <div style={{ width: gap.match_pct + "%", height: "100%", borderRadius: 8, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6ee7b7", marginBottom: 10 }}>✅ You have</div>
              {gap.matched_skills.map(s => (
                <span key={s} style={{ display: "inline-block", background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#6ee7b7", margin: "3px" }}>
                  {s.replace(/_/g, " ")}
                </span>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#fca5a5", marginBottom: 10 }}>❌ Still need</div>
              {gap.missing_skills.map(s => (
                <span key={s} style={{ display: "inline-block", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#fca5a5", margin: "3px" }}>
                  {s.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,.4)" }}>
            💰 Avg salary: ₹{gap.salary_lpa} LPA · ⏱ {gap.estimated_learning_weeks} weeks to close gap
          </div>
        </div>
      )}
    </div>
  );
}