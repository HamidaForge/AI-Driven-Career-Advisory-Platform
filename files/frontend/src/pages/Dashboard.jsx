import { useState, useRef } from "react";

// ══════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════
const C = { k:"#354024", m:"#889063", t:"#CFBB99", b:"#E5D7C4", d:"#4C3D19" };

const SKILLS_LIST = ["Python","JavaScript","Java","C++","SQL","R","Machine Learning","Deep Learning","TensorFlow","PyTorch","React","Node.js","HTML/CSS","MongoDB","PostgreSQL","AWS","Azure","GCP","Docker","Kubernetes","Linux","Data Analysis","Pandas","NumPy","Tableau","Power BI","Cybersecurity","Networking","Git","REST APIs","System Design","Flutter","Swift","Kotlin","Figma","Blockchain","NLP","Computer Vision"];
const INTERESTS   = ["Building AI/ML models","Web development","Data analysis & visualization","Cloud infrastructure","Security & ethical hacking","Backend systems","Mobile apps","Research & academia","Automation & DevOps","Freelancing","Game development","Blockchain/Web3","UI/UX Design","IoT & Embedded Systems"];
const EXP_LEVELS  = ["Fresher (0–1 yr)","Junior (1–3 yrs)","Mid-level (3–5 yrs)","Senior (5+ yrs)"];
const EDUCATION   = ["12th / Diploma","B.Tech / B.E.","BCA / B.Sc CS","MCA / M.Tech","MBA / Other PG","Self-taught"];

const COURSES = [
  {id:1,title:"Machine Learning with Python",category:"ML & AI",lessons:14,hours:6,thumb:"🤖",enrolled:true,progress:65,rating:4.9},
  {id:2,title:"Full Stack React & Node.js",category:"Web Dev",lessons:22,hours:9,thumb:"⚛️",enrolled:true,progress:30,rating:4.8},
  {id:3,title:"Data Analysis with Pandas",category:"Data Science",lessons:16,hours:7,thumb:"📊",enrolled:true,progress:10,rating:4.7},
  {id:4,title:"System Design Fundamentals",category:"Engineering",lessons:10,hours:5,thumb:"🏗️",enrolled:false,progress:0,rating:4.9},
  {id:5,title:"AWS Cloud Practitioner",category:"Cloud",lessons:18,hours:8,thumb:"☁️",enrolled:false,progress:0,rating:4.6},
  {id:6,title:"Cybersecurity Essentials",category:"Security",lessons:12,hours:5,thumb:"🔐",enrolled:false,progress:0,rating:4.8},
  {id:7,title:"DevOps with Docker & K8s",category:"DevOps",lessons:15,hours:7,thumb:"🐳",enrolled:false,progress:0,rating:4.7},
  {id:8,title:"Resume & Interview Prep",category:"Career Skills",lessons:8,hours:2,thumb:"📝",enrolled:false,progress:0,rating:4.8},
];
const GRADS = {"ML & AI":"linear-gradient(135deg,#354024,#889063)","Web Dev":"linear-gradient(135deg,#889063,#4C3D19)","Data Science":"linear-gradient(135deg,#4C3D19,#354024)","Engineering":"linear-gradient(135deg,#354024,#CFBB99)","Cloud":"linear-gradient(135deg,#889063,#354024)","Security":"linear-gradient(135deg,#4C3D19,#889063)","DevOps":"linear-gradient(135deg,#354024,#4C3D19)","Career Skills":"linear-gradient(135deg,#889063,#CFBB99)"};
const CATS = ["All","ML & AI","Web Dev","Data Science","Cloud","Security","Engineering","DevOps","Career Skills"];

// ══════════════════════════════════════════════════════════
// CLAUDE API HELPER
// ══════════════════════════════════════════════════════════
async function askClaude(prompt, maxTokens = 1200) { {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }]
    })
  };
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
}

function parseJSON(text) {
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ══════════════════════════════════════════════════════════
// RESUME ANALYZER COMPONENT
// ══════════════════════════════════════════════════════════
function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [activeCheck, setActiveCheck] = useState(null);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    // Read as text (works for .txt; for PDF show paste fallback)
    if (file.type === "text/plain") {
      const text = await file.text();
      setResumeText(text);
    } else {
      setError("Please paste your resume text below (PDF parsing requires backend). Or upload a .txt file.");
    }
  };

  const analyze = async (checkType) => {
    if (!resumeText.trim()) { setError("Please paste or upload resume text first."); return; }
    setLoading(true); setActiveCheck(checkType); setError(""); setResult(null);
    try {
      let prompt = "";
      if (checkType === "career") {
        prompt = `You are an expert career advisor. Analyze this resume and suggest suitable careers.
Resume:
${resumeText.substring(0, 3000)}

Respond ONLY with valid JSON:
{"name":"Person name or 'Candidate'","current_level":"Fresher/Junior/Mid/Senior","top_skills":["skill1","skill2","skill3","skill4","skill5"],"career_matches":[{"career":"Career Title","match_score":92,"reason":"Why this fits","salary":"₹X–Y LPA","demand":"High/Medium/Low"},{"career":"Career Title","match_score":85,"reason":"Why","salary":"₹X–Y LPA","demand":"High"},{"career":"Career Title","match_score":75,"reason":"Why","salary":"₹X–Y LPA","demand":"Medium"},{"career":"Career Title","match_score":65,"reason":"Why","salary":"₹X–Y LPA","demand":"Medium"}],"skill_gaps":["gap1","gap2","gap3"],"immediate_actions":["action1","action2","action3"]}`;
      } else if (checkType === "aws") {
        prompt = `You are an AWS certification expert. Analyze this resume for AWS readiness.
Resume:
${resumeText.substring(0, 3000)}

Respond ONLY with valid JSON:
{"aws_score":72,"aws_ready":true,"current_aws_skills":["skill1","skill2"],"missing_aws_skills":["skill1","skill2","skill3"],"recommended_certification":"AWS Solutions Architect Associate","cert_path":["Cert 1","Cert 2","Cert 3"],"study_time":"3–4 months","strengths":["strength1","strength2"],"gaps":["gap1","gap2"],"job_roles":["AWS Cloud Engineer","DevOps Engineer"],"verdict":"One sentence honest verdict"}`;
      } else if (checkType === "rate") {
        prompt = `You are a professional resume reviewer and HR expert. Rate this resume comprehensively.
Resume:
${resumeText.substring(0, 3000)}

Respond ONLY with valid JSON:
{"overall_score":78,"grade":"B+","sections":{"format":85,"content":80,"keywords":70,"impact":75,"ats_score":72},"strengths":["strength1","strength2","strength3"],"improvements":["improvement1","improvement2","improvement3","improvement4"],"missing_sections":["section1","section2"],"ats_issues":["issue1","issue2"],"power_words_missing":["word1","word2","word3"],"quantification_score":65,"summary":"2-3 sentence honest assessment","quick_wins":["Quick fix 1","Quick fix 2","Quick fix 3"]}`;
      } else if (checkType === "interview") {
        prompt = `You are a senior technical interviewer. Based on this resume generate likely interview questions.
Resume:
${resumeText.substring(0, 3000)}

Respond ONLY with valid JSON:
{"technical_questions":["Q1","Q2","Q3","Q4","Q5"],"behavioral_questions":["Q1","Q2","Q3"],"project_questions":["Q1","Q2","Q3"],"tricky_questions":["Q1","Q2"],"preparation_tips":["tip1","tip2","tip3"],"likely_role":"Most likely target role","difficulty":"Easy/Medium/Hard"}`;
      }

      const text = await askClaude(prompt, 1200);
      setResult({ type: checkType, data: parseJSON(text) });
    } catch(e) {
      setError("Analysis failed: " + e.message);
    }
    setLoading(false);
  };

  const scoreColor = (s) => s >= 80 ? C.k : s >= 60 ? C.m : "#7f1d1d";
  const scoreGrad  = (s) => s >= 80 ? "linear-gradient(135deg,#354024,#889063)" : s >= 60 ? "linear-gradient(135deg,#889063,#CFBB99)" : "linear-gradient(135deg,#7f1d1d,#b91c1c)";

  return (
    <div>
      {/* Upload area */}
      <div
        onClick={() => fileRef.current.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        style={{border:`2px dashed ${fileName ? C.m : "rgba(53,64,36,0.25)"}`,borderRadius:16,padding:"28px 20px",textAlign:"center",cursor:"pointer",background:fileName?"rgba(136,144,99,0.06)":"rgba(53,64,36,0.03)",marginBottom:16,transition:"all .2s"}}>
        <div style={{fontSize:36,marginBottom:8}}>📄</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:C.k,marginBottom:4}}>
          {fileName ? `✅ ${fileName}` : "Drop your resume here or click to upload"}
        </div>
        <div style={{fontSize:12,color:C.m,fontWeight:500}}>Supports .txt files · Or paste text below</div>
        <input ref={fileRef} type="file" accept=".txt,.pdf" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
      </div>

      <textarea
        value={resumeText}
        onChange={e=>setResumeText(e.target.value)}
        placeholder="📋 Paste your resume text here (or upload above)..."
        style={{width:"100%",minHeight:140,background:C.t,border:`2px solid rgba(53,64,36,0.18)`,borderRadius:12,padding:"13px 15px",color:C.k,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",resize:"vertical",boxSizing:"border-box",fontWeight:500,marginBottom:16}}
      />

      {error && <div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:10,padding:"11px 15px",color:"#7f1d1d",fontSize:13,marginBottom:14,fontWeight:500}}>{error}</div>}

      {/* Action buttons */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:11,marginBottom:22}}>
        {[
          {id:"career", icon:"🎯", label:"Suggest Careers", desc:"AI matches your resume to careers"},
          {id:"aws",    icon:"☁️", label:"AWS Readiness Check", desc:"Check if resume is AWS-friendly"},
          {id:"rate",   icon:"⭐", label:"Rate My Resume", desc:"Score + ATS + improvement tips"},
          {id:"interview", icon:"🎤", label:"Interview Prep", desc:"AI generates likely questions"},
        ].map(btn => (
          <button key={btn.id} onClick={() => analyze(btn.id)} disabled={loading}
            style={{background:activeCheck===btn.id&&result?"linear-gradient(135deg,#354024,#889063)":C.t,border:`1.5px solid ${activeCheck===btn.id&&result?C.k:"rgba(53,64,36,0.2)"}`,borderRadius:14,padding:"15px 14px",cursor:loading?"not-allowed":"pointer",textAlign:"left",transition:"all .2s",opacity:loading&&activeCheck!==btn.id?0.5:1}}>
            <div style={{fontSize:22,marginBottom:5}}>{btn.icon}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:activeCheck===btn.id&&result?C.b:C.k}}>{btn.label}</div>
            <div style={{fontSize:11,color:activeCheck===btn.id&&result?"rgba(229,215,196,0.8)":C.m,marginTop:3,fontWeight:500}}>{btn.desc}</div>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{textAlign:"center",padding:"28px",background:C.t,borderRadius:16,marginBottom:20}}>
          <div style={{fontSize:32,marginBottom:10,animation:"spin 1s linear infinite",display:"inline-block"}}>⏳</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:C.k,marginBottom:4}}>Claude AI is analyzing your resume...</div>
          <div style={{fontSize:12,color:C.m,fontWeight:500}}>This takes 10–20 seconds</div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {!loading && result && (

        <div style={{animation:"fadein .4s ease both"}}>

          {/* CAREER SUGGESTIONS */}
          {result.type === "career" && (
            <div>
              <div style={{background:`linear-gradient(135deg,${C.k},${C.m})`,borderRadius:18,padding:"22px 24px",marginBottom:16,boxShadow:`0 8px 28px rgba(53,64,36,0.28)`}}>
                <div style={{fontSize:11,letterSpacing:"2px",color:"rgba(229,215,196,0.7)",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Resume Analysis</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.b,marginBottom:4}}>{result.data.name}</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:8}}>
                  <span style={{background:"rgba(229,215,196,0.15)",borderRadius:20,padding:"4px 13px",fontSize:12,color:C.b,fontWeight:600}}>📊 {result.data.current_level}</span>
                  {result.data.top_skills?.map(s=><span key={s} style={{background:"rgba(229,215,196,0.1)",borderRadius:20,padding:"4px 11px",fontSize:11,color:C.t,fontWeight:500}}>{s}</span>)}
                </div>
              </div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.k,marginBottom:12}}>Best Career Matches 🎯</div>
              <div style={{display:"flex",flexDirection:"column",gap:11,marginBottom:18}}>
                {result.data.career_matches?.map((c,i)=>(
                  <div key={c.career} style={{background:C.t,border:`1.5px solid rgba(53,64,36,${i===0?0.25:0.12})`,borderRadius:14,padding:"16px 18px",display:"flex",gap:14,alignItems:"center",boxShadow:i===0?"0 4px 16px rgba(53,64,36,0.12)":"none"}}>
                    <div style={{textAlign:"center",minWidth:56}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:scoreColor(c.match_score)}}>{c.match_score}%</div>
                      {i===0&&<div style={{fontSize:9,color:C.m,fontWeight:700,letterSpacing:"1px"}}>TOP PICK</div>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.k}}>{c.career}</div>
                        <span style={{background:c.demand==="High"?"rgba(53,64,36,0.12)":"rgba(136,144,99,0.15)",borderRadius:20,padding:"2px 9px",fontSize:10,color:c.demand==="High"?C.k:C.m,fontWeight:700}}>{c.demand} demand</span>
                      </div>
                      <div style={{fontSize:12,color:C.d,lineHeight:1.5,fontWeight:500,marginBottom:4}}>{c.reason}</div>
                      <div style={{fontSize:12,color:C.m,fontWeight:600}}>💰 {c.salary}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{background:C.t,border:`1.5px solid rgba(53,64,36,0.12)`,borderRadius:14,padding:"16px"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:11}}>Skills to add 📈</div>
                  {result.data.skill_gaps?.map((s,i)=><div key={s} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{width:20,height:20,borderRadius:"50%",background:"rgba(53,64,36,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.m,flexShrink:0}}>{i+1}</span><span style={{fontSize:13,color:C.k,fontWeight:500}}>{s}</span></div>)}
                </div>
                <div style={{background:C.t,border:`1.5px solid rgba(53,64,36,0.12)`,borderRadius:14,padding:"16px"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:11}}>Immediate actions ⚡</div>
                  {result.data.immediate_actions?.map((a,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}><span style={{color:C.m,flexShrink:0,marginTop:1}}>→</span><span style={{fontSize:12,color:C.d,lineHeight:1.5,fontWeight:500}}>{a}</span></div>)}
                </div>
              </div>
            </div>
          )}

          {/* AWS READINESS */}
          {result.type === "aws" && (
            <div>
              <div style={{background:`linear-gradient(135deg,${C.k},#232f3e)`,borderRadius:18,padding:"24px",marginBottom:16,boxShadow:"0 8px 28px rgba(53,64,36,0.3)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                  <div>
                    <div style={{fontSize:11,letterSpacing:"2px",color:"rgba(229,215,196,0.7)",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>AWS Readiness Report</div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.b,marginBottom:6}}>{result.data.recommended_certification}</div>
                    <div style={{fontSize:13,color:C.t,fontWeight:500}}>{result.data.verdict}</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{width:80,height:80,borderRadius:"50%",background:scoreGrad(result.data.aws_score),display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:C.b,lineHeight:1}}>{result.data.aws_score}</div>
                      <div style={{fontSize:9,color:"rgba(229,215,196,0.8)",fontWeight:600}}>/ 100</div>
                    </div>
                    <div style={{fontSize:11,color:C.t,marginTop:6,fontWeight:600}}>{result.data.aws_ready?"✅ AWS Ready":"⚠️ Not Yet Ready"}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
                  <div style={{background:"rgba(229,215,196,0.1)",borderRadius:10,padding:"8px 14px",flex:1,minWidth:120}}>
                    <div style={{fontSize:10,color:"rgba(229,215,196,0.6)",marginBottom:3,fontWeight:500}}>Study time</div>
                    <div style={{fontSize:14,fontWeight:700,color:C.b}}>{result.data.study_time}</div>
                  </div>
                  <div style={{background:"rgba(229,215,196,0.1)",borderRadius:10,padding:"8px 14px",flex:2,minWidth:200}}>
                    <div style={{fontSize:10,color:"rgba(229,215,196,0.6)",marginBottom:5,fontWeight:500}}>Target job roles</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{result.data.job_roles?.map(r=><span key={r} style={{background:"rgba(229,215,196,0.15)",borderRadius:20,padding:"2px 10px",fontSize:11,color:C.b,fontWeight:500}}>{r}</span>)}</div>
                  </div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:11}}>✅ AWS Skills You Have</div>
                  {result.data.current_aws_skills?.length ? result.data.current_aws_skills.map(s=><div key={s} style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}><span style={{color:C.m}}>✓</span><span style={{fontSize:13,color:C.k,fontWeight:500}}>{s}</span></div>) : <div style={{fontSize:12,color:C.m}}>No AWS skills detected yet</div>}
                </div>
                <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:11}}>📚 Skills to Learn</div>
                  {result.data.missing_aws_skills?.map((s,i)=><div key={s} style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}><span style={{width:18,height:18,borderRadius:"50%",background:"rgba(53,64,36,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.m,flexShrink:0}}>{i+1}</span><span style={{fontSize:13,color:C.k,fontWeight:500}}>{s}</span></div>)}
                </div>
              </div>
              <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:11}}>🗺 Certification Path</div>
                <div style={{display:"flex",gap:0,alignItems:"center",flexWrap:"wrap"}}>
                  {result.data.cert_path?.map((cert,i)=>(
                    <div key={cert} style={{display:"flex",alignItems:"center",gap:0}}>
                      <div style={{background:i===0?"linear-gradient(135deg,#354024,#889063)":"rgba(53,64,36,0.08)",border:`1.5px solid ${i===0?C.k:"rgba(53,64,36,0.15)"}`,borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:700,color:i===0?C.b:C.k}}>{cert}</div>
                      {i<result.data.cert_path.length-1&&<div style={{fontSize:16,color:C.m,margin:"0 6px"}}>→</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RESUME RATING */}
          {result.type === "rate" && (
            <div>
              <div style={{background:`linear-gradient(135deg,${C.k},${C.m})`,borderRadius:18,padding:"24px",marginBottom:16,boxShadow:"0 8px 28px rgba(53,64,36,0.28)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                  <div>
                    <div style={{fontSize:11,letterSpacing:"2px",color:"rgba(229,215,196,0.7)",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Resume Score</div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:38,fontWeight:700,color:C.b,lineHeight:1}}>{result.data.overall_score}<span style={{fontSize:18}}>/100</span></div>
                    <div style={{display:"inline-block",background:"rgba(229,215,196,0.15)",borderRadius:20,padding:"4px 16px",fontSize:16,fontWeight:800,color:C.b,marginTop:6}}>{result.data.grade}</div>
                  </div>
                  <div style={{fontSize:13,color:C.t,lineHeight:1.65,maxWidth:340,fontWeight:500}}>{result.data.summary}</div>
                </div>
              </div>
              <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"18px",marginBottom:14}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:14}}>Detailed Scores</div>
                {Object.entries(result.data.sections||{}).map(([key,val])=>(
                  <div key={key} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:13,color:C.k,fontWeight:600,textTransform:"capitalize"}}>{key.replace(/_/g," ")}</span>
                      <span style={{fontSize:12,color:scoreColor(val),fontWeight:700}}>{val}/100</span>
                    </div>
                    <div style={{background:"rgba(53,64,36,0.1)",borderRadius:5,height:7}}>
                      <div style={{width:`${val}%`,height:7,borderRadius:5,background:scoreGrad(val),transition:"width .8s ease"}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:10}}>✅ Strengths</div>
                  {result.data.strengths?.map((s,i)=><div key={i} style={{display:"flex",gap:7,marginBottom:7,alignItems:"flex-start"}}><span style={{color:C.m,flexShrink:0}}>✓</span><span style={{fontSize:12,color:C.d,lineHeight:1.5,fontWeight:500}}>{s}</span></div>)}
                </div>
                <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:10}}>⚡ Quick Wins</div>
                  {result.data.quick_wins?.map((w,i)=><div key={i} style={{display:"flex",gap:7,marginBottom:7,alignItems:"flex-start"}}><span style={{color:C.m,flexShrink:0}}>→</span><span style={{fontSize:12,color:C.d,lineHeight:1.5,fontWeight:500}}>{w}</span></div>)}
                </div>
              </div>
              <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:10}}>🤖 ATS Issues to Fix</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {result.data.ats_issues?.map(i=><span key={i} style={{background:"rgba(127,29,29,0.08)",border:"1px solid rgba(127,29,29,0.2)",borderRadius:20,padding:"4px 13px",fontSize:12,color:"#7f1d1d",fontWeight:500}}>{i}</span>)}
                </div>
                {result.data.power_words_missing?.length>0&&(
                  <div style={{marginTop:12}}>
                    <div style={{fontSize:12,color:C.m,fontWeight:600,marginBottom:6}}>Add these power words:</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{result.data.power_words_missing?.map(w=><span key={w} style={{background:"rgba(136,144,99,0.15)",border:"1px solid rgba(136,144,99,0.3)",borderRadius:20,padding:"3px 11px",fontSize:12,color:C.k,fontWeight:600}}>{w}</span>)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INTERVIEW PREP */}
          {result.type === "interview" && (
            <div>
              <div style={{background:`linear-gradient(135deg,${C.k},${C.m})`,borderRadius:18,padding:"22px 24px",marginBottom:16}}>
                <div style={{fontSize:11,letterSpacing:"2px",color:"rgba(229,215,196,0.7)",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Interview Preparation</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.b,marginBottom:4}}>Target Role: {result.data.likely_role}</div>
                <span style={{background:"rgba(229,215,196,0.15)",borderRadius:20,padding:"4px 14px",fontSize:12,color:C.b,fontWeight:600}}>Difficulty: {result.data.difficulty}</span>
              </div>
              {[["💻 Technical Questions","technical_questions"],["🤝 Behavioral Questions","behavioral_questions"],["📁 Project Questions","project_questions"],["🧠 Tricky Questions","tricky_questions"]].map(([label,key])=>(
                <div key={key} style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px",marginBottom:12}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:10}}>{label}</div>
                  {result.data[key]?.map((q,i)=>(
                    <div key={i} style={{display:"flex",gap:10,marginBottom:9,padding:"10px 12px",background:"rgba(53,64,36,0.04)",borderRadius:10,borderLeft:`3px solid ${C.m}`}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.m,flexShrink:0}}>Q{i+1}</span>
                      <span style={{fontSize:13,color:C.k,lineHeight:1.55,fontWeight:500}}>{q}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:10}}>💡 Preparation Tips</div>
                {result.data.preparation_tips?.map((t,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}><span style={{color:C.m,flexShrink:0,fontWeight:700}}>✦</span><span style={{fontSize:13,color:C.d,lineHeight:1.5,fontWeight:500}}>{t}</span></div>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// AI CAREER ADVISOR (SKILL-BASED)
// ══════════════════════════════════════════════════════════
function AIAdvisor() {
  const [step, setStep]                   = useState(1);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [experience, setExperience]       = useState("");
  const [education, setEducation]         = useState("");
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);
  const [error, setError]                 = useState("");
  const [chat, setChat]                   = useState([]);
  const [chatInput, setChatInput]         = useState("");
  const [chatLoading, setChatLoading]     = useState(false);

  const toggle = (arr, setArr, val) => setArr(p => p.includes(val) ? p.filter(x=>x!==val) : [...p,val]);

  const analyze = async () => {
    setLoading(true); setError("");
    try {
      const prompt = `Expert AI career advisor for India. Profile: Skills: ${selectedSkills.join(", ")}. Interests: ${selectedInterests.join(", ")}. Experience: ${experience}. Education: ${education}.
Respond ONLY with valid JSON:
{"top_career":"Title","match_score":85,"why":"2-3 sentences","salary_range":"₹X–Y LPA","time_to_job":"X months","alternative_careers":[{"title":"C","match":75,"reason":"why"},{"title":"C","match":65,"reason":"why"},{"title":"C","match":55,"reason":"why"}],"skill_gaps":["s1","s2","s3","s4"],"recommended_courses":[{"name":"C","platform":"P","duration":"X wks","priority":"High"},{"name":"C","platform":"P","duration":"X wks","priority":"Medium"},{"name":"C","platform":"P","duration":"X wks","priority":"Medium"}],"action_plan":["Month 1: act","Month 2: act","Month 3: act"],"job_titles":["T1","T2","T3","T4"]}`;
      const text = await askClaude(prompt, 1200);
      const parsed = parseJSON(text);
      setResult(parsed);
      setChat([{role:"ai",text:`I've analyzed your profile! You're a strong fit for **${parsed.top_career}** with a ${parsed.match_score}% match. Ask me anything!`}]);
      setStep(4);
    } catch(e) { setError("Analysis failed: " + e.message); }
    setLoading(false);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim(); setChatInput(""); setChatLoading(true);
    setChat(c => [...c, {role:"user",text:msg}]);
    try {
      const text = await askClaude(`Career advisor. User: Skills:${selectedSkills.join(",")}. Career:${result?.top_career}. Question: ${msg}. Answer in 3-4 sentences for Indian job market.`, 500);
      setChat(c => [...c, {role:"ai",text}]);
    } catch(e) { setChat(c => [...c, {role:"ai",text:"Connection error. Try again."}]); }
    setChatLoading(false);
  };

  return (
    <div>
      <style>{`.chip{padding:7px 15px;border-radius:20px;font-size:12px;cursor:pointer;border:1.5px solid rgba(53,64,36,0.2);background:#CFBB99;color:#889063;font-family:'DM Sans',sans-serif;font-weight:500;transition:all .2s}.chip:hover{border-color:#354024;color:#354024}.chip.on{background:#354024;border-color:#354024;color:#E5D7C4;font-weight:700}.nbtn{background:#354024;border:none;border-radius:11px;padding:12px 26px;color:#E5D7C4;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 4px 14px rgba(53,64,36,0.3)}.nbtn:disabled{background:#CFBB99;color:#889063;box-shadow:none;cursor:not-allowed}.bbtn{background:#CFBB99;border:1.5px solid rgba(53,64,36,0.2);border-radius:11px;padding:12px 20px;color:#354024;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif}.chatbox{max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:9px;padding:13px;background:#E5D7C4;border-radius:13px;border:1.5px solid rgba(53,64,36,0.12);margin-bottom:9px}`}</style>

      {step<4&&<div style={{display:"flex",alignItems:"center",gap:0,marginBottom:24}}>{[1,2,3].map((s,i)=><div key={s} style={{display:"flex",alignItems:"center",flex:i<2?1:"none"}}><div style={{width:30,height:30,borderRadius:"50%",background:step>=s?C.k:"rgba(53,64,36,0.1)",color:step>=s?C.b:C.m,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0,boxShadow:step===s?"0 0 0 4px rgba(53,64,36,0.15)":"none",transition:"all .3s"}}>{step>s?"✓":s}</div>{i<2&&<div style={{flex:1,height:2,background:step>s?C.m:"rgba(53,64,36,0.12)",transition:"all .3s"}}/>}</div>)}</div>}

      {step===1&&<div><div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:C.k,marginBottom:4}}>Your Skills 🛠</div><div style={{fontSize:13,color:C.m,marginBottom:16,fontWeight:500}}>Select all you know</div><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18}}>{SKILLS_LIST.map(s=><button key={s} className={`chip ${selectedSkills.includes(s)?"on":""}`} onClick={()=>toggle(selectedSkills,setSelectedSkills,s)}>{s}</button>)}</div><button className="nbtn" disabled={!selectedSkills.length} onClick={()=>setStep(2)}>Next →</button></div>}

      {step===2&&<div><div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:C.k,marginBottom:4}}>Your Interests 🎯</div><div style={{fontSize:13,color:C.m,marginBottom:16,fontWeight:500}}>What excites you?</div><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18}}>{INTERESTS.map(i=><button key={i} className={`chip ${selectedInterests.includes(i)?"on":""}`} onClick={()=>toggle(selectedInterests,setSelectedInterests,i)}>{i}</button>)}</div><div style={{display:"flex",gap:10}}><button className="bbtn" onClick={()=>setStep(1)}>← Back</button><button className="nbtn" disabled={!selectedInterests.length} onClick={()=>setStep(3)}>Next →</button></div></div>}

      {step===3&&<div><div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:C.k,marginBottom:4}}>Background 🎓</div><div style={{fontSize:13,color:C.m,marginBottom:18,fontWeight:500}}>Helps personalize your roadmap</div><div style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:700,color:C.k,marginBottom:9}}>Experience level</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{EXP_LEVELS.map(e=><button key={e} className={`chip ${experience===e?"on":""}`} onClick={()=>setExperience(e)}>{e}</button>)}</div></div><div style={{marginBottom:22}}><div style={{fontSize:13,fontWeight:700,color:C.k,marginBottom:9}}>Education</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{EDUCATION.map(e=><button key={e} className={`chip ${education===e?"on":""}`} onClick={()=>setEducation(e)}>{e}</button>)}</div></div>{error&&<div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:10,padding:"11px",color:"#7f1d1d",fontSize:13,marginBottom:12,fontWeight:500}}>{error}</div>}<div style={{display:"flex",gap:10}}><button className="bbtn" onClick={()=>setStep(2)}>← Back</button><button className="nbtn" disabled={loading||!experience||!education} onClick={analyze}>{loading?"⏳ Analyzing...":"✦ Get Career Report"}</button></div></div>}

      {step===4&&result&&<div style={{animation:"fadein .4s ease both"}}>
        <div style={{background:`linear-gradient(135deg,${C.k},${C.m})`,borderRadius:18,padding:"22px 24px",marginBottom:16,boxShadow:"0 8px 28px rgba(53,64,36,0.28)"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <div style={{flex:1}}><div style={{fontSize:10,letterSpacing:"2px",color:"rgba(229,215,196,0.7)",textTransform:"uppercase",fontWeight:600,marginBottom:5}}>Your Best Career Match</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:C.b,marginBottom:6}}>{result.top_career}</div><div style={{fontSize:13,color:C.t,lineHeight:1.6,maxWidth:400,fontWeight:500}}>{result.why}</div></div>
            <div style={{textAlign:"center",minWidth:70}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:44,fontWeight:800,color:C.b,lineHeight:1}}>{result.match_score}%</div><div style={{fontSize:10,color:C.t,fontWeight:600,letterSpacing:"1px"}}>AI MATCH</div></div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
            <div style={{background:"rgba(229,215,196,0.1)",borderRadius:10,padding:"9px 14px",flex:1,minWidth:110}}><div style={{fontSize:10,color:C.t,marginBottom:2,fontWeight:500}}>💰 Salary</div><div style={{fontSize:14,fontWeight:700,color:C.b}}>{result.salary_range}</div></div>
            <div style={{background:"rgba(229,215,196,0.1)",borderRadius:10,padding:"9px 14px",flex:1,minWidth:110}}><div style={{fontSize:10,color:C.t,marginBottom:2,fontWeight:500}}>⏱ Timeline</div><div style={{fontSize:14,fontWeight:700,color:C.b}}>{result.time_to_job}</div></div>
            <div style={{background:"rgba(229,215,196,0.1)",borderRadius:10,padding:"9px 14px",flex:2,minWidth:180}}><div style={{fontSize:10,color:C.t,marginBottom:4,fontWeight:500}}>🎯 Job titles</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{result.job_titles?.map(t=><span key={t} style={{background:"rgba(229,215,196,0.15)",borderRadius:20,padding:"2px 9px",fontSize:10,color:C.b,fontWeight:500}}>{t}</span>)}</div></div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:11}}>Alternative Careers 🔀</div>{result.alternative_careers?.map(c=><div key={c.title} style={{display:"flex",gap:10,marginBottom:10,paddingBottom:10,borderBottom:"1px solid rgba(53,64,36,0.08)",alignItems:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:c.match>=70?C.k:C.m,minWidth:40,textAlign:"center"}}>{c.match}%</div><div><div style={{fontSize:12,fontWeight:700,color:C.k}}>{c.title}</div><div style={{fontSize:11,color:C.m,lineHeight:1.4,fontWeight:500}}>{c.reason}</div></div></div>)}</div>
          <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:11}}>Skills to Learn 📈</div>{result.skill_gaps?.map((s,i)=><div key={s} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{width:20,height:20,borderRadius:"50%",background:"rgba(53,64,36,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.m,flexShrink:0}}>{i+1}</div><div style={{flex:1}}><div style={{fontSize:12,color:C.k,fontWeight:600,marginBottom:3}}>{s}</div><div style={{background:"rgba(53,64,36,0.08)",borderRadius:3,height:4}}><div style={{width:`${85-i*15}%`,height:4,borderRadius:3,background:`linear-gradient(90deg,${C.k},${C.m})`}}/></div></div></div>)}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:11}}>Recommended Courses 🎓</div>{result.recommended_courses?.map(c=><div key={c.name} style={{marginBottom:11,paddingBottom:11,borderBottom:"1px solid rgba(53,64,36,0.08)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}><div style={{fontSize:12,fontWeight:700,color:C.k}}>{c.name}</div><span style={{background:c.priority==="High"?C.k:C.m,borderRadius:20,padding:"2px 8px",fontSize:9,color:C.b,fontWeight:700}}>{c.priority}</span></div><div style={{fontSize:11,color:C.m,fontWeight:500}}>{c.platform} · {c.duration}</div></div>)}</div>
          <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:11}}>3-Month Plan 🗓</div>{result.action_plan?.map((a,i)=><div key={i} style={{display:"flex",gap:9,marginBottom:11,paddingBottom:11,borderBottom:"1px solid rgba(53,64,36,0.08)"}}><div style={{width:22,height:22,borderRadius:"50%",background:`linear-gradient(135deg,${C.k},${C.m})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.b,flexShrink:0}}>{i+1}</div><div style={{fontSize:12,color:C.k,lineHeight:1.5,fontWeight:500}}>{a}</div></div>)}</div>
        </div>
        <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.15)",borderRadius:14,padding:"16px"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:12}}>✦ Ask your AI Advisor <span style={{fontSize:11,color:C.m,fontWeight:500}}>· Claude AI</span></div>
          <div className="chatbox">{chat.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}><div style={{maxWidth:"80%",background:m.role==="user"?C.k:C.b,borderRadius:m.role==="user"?"13px 13px 4px 13px":"13px 13px 13px 4px",padding:"10px 14px",fontSize:13,color:m.role==="user"?C.b:C.k,lineHeight:1.6,fontWeight:500}}>{m.role==="ai"&&<div style={{fontSize:9,color:C.m,marginBottom:3,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px"}}>SkillPath AI</div>}{m.text}</div></div>)}{chatLoading&&<div style={{display:"flex"}}><div style={{background:C.b,borderRadius:"13px 13px 13px 4px",padding:"10px 14px",fontSize:13,color:C.m}}>Thinking...</div></div>}</div>
          <div style={{display:"flex",gap:9,marginBottom:9}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Ask about salary, skills, interviews..." style={{flex:1,background:C.b,border:`2px solid rgba(53,64,36,0.2)`,borderRadius:11,padding:"10px 14px",color:C.k,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}/><button onClick={sendChat} disabled={chatLoading} style={{background:C.k,border:"none",borderRadius:11,padding:"10px 16px",color:C.b,fontSize:16,cursor:"pointer"}}>→</button></div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["First job tips?","Expected salary?","Portfolio ideas?","Companies that hire?"].map(q=><button key={q} onClick={()=>setChatInput(q)} style={{background:"rgba(53,64,36,0.08)",border:`1.5px solid rgba(53,64,36,0.15)`,borderRadius:20,padding:"4px 12px",color:C.k,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{q}</button>)}</div>
        </div>
        <button onClick={()=>{setStep(1);setResult(null);setSelectedSkills([]);setSelectedInterests([]);setExperience("");setEducation("");setChat([]);}} style={{marginTop:12,background:"rgba(53,64,36,0.08)",border:`1.5px solid rgba(53,64,36,0.2)`,borderRadius:11,padding:"10px 20px",color:C.k,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>↺ Start over</button>
      </div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// FEEDBACK COMPONENT
// ══════════════════════════════════════════════════════════
function Feedback() {
  const [rating, setRating]     = useState(0);
  const [hover, setHover]       = useState(0);
  const [category, setCategory] = useState("");
  const [message, setMessage]   = useState("");
  const [name, setName]         = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState([
    {name:"Priya S.",rating:5,category:"AI Advisor",message:"The career recommendation was spot on! Helped me decide between ML and Data Engineering.",date:"2 days ago"},
    {name:"Rahul V.",rating:4,category:"Resume Analyzer",message:"AWS readiness check was really detailed. Found gaps I didn't know I had.",date:"5 days ago"},
    {name:"Ananya K.",rating:5,category:"Courses",message:"Certificates download perfectly. Great quality content!",date:"1 week ago"},
  ]);

  const submit = () => {
    if (!rating || !category || !message.trim()) return;
    setFeedbacks(f => [{name:name||"Anonymous",rating,category,message,date:"Just now"},...f]);
    setSubmitted(true);
  };

  if (submitted) return (
    <div style={{textAlign:"center",padding:"48px 24px"}}>
      <div style={{fontSize:52,marginBottom:16}}>🙏</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.k,marginBottom:8}}>Thank you for your feedback!</div>
      <div style={{fontSize:14,color:C.m,marginBottom:24,fontWeight:500}}>Your feedback helps us make SkillPath AI better for everyone.</div>
      <button onClick={()=>setSubmitted(false)} style={{background:C.k,border:"none",borderRadius:11,padding:"11px 24px",color:C.b,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Give more feedback</button>
    </div>
  );

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        {/* Form */}
        <div style={{background:C.t,border:`1.5px solid rgba(53,64,36,0.12)`,borderRadius:18,padding:"24px"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.k,marginBottom:18}}>Share your experience ✍️</div>
          {/* Star rating */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:13,fontWeight:600,color:C.k,marginBottom:8}}>Your rating</div>
            <div style={{display:"flex",gap:6}}>
              {[1,2,3,4,5].map(s=>(
                <button key={s} onClick={()=>setRating(s)} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)}
                  style={{fontSize:28,background:"none",border:"none",cursor:"pointer",transition:"transform .1s",transform:(hover||rating)>=s?"scale(1.2)":"scale(1)",filter:(hover||rating)>=s?"none":"grayscale(1) opacity(0.4)"}}>⭐</button>
              ))}
              {rating>0&&<span style={{fontSize:13,color:C.m,fontWeight:600,alignSelf:"center",marginLeft:6}}>{["","Poor","Fair","Good","Great","Excellent"][rating]}</span>}
            </div>
          </div>
          {/* Category */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:600,color:C.k,marginBottom:8}}>Feature</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {["AI Advisor","Resume Analyzer","Courses","Certificates","Overall Platform"].map(cat=>(
                <button key={cat} onClick={()=>setCategory(cat)}
                  style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${category===cat?C.k:"rgba(53,64,36,0.2)"}`,background:category===cat?C.k:C.b,color:category===cat?C.b:C.m,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:category===cat?700:500,transition:"all .2s"}}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name (optional)" style={{width:"100%",background:C.b,border:`2px solid rgba(53,64,36,0.18)`,borderRadius:10,padding:"10px 13px",color:C.k,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif",marginBottom:11,boxSizing:"border-box",fontWeight:500}}/>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Tell us what you liked or how we can improve..." style={{width:"100%",minHeight:110,background:C.b,border:`2px solid rgba(53,64,36,0.18)`,borderRadius:10,padding:"10px 13px",color:C.k,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",resize:"vertical",boxSizing:"border-box",marginBottom:14,fontWeight:500}}/>
          <button onClick={submit} disabled={!rating||!category||!message.trim()}
            style={{width:"100%",background:(!rating||!category||!message.trim())?"rgba(53,64,36,0.1)":C.k,border:"none",borderRadius:11,padding:"13px",color:(!rating||!category||!message.trim())?C.m:C.b,fontSize:14,fontWeight:700,cursor:(!rating||!category||!message.trim())?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s"}}>
            Submit Feedback →
          </button>
        </div>
        {/* Reviews */}
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:C.k,marginBottom:14}}>What others say 💬</div>
          <div style={{display:"flex",flexDirection:"column",gap:11,maxHeight:440,overflowY:"auto"}}>
            {feedbacks.map((f,i)=>(
              <div key={i} style={{background:C.t,border:`1.5px solid rgba(53,64,36,0.12)`,borderRadius:14,padding:"16px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.k},${C.m})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.b}}>{f.name[0]}</div>
                    <div><div style={{fontSize:13,fontWeight:700,color:C.k}}>{f.name}</div><div style={{fontSize:10,color:C.m,fontWeight:500}}>{f.date}</div></div>
                  </div>
                  <div>{"⭐".repeat(f.rating)}</div>
                </div>
                <span style={{background:"rgba(53,64,36,0.1)",borderRadius:20,padding:"2px 10px",fontSize:10,color:C.k,fontWeight:700,display:"inline-block",marginBottom:7}}>{f.category}</span>
                <div style={{fontSize:13,color:C.d,lineHeight:1.6,fontWeight:500}}>{f.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MOCK INTERVIEW SIMULATOR
// ══════════════════════════════════════════════════════════
function MockInterview() {
  const [role, setRole]         = useState("");
  const [level, setLevel]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [session, setSession]   = useState(null);
  const [qIndex, setQIndex]     = useState(0);
  const [answer, setAnswer]     = useState("");
  const [feedback, setFeedback] = useState(null);
  const [fbLoading, setFbLoading] = useState(false);
  const [done, setDone]         = useState(false);
  const [scores, setScores]     = useState([]);

  const ROLES = ["Software Engineer","Data Scientist","ML Engineer","Frontend Developer","Backend Developer","DevOps Engineer","Cloud Architect","Cybersecurity Analyst","Product Manager","Data Analyst"];
  const LEVELS = ["Fresher","Junior","Mid-level","Senior"];

  const startInterview = async () => {
    setLoading(true);
    try {
      const text = await askClaude(`Generate 5 interview questions for a ${level} ${role} position in India. Mix technical and behavioral. Respond ONLY with JSON: {"questions":[{"q":"Question?","type":"Technical/Behavioral","hint":"brief hint what good answer covers"}]}`, 800);
      const data = parseJSON(text);
      setSession(data); setQIndex(0); setAnswer(""); setFeedback(null); setDone(false); setScores([]);
    } catch(e) { alert("Failed: " + e.message); }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setFbLoading(true);
    try {
      const q = session.questions[qIndex];
      const text = await askClaude(`Interview question: "${q.q}" for ${level} ${role}. Candidate answer: "${answer}". Rate out of 10 and give feedback. Respond ONLY with JSON: {"score":7,"verdict":"Good/Average/Needs Work","good_points":["p1","p2"],"missing_points":["m1","m2"],"model_answer":"Brief ideal answer in 2-3 sentences"}`, 600);
      const fb = parseJSON(text);
      setFeedback(fb);
      setScores(s => [...s, fb.score]);
    } catch(e) { alert("Failed: " + e.message); }
    setFbLoading(false);
  };

  const nextQ = () => {
    if (qIndex >= session.questions.length - 1) { setDone(true); return; }
    setQIndex(i => i+1); setAnswer(""); setFeedback(null);
  };

  const avgScore = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10) : 0;
  const scoreC = (s) => s >= 7 ? C.k : s >= 5 ? C.m : "#7f1d1d";

  if (done) return (
    <div style={{textAlign:"center",padding:"32px 20px"}}>
      <div style={{fontSize:48,marginBottom:12}}>🎯</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.k,marginBottom:6}}>Interview Complete!</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:40,fontWeight:800,color:scoreC(avgScore/10),marginBottom:4}}>{avgScore}/100</div>
      <div style={{fontSize:14,color:C.m,marginBottom:6,fontWeight:500}}>Average interview score</div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20,flexWrap:"wrap"}}>
        {scores.map((s,i)=><div key={i} style={{background:s>=7?`rgba(53,64,36,0.1)`:`rgba(136,144,99,0.15)`,border:`1.5px solid ${scoreC(s)}`,borderRadius:10,padding:"8px 14px",fontSize:13,fontWeight:700,color:scoreC(s)}}>Q{i+1}: {s}/10</div>)}
      </div>
      <div style={{fontSize:14,color:C.d,marginBottom:24,fontWeight:500}}>
        {avgScore >= 70 ? "Excellent! You're ready for interviews 🚀" : avgScore >= 50 ? "Good progress! Keep practicing 💪" : "Keep practicing — you're improving! 📚"}
      </div>
      <button onClick={()=>{setSession(null);setDone(false);setScores([]);setRole("");setLevel("");}} style={{background:C.k,border:"none",borderRadius:11,padding:"12px 26px",color:C.b,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Try Another Interview</button>
    </div>
  );

  return (
    <div>
      {!session ? (
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.k,marginBottom:5}}>AI Mock Interview 🎤</div>
          <div style={{fontSize:13,color:C.m,marginBottom:22,fontWeight:500}}>Practice with AI-generated questions & get instant feedback</div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:C.k,marginBottom:9}}>Select Role</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {ROLES.map(r=><button key={r} onClick={()=>setRole(r)} style={{padding:"7px 15px",borderRadius:20,border:`1.5px solid ${role===r?C.k:"rgba(53,64,36,0.2)"}`,background:role===r?C.k:C.t,color:role===r?C.b:C.m,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:role===r?700:500,transition:"all .2s"}}>{r}</button>)}
            </div>
          </div>
          <div style={{marginBottom:22}}>
            <div style={{fontSize:13,fontWeight:700,color:C.k,marginBottom:9}}>Experience Level</div>
            <div style={{display:"flex",gap:8}}>
              {LEVELS.map(l=><button key={l} onClick={()=>setLevel(l)} style={{padding:"7px 18px",borderRadius:20,border:`1.5px solid ${level===l?C.k:"rgba(53,64,36,0.2)"}`,background:level===l?C.k:C.t,color:level===l?C.b:C.m,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:level===l?700:500,transition:"all .2s"}}>{l}</button>)}
            </div>
          </div>
          <button onClick={startInterview} disabled={!role||!level||loading}
            style={{background:(!role||!level)?"rgba(53,64,36,0.1)":C.k,border:"none",borderRadius:11,padding:"13px 28px",color:(!role||!level)?C.m:C.b,fontSize:14,fontWeight:700,cursor:(!role||!level)||loading?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:(!role||!level)?"none":"0 4px 14px rgba(53,64,36,0.3)"}}>
            {loading?"⏳ Generating questions...":"🎤 Start Mock Interview"}
          </button>
        </div>
      ) : (
        <div>
          {/* Progress */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.k}}>Question {qIndex+1} of {session.questions.length}</div>
            <div style={{display:"flex",gap:5}}>{session.questions.map((_,i)=><div key={i} style={{width:28,height:6,borderRadius:3,background:i<qIndex?"#889063":i===qIndex?C.k:"rgba(53,64,36,0.12)",transition:"all .3s"}}/>)}</div>
          </div>
          {/* Question */}
          <div style={{background:`linear-gradient(135deg,${C.k},${C.m})`,borderRadius:16,padding:"22px",marginBottom:16}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{background:"rgba(229,215,196,0.15)",borderRadius:8,padding:"4px 10px",fontSize:11,color:C.t,fontWeight:700,flexShrink:0}}>{session.questions[qIndex]?.type}</span>
            </div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:C.b,lineHeight:1.5,marginTop:10}}>{session.questions[qIndex]?.q}</div>
            <div style={{fontSize:12,color:"rgba(229,215,196,0.7)",marginTop:8,fontWeight:500}}>💡 Hint: {session.questions[qIndex]?.hint}</div>
          </div>
          {/* Answer */}
          {!feedback && (
            <>
              <textarea value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Type your answer here... Take your time, think it through." style={{width:"100%",minHeight:130,background:C.t,border:`2px solid rgba(53,64,36,0.18)`,borderRadius:12,padding:"13px 15px",color:C.k,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",resize:"vertical",boxSizing:"border-box",marginBottom:12,fontWeight:500}}/>
              <button onClick={submitAnswer} disabled={!answer.trim()||fbLoading}
                style={{background:(!answer.trim())?"rgba(53,64,36,0.1)":C.k,border:"none",borderRadius:11,padding:"12px 26px",color:(!answer.trim())?C.m:C.b,fontSize:14,fontWeight:700,cursor:(!answer.trim())||fbLoading?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                {fbLoading?"⏳ AI is evaluating...":"Submit Answer →"}
              </button>
            </>
          )}
          {/* Feedback */}
          {feedback && (
            <div style={{animation:"fadein .3s ease both"}}>
              <div style={{background:feedback.score>=7?`rgba(53,64,36,0.1)`:feedback.score>=5?`rgba(136,144,99,0.15)`:`rgba(127,29,29,0.08)`,border:`1.5px solid ${scoreC(feedback.score)}`,borderRadius:14,padding:"18px",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,color:scoreC(feedback.score)}}>{feedback.score}/10</div>
                  <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:C.k}}>{feedback.verdict}</div><div style={{fontSize:12,color:C.m,fontWeight:500}}>AI Evaluation</div></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div><div style={{fontSize:12,fontWeight:700,color:C.k,marginBottom:6}}>✅ Good points</div>{feedback.good_points?.map((p,i)=><div key={i} style={{fontSize:12,color:C.d,marginBottom:4,display:"flex",gap:6}}><span style={{color:C.m,flexShrink:0}}>✓</span>{p}</div>)}</div>
                  <div><div style={{fontSize:12,fontWeight:700,color:C.k,marginBottom:6}}>⚠️ Could improve</div>{feedback.missing_points?.map((p,i)=><div key={i} style={{fontSize:12,color:C.d,marginBottom:4,display:"flex",gap:6}}><span style={{color:"#889063",flexShrink:0}}>→</span>{p}</div>)}</div>
                </div>
                <div style={{background:"rgba(53,64,36,0.06)",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.m,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px"}}>Model Answer</div>
                  <div style={{fontSize:13,color:C.k,lineHeight:1.6,fontWeight:500}}>{feedback.model_answer}</div>
                </div>
              </div>
              <button onClick={nextQ} style={{background:C.k,border:"none",borderRadius:11,padding:"12px 26px",color:C.b,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(53,64,36,0.3)"}}>
                {qIndex>=session.questions.length-1?"See Results 🏁":"Next Question →"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SALARY INSIGHTS
// ══════════════════════════════════════════════════════════
function SalaryInsights() {
  const [role, setRole]     = useState("");
  const [city, setCity]     = useState("");
  const [exp, setExp]       = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData]     = useState(null);
  const ROLES2 = ["Software Engineer","Data Scientist","ML Engineer","Frontend Developer","Backend Developer","DevOps Engineer","Cloud Architect","Product Manager","UI/UX Designer","Data Analyst","Cybersecurity Analyst","Blockchain Developer"];
  const CITIES = ["Bangalore","Mumbai","Hyderabad","Chennai","Pune","Delhi/NCR","Kolkata","Remote"];
  const EXPS   = ["0–1 yr","1–3 yrs","3–5 yrs","5–8 yrs","8+ yrs"];

  const getSalary = async () => {
    setLoading(true);
    try {
      const text = await askClaude(`Indian tech salary expert. Role: ${role}, City: ${city}, Experience: ${exp}. Respond ONLY with JSON: {"min_salary":"₹X LPA","max_salary":"₹Y LPA","avg_salary":"₹Z LPA","fresher_salary":"₹A LPA","senior_salary":"₹B LPA","top_companies":[{"name":"Co","salary":"₹X–Y LPA","rating":"★4.2"}],"negotiation_tips":["tip1","tip2","tip3"],"in_demand_skills":["skill1","skill2","skill3"],"growth_rate":"X% YoY","market_verdict":"Hot/Stable/Cooling","bonus_info":"typical bonus info"}`, 800);
      setData(parseJSON(text));
    } catch(e) { alert("Failed: " + e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.k,marginBottom:5}}>Salary Insights 💰</div>
      <div style={{fontSize:13,color:C.m,marginBottom:20,fontWeight:500}}>Real-time AI salary data for Indian tech market</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:18}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.k,marginBottom:8}}>Role</div>
          <select value={role} onChange={e=>setRole(e.target.value)} style={{width:"100%",background:C.t,border:`2px solid rgba(53,64,36,0.18)`,borderRadius:10,padding:"10px 13px",color:C.k,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>
            <option value="">Select role</option>
            {ROLES2.map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.k,marginBottom:8}}>City</div>
          <select value={city} onChange={e=>setCity(e.target.value)} style={{width:"100%",background:C.t,border:`2px solid rgba(53,64,36,0.18)`,borderRadius:10,padding:"10px 13px",color:C.k,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>
            <option value="">Select city</option>
            {CITIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.k,marginBottom:8}}>Experience</div>
          <select value={exp} onChange={e=>setExp(e.target.value)} style={{width:"100%",background:C.t,border:`2px solid rgba(53,64,36,0.18)`,borderRadius:10,padding:"10px 13px",color:C.k,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>
            <option value="">Select exp</option>
            {EXPS.map(e=><option key={e}>{e}</option>)}
          </select>
        </div>
      </div>
      <button onClick={getSalary} disabled={!role||!city||!exp||loading}
        style={{background:(!role||!city||!exp)?"rgba(53,64,36,0.1)":C.k,border:"none",borderRadius:11,padding:"12px 26px",color:(!role||!city||!exp)?C.m:C.b,fontSize:14,fontWeight:700,cursor:(!role||!city||!exp)||loading?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:20,boxShadow:(!role||!city||!exp)?"none":"0 4px 14px rgba(53,64,36,0.3)"}}>
        {loading?"⏳ Fetching AI salary data...":"💰 Get Salary Report"}
      </button>
      {data && (
        <div style={{animation:"fadein .4s ease both"}}>
          <div style={{background:`linear-gradient(135deg,${C.k},${C.m})`,borderRadius:18,padding:"22px 24px",marginBottom:16}}>
            <div style={{fontSize:11,letterSpacing:"2px",color:"rgba(229,215,196,0.7)",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>{role} · {city} · {exp}</div>
            <div style={{display:"flex",gap:18,flexWrap:"wrap",marginBottom:12}}>
              {[["Min",data.min_salary],["Average",data.avg_salary],["Max",data.max_salary]].map(([l,v])=>(
                <div key={l}><div style={{fontSize:11,color:"rgba(229,215,196,0.6)",marginBottom:3,fontWeight:500}}>{l}</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:C.b}}>{v}</div></div>
              ))}
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <span style={{background:"rgba(229,215,196,0.15)",borderRadius:20,padding:"4px 14px",fontSize:12,color:C.b,fontWeight:600}}>📈 {data.growth_rate} growth</span>
              <span style={{background:"rgba(229,215,196,0.15)",borderRadius:20,padding:"4px 14px",fontSize:12,color:C.b,fontWeight:600}}>🔥 Market: {data.market_verdict}</span>
              <span style={{background:"rgba(229,215,196,0.15)",borderRadius:20,padding:"4px 14px",fontSize:12,color:C.b,fontWeight:600}}>🎁 {data.bonus_info}</span>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:12}}>Top Companies Hiring</div>
              {data.top_companies?.map(co=>(
                <div key={co.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,paddingBottom:10,borderBottom:"1px solid rgba(53,64,36,0.08)"}}>
                  <div><div style={{fontSize:13,fontWeight:700,color:C.k}}>{co.name}</div><div style={{fontSize:11,color:C.m,fontWeight:500}}>{co.rating}</div></div>
                  <div style={{fontSize:12,fontWeight:700,color:C.m}}>{co.salary}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:14,padding:"16px"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:12}}>Negotiation Tips 🤝</div>
              {data.negotiation_tips?.map((t,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:9,alignItems:"flex-start"}}><span style={{color:C.m,fontWeight:700,flexShrink:0}}>{i+1}.</span><span style={{fontSize:12,color:C.d,lineHeight:1.5,fontWeight:500}}>{t}</span></div>)}
              <div style={{marginTop:12}}><div style={{fontSize:12,fontWeight:700,color:C.k,marginBottom:7}}>Skills that boost salary:</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{data.in_demand_skills?.map(s=><span key={s} style={{background:"rgba(53,64,36,0.1)",borderRadius:20,padding:"3px 10px",fontSize:11,color:C.k,fontWeight:600}}>{s}</span>)}</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════
const TABS = [
  {id:"home",       label:"Home",         icon:"⊞"},
  {id:"courses",    label:"Courses",      icon:"📚"},
  {id:"advisor",    label:"AI Advisor",   icon:"✦"},
  {id:"resume",     label:"Resume AI",    icon:"📄"},
  {id:"interview",  label:"Mock Interview",icon:"🎤"},
  {id:"salary",     label:"Salary",       icon:"💰"},
  {id:"certs",      label:"Certificates", icon:"🏅"},
  {id:"feedback",   label:"Feedback",     icon:"💬"},
  {id:"profile",    label:"Profile",      icon:"◎"},
];

export default function Dashboard({ user, onLogout, onCourse }) {
  const [tab, setTab]       = useState("home");
  const [search, setSearch] = useState("");
  const [cat, setCat]       = useState("All");
  const filtered = COURSES.filter(c => (cat==="All"||c.category===cat) && c.title.toLowerCase().includes(search.toLowerCase()));
  const enrolled = COURSES.filter(c => c.enrolled);

  return (
    <div style={{minHeight:"100vh",background:C.b,fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .tb{background:none;border:none;color:#CFBB99;cursor:pointer;padding:8px 13px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;border-radius:10px;transition:all .2s;white-space:nowrap;display:flex;align-items:center;gap:6px}
        .tb:hover{color:#E5D7C4;background:rgba(229,215,196,0.1)}
        .tb.on{color:#354024;background:#889063;font-weight:700}
        .cc{background:#CFBB99;border:1.5px solid rgba(53,64,36,0.15);border-radius:18px;overflow:hidden;cursor:pointer;transition:all .3s}
        .cc:hover{border-color:#354024;transform:translateY(-4px);box-shadow:0 12px 36px rgba(53,64,36,0.18)}
        .sc{background:#CFBB99;border:1.5px solid rgba(53,64,36,0.12);border-radius:16px;padding:20px;transition:all .2s}
        .sc:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(53,64,36,0.1)}
      `}</style>

      <header style={{background:C.k,padding:"12px 24px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 20px rgba(53,64,36,0.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:30,height:30,borderRadius:8,background:C.m,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🌿</div>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:C.b}}>SkillPath<span style={{color:C.m}}>AI</span></span>
        </div>
        <nav style={{display:"flex",gap:2,overflowX:"auto",flex:1,scrollbarWidth:"none"}}>
          {TABS.map(t=><button key={t.id} className={`tb ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}><span style={{fontSize:12}}>{t.icon}</span>{t.label}</button>)}
        </nav>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:C.m,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.k}}>{(user.name||user.email||"U")[0].toUpperCase()}</div>
          <button onClick={onLogout} style={{background:"rgba(229,215,196,0.12)",border:"1.5px solid rgba(229,215,196,0.2)",borderRadius:7,padding:"6px 12px",color:C.t,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:500,whiteSpace:"nowrap"}}>Logout</button>
        </div>
      </header>

      <main style={{padding:"24px 28px 48px",maxWidth:1100,margin:"0 auto",width:"100%",boxSizing:"border-box",animation:"slideUp .4s ease both"}}>

        {tab==="home"&&<>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:C.k,margin:"0 0 3px"}}>Hey, {user.name?.split(" ")[0]||"Learner"} 👋</h1>
          <p style={{color:C.m,fontSize:13,margin:"0 0 22px",fontWeight:500}}>Your AI-powered career platform is ready.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
            {[{val:"3",label:"Active courses",icon:"📚",g:`linear-gradient(135deg,${C.k},${C.m})`},{val:"2",label:"Certificates",icon:"🏅",g:`linear-gradient(135deg,${C.m},${C.t})`},{val:"65%",label:"Avg progress",icon:"📈",g:`linear-gradient(135deg,${C.d},${C.m})`},{val:"850",label:"Skill score",icon:"⚡",g:`linear-gradient(135deg,${C.k},${C.d})`}].map(({val,label,icon,g})=>(
              <div key={label} className="sc">
                <div style={{width:38,height:38,borderRadius:10,background:g,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,marginBottom:10,boxShadow:"0 3px 10px rgba(53,64,36,0.18)"}}>{icon}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:C.k}}>{val}</div>
                <div style={{fontSize:11,color:C.m,marginTop:2,fontWeight:500}}>{label}</div>
              </div>
            ))}
          </div>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:C.k,marginBottom:13}}>Continue learning <span style={{background:C.k,color:C.t,fontSize:10,padding:"3px 10px",borderRadius:20,marginLeft:7,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>All Free ✓</span></h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:13,marginBottom:24}}>
            {enrolled.map(c=>(
              <div key={c.id} className="cc" onClick={()=>onCourse(c)}>
                <div style={{height:76,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,background:GRADS[c.category]}}>{c.thumb}</div>
                <div style={{padding:"13px 15px"}}>
                  <span style={{background:"rgba(53,64,36,0.12)",color:C.k,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>{c.category}</span>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:C.k,margin:"6px 0 3px",lineHeight:1.4}}>{c.title}</div>
                  <div style={{fontSize:11,color:C.m,marginBottom:8,fontWeight:500}}>⭐ {c.rating} · {c.lessons} lessons</div>
                  <div style={{background:"rgba(53,64,36,0.12)",borderRadius:4,height:5,marginBottom:3}}><div style={{width:`${c.progress}%`,height:5,borderRadius:4,background:`linear-gradient(90deg,${C.k},${C.m})`}}/></div>
                  <div style={{fontSize:10,color:C.m,fontWeight:500}}>{c.progress}% complete</div>
                </div>
              </div>
            ))}
          </div>
          {/* Feature grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {[
              {icon:"📄",title:"Resume AI",desc:"Upload resume → get career matches, ATS score, AWS readiness",tab:"resume",color:C.k},
              {icon:"✦",title:"AI Career Advisor",desc:"Select skills → Claude AI recommends perfect career + roadmap",tab:"advisor",color:C.m},
              {icon:"🎤",title:"Mock Interview",desc:"Practice with AI questions, get instant feedback & scores",tab:"interview",color:C.d},
              {icon:"💰",title:"Salary Insights",desc:"Real AI salary data for any role, city & experience level",tab:"salary",color:C.k},
              {icon:"💬",title:"Give Feedback",desc:"Rate features and help us improve the platform",tab:"feedback",color:C.m},
              {icon:"🏅",title:"Certificates",desc:"Complete courses → download verified PDF certificates",tab:"certs",color:C.d},
            ].map(f=>(
              <div key={f.title} onClick={()=>setTab(f.tab)} style={{background:C.t,border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:16,padding:"18px 16px",cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                <div style={{fontSize:24,marginBottom:8}}>{f.icon}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,marginBottom:4}}>{f.title}</div>
                <div style={{fontSize:11,color:C.m,lineHeight:1.5,fontWeight:500}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </>}

        {tab==="courses"&&<>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.k,margin:"0 0 16px"}}>All Courses <span style={{color:C.m,fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>· 100% Free</span></h1>
          <input placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",background:C.t,border:`2px solid rgba(53,64,36,0.18)`,borderRadius:11,padding:"10px 14px",color:C.k,fontSize:13,outline:"none",marginBottom:12,boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}/>
          <div style={{display:"flex",gap:7,overflowX:"auto",marginBottom:18,paddingBottom:3}}>
            {CATS.map(c=><button key={c} onClick={()=>setCat(c)} style={{padding:"6px 15px",borderRadius:20,border:`1.5px solid ${cat===c?C.k:"rgba(53,64,36,0.2)"}`,background:cat===c?C.k:C.t,color:cat===c?C.b:C.m,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:cat===c?700:500,whiteSpace:"nowrap",transition:"all .2s"}}>{c}</button>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:13}}>
            {filtered.map(c=>(
              <div key={c.id} className="cc" onClick={()=>onCourse(c)}>
                <div style={{height:86,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,background:GRADS[c.category]}}>{c.thumb}</div>
                <div style={{padding:"14px 16px"}}>
                  <span style={{background:"rgba(53,64,36,0.12)",color:C.k,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>{c.category}</span>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k,margin:"6px 0 3px",lineHeight:1.4}}>{c.title}</div>
                  <div style={{fontSize:11,color:C.m,marginBottom:12,fontWeight:500}}>⭐ {c.rating} · {c.lessons} lessons · {c.hours} hrs</div>
                  {c.enrolled
                    ?<button style={{width:"100%",padding:"8px",borderRadius:9,border:`2px solid ${C.k}`,background:"transparent",color:C.k,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Continue →</button>
                    :<button style={{width:"100%",padding:"8px",borderRadius:9,border:"none",background:`linear-gradient(135deg,${C.k},${C.m})`,color:C.b,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Enroll Free →</button>}
                </div>
              </div>
            ))}
          </div>
        </>}

        {tab==="advisor"&&<>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:22}}>
            <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.k},${C.m})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,boxShadow:"0 4px 14px rgba(53,64,36,0.3)"}}>✦</div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.k}}>AI Career Advisor</div>
              <div style={{fontSize:12,color:C.m,fontWeight:500}}>Select your skills → Claude AI gives personalized career roadmap</div>
            </div>
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5,background:"rgba(53,64,36,0.08)",borderRadius:20,padding:"5px 12px"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:C.m,display:"inline-block"}}/>
              <span style={{fontSize:11,color:C.k,fontWeight:600}}>Claude AI Online</span>
            </div>
          </div>
          <AIAdvisor/>
        </>}

        {tab==="resume"&&<>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:22}}>
            <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.k},${C.m})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,boxShadow:"0 4px 14px rgba(53,64,36,0.3)"}}>📄</div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.k}}>Resume AI Analyzer</div>
              <div style={{fontSize:12,color:C.m,fontWeight:500}}>Upload resume → career suggestions · AWS check · rating · interview prep</div>
            </div>
          </div>
          <ResumeAnalyzer/>
        </>}

        {tab==="interview"&&<>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:22}}>
            <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.k},${C.m})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,boxShadow:"0 4px 14px rgba(53,64,36,0.3)"}}>🎤</div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.k}}>AI Mock Interview</div>
              <div style={{fontSize:12,color:C.m,fontWeight:500}}>Practice interviews with instant AI feedback & scoring</div>
            </div>
          </div>
          <MockInterview/>
        </>}

        {tab==="salary"&&<>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:22}}>
            <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.k},${C.m})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,boxShadow:"0 4px 14px rgba(53,64,36,0.3)"}}>💰</div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.k}}>Salary Insights</div>
              <div style={{fontSize:12,color:C.m,fontWeight:500}}>AI-powered salary data for Indian tech market</div>
            </div>
          </div>
          <SalaryInsights/>
        </>}

        {tab==="certs"&&<>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.k,margin:"0 0 18px"}}>My Certificates 🏅</h1>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:22}}>
            {[{name:"Python for Beginners",date:"Jan 12, 2025",code:"SKP-2025-0112AB"},{name:"SQL & Database Fundamentals",date:"Feb 28, 2025",code:"SKP-2025-0228CD"}].map(c=>(
              <div key={c.code} style={{background:C.t,border:`1.5px solid rgba(53,64,36,0.15)`,borderRadius:14,padding:"17px 20px",display:"flex",alignItems:"center",gap:13,flexWrap:"wrap"}}>
                <div style={{width:46,height:46,background:`linear-gradient(135deg,${C.k},${C.m})`,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21}}>🏅</div>
                <div style={{flex:1}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.k}}>{c.name}</div><div style={{fontSize:11,color:C.m,marginTop:2,fontWeight:500}}>Issued {c.date} · ID: {c.code}</div></div>
                <button style={{padding:"8px 15px",borderRadius:9,background:C.k,border:"none",color:C.b,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>⬇ Download</button>
              </div>
            ))}
          </div>
          <div style={{background:`linear-gradient(135deg,${C.k},${C.m})`,borderRadius:14,padding:"20px",textAlign:"center"}}>
            <div style={{fontSize:26,marginBottom:7}}>🎯</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:C.b,marginBottom:4}}>Complete courses to earn more</div>
            <div style={{fontSize:12,color:C.t,marginBottom:14,fontWeight:500}}>Pass final quiz → Certificate PDF downloads instantly</div>
            <button onClick={()=>setTab("courses")} style={{background:C.b,border:"none",borderRadius:10,padding:"9px 20px",color:C.k,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Browse courses →</button>
          </div>
        </>}

        {tab==="feedback"&&<>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:22}}>
            <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.k},${C.m})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,boxShadow:"0 4px 14px rgba(53,64,36,0.3)"}}>💬</div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.k}}>Feedback</div>
              <div style={{fontSize:12,color:C.m,fontWeight:500}}>Help us improve SkillPath AI for everyone</div>
            </div>
          </div>
          <Feedback/>
        </>}

        {tab==="profile"&&<>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.k,margin:"0 0 18px"}}>My Profile</h1>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{background:C.t,border:`1.5px solid rgba(53,64,36,0.15)`,borderRadius:17,padding:"22px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${C.k},${C.m})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:C.b}}>{(user.name||user.email||"U")[0].toUpperCase()}</div>
                <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.k}}>{user.name||"Learner"}</div><div style={{fontSize:12,color:C.m,fontWeight:500}}>{user.role||"Student"}</div></div>
              </div>
              {[["Email",user.email||"—"],["Role",user.role||"Student"],["Member since","April 2025"],["Certificates","2 earned"],["Courses active","3"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid rgba(53,64,36,0.1)",paddingBottom:10,marginBottom:10}}>
                  <span style={{fontSize:12,color:C.m,fontWeight:500}}>{k}</span>
                  <span style={{fontSize:13,color:C.k,fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{background:C.t,border:`1.5px solid rgba(53,64,36,0.15)`,borderRadius:17,padding:"22px"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.k,marginBottom:15}}>My Skills</div>
              {[["Python",85],["Machine Learning",60],["SQL",75],["React",40],["Data Analysis",50]].map(([s,v])=>(
                <div key={s} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,color:C.k,fontWeight:600}}>{s}</span><span style={{fontSize:11,color:C.m,fontWeight:500}}>{v}%</span></div>
                  <div style={{background:"rgba(53,64,36,0.1)",borderRadius:4,height:6}}><div style={{width:`${v}%`,height:6,borderRadius:4,background:`linear-gradient(90deg,${C.k},${C.m})`}}/></div>
                </div>
              ))}
            </div>
          </div>
        </>}

      </main>
    </div>
  );
}