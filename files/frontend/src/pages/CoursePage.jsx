import { useState } from "react";
import { generateCertPDF } from "../api/certGenerator";

const VIDEOS = {
  1:["aircAruvnKk","PeMlggyqz0Y","ukzFI9rgwfU","nKW8Ndu7Mjw","E0Ld7ZgsuoA","yIYKR4sgzI8","eKD5gxPPeY0","Gv9_4yMHFhI"],
  2:["w7ejDZ8SWv8","4UZrsTqkcW4","f55qeKGgB_M","ENrzD9HAZK4","pKd0Rpw7O4o","BDo1lgaZuII","7CqJlxBYj-M","Gv9_4yMHFhI"],
  3:["vmEHCJofslg","r-uOLxNrNk8","ZyhVh-qRZPA","2uvysYbKdjM","a3BVMX8L83U","nLw1RNvfElg","BDo1lgaZuII","Gv9_4yMHFhI"],
  4:["xpDnVSmNFX0","quLrc3PbuIw","WT2OBI4x7dA","REB_eGHK_P4","U3krAePnQc4","Gv9_4yMHFhI"],
  5:["3hLmDS179YE","ulprqHHWlng","a7GWkY01x_A","9_wo0FHsLKI","Gv9_4yMHFhI"],
  6:["hXSFdwIIsNU","qiQR5rTSshw","inWWhr5tnEA","Gv9_4yMHFhI"],
};

const LESSONS = {
  1:[
    {id:1,title:"Introduction to ML",duration:"12 min",type:"video",done:true},
    {id:2,title:"Types of Learning",duration:"18 min",type:"video",done:true},
    {id:3,title:"Python Setup",duration:"10 min",type:"video",done:false},
    {id:4,title:"NumPy & Pandas",duration:"25 min",type:"video",done:false},
    {id:5,title:"Linear Regression",duration:"22 min",type:"video",done:false},
    {id:6,title:"Logistic Regression",duration:"20 min",type:"video",done:false},
    {id:7,title:"Decision Trees",duration:"18 min",type:"video",done:false},
    {id:8,title:"Final Quiz",duration:"15 min",type:"quiz",done:false},
  ],
  2:[
    {id:1,title:"React Crash Course",duration:"20 min",type:"video",done:true},
    {id:2,title:"React Hooks",duration:"18 min",type:"video",done:false},
    {id:3,title:"Node.js Basics",duration:"22 min",type:"video",done:false},
    {id:4,title:"Express & REST APIs",duration:"20 min",type:"video",done:false},
    {id:5,title:"MongoDB",duration:"18 min",type:"video",done:false},
    {id:6,title:"Building APIs",duration:"25 min",type:"video",done:false},
    {id:7,title:"Full Stack Project",duration:"35 min",type:"video",done:false},
    {id:8,title:"Final Quiz",duration:"15 min",type:"quiz",done:false},
  ],
  3:[
    {id:1,title:"Pandas Introduction",duration:"15 min",type:"video",done:true},
    {id:2,title:"Data Analysis",duration:"20 min",type:"video",done:false},
    {id:3,title:"Matplotlib Visualization",duration:"18 min",type:"video",done:false},
    {id:4,title:"Data Cleaning",duration:"22 min",type:"video",done:false},
    {id:5,title:"Exploratory Analysis",duration:"25 min",type:"video",done:false},
    {id:6,title:"Statistics Basics",duration:"20 min",type:"video",done:false},
    {id:7,title:"Real World Project",duration:"30 min",type:"video",done:false},
    {id:8,title:"Final Quiz",duration:"15 min",type:"quiz",done:false},
  ],
  default:[
    {id:1,title:"Introduction",duration:"10 min",type:"video",done:true},
    {id:2,title:"Core Concepts",duration:"20 min",type:"video",done:false},
    {id:3,title:"Hands-on Practice",duration:"25 min",type:"video",done:false},
    {id:4,title:"Advanced Topics",duration:"28 min",type:"video",done:false},
    {id:5,title:"Final Quiz",duration:"15 min",type:"quiz",done:false},
  ],
};

const QUIZ = [
  {q:"What does ML stand for?",opts:["Machine Language","Machine Learning","Multi-Layer","Memory Logic"],ans:1},
  {q:"Which algorithm is used for classification?",opts:["Linear Regression","K-Means","Logistic Regression","PCA"],ans:2},
  {q:"What is overfitting?",opts:["Model too simple","Model memorizes training data","High bias error","None of these"],ans:1},
];

const C = {k:"#354024",m:"#889063",t:"#CFBB99",b:"#E5D7C4",d:"#4C3D19"};

export default function CoursePage({ course, onBack }) {
  const lessons = LESSONS[course.id] || LESSONS.default;
  const videos  = VIDEOS[course.id]  || VIDEOS[1];
  const [active, setActive]           = useState(lessons[0]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizDone, setQuizDone]       = useState(false);
  const [showCert, setShowCert]       = useState(false);
  const [list, setList]               = useState(lessons);
  const [downloading, setDownloading] = useState(false);

  const idx     = list.findIndex(l => l.id === active.id);
  const donePct = Math.round(list.filter(l => l.done).length / list.length * 100);
  const score   = Object.entries(quizAnswers).filter(([i,a]) => QUIZ[+i].ans === +a).length;
  const passed  = score >= 2;

  const markDone = id => setList(p => p.map(l => l.id===id ? {...l,done:true} : l));
  const next = () => { const n = list[idx+1]; if(n){ markDone(active.id); setActive(n); }};
  const prev = () => { const p = list[idx-1]; if(p) setActive(p); };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const certId = "SKP-" + new Date().getFullYear() + "-" + Math.floor(Math.random()*900000+100000);
      await generateCertPDF({
        student_name: "Student",
        course_title: course.title,
        id: certId,
      });
    } catch(e) {
      alert("PDF download failed: " + e.message + "\nMake sure jspdf is installed: npm install jspdf");
    }
    setDownloading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:C.b,fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"/>
      <style>{`
        .lrow{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:10px;cursor:pointer;border:1.5px solid transparent;transition:all .2s}
        .lrow:hover{background:rgba(53,64,36,0.06)}
        .lrow.on{background:rgba(53,64,36,0.1);border-color:rgba(53,64,36,0.22)}
        .qbtn{display:block;width:100%;text-align:left;padding:12px 15px;border-radius:12px;font-size:14px;font-family:'DM Sans',sans-serif;cursor:pointer;border:1.5px solid rgba(53,64,36,0.18);background:#CFBB99;color:#354024;transition:all .2s;margin-bottom:9px;font-weight:500}
        .qbtn:hover{border-color:#354024;background:#E5D7C4}
        .qbtn.sel{border-color:#354024;background:#354024;color:#E5D7C4;font-weight:700}
        .qbtn.ok{border-color:#889063;background:rgba(136,144,99,0.2);color:#354024;font-weight:700}
        .qbtn.no{border-color:#7f1d1d;background:rgba(127,29,29,0.08);color:#7f1d1d}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#889063;border-radius:2px}
      `}</style>

      {/* Header */}
      <header style={{background:C.k,padding:"13px 22px",display:"flex",alignItems:"center",gap:14,position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 20px rgba(53,64,36,0.3)"}}>
        <button onClick={onBack} style={{background:"rgba(229,215,196,0.12)",border:"1.5px solid rgba(229,215,196,0.22)",borderRadius:8,padding:"7px 13px",color:C.t,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:500,flexShrink:0}}>← Back</button>
        <span style={{fontSize:19,flexShrink:0}}>{course.thumb}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.b,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{course.title}</div>
          <div style={{fontSize:11,color:C.m,fontWeight:500}}>{list.length} lessons · {course.hours} hrs</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
          <span style={{fontSize:12,color:C.t,fontWeight:500}}>{donePct}%</span>
          <div style={{width:90,background:"rgba(229,215,196,0.14)",borderRadius:4,height:5}}>
            <div style={{width:`${donePct}%`,height:5,borderRadius:4,background:`linear-gradient(90deg,${C.m},${C.t})`,transition:"width .5s ease"}}/>
          </div>
        </div>
      </header>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* Sidebar */}
        <aside style={{width:275,minWidth:275,borderRight:`1.5px solid rgba(53,64,36,0.12)`,padding:"16px 11px",overflowY:"auto",background:C.t}}>
          <div style={{fontSize:10,fontWeight:700,color:C.m,letterSpacing:"1px",textTransform:"uppercase",marginBottom:11}}>Curriculum</div>
          {list.map((l,i) => (
            <div key={l.id} className={`lrow ${active.id===l.id?"on":""}`} onClick={()=>setActive(l)}>
              <div style={{width:25,height:25,borderRadius:"50%",background:l.done?C.m:"rgba(53,64,36,0.07)",border:`1.5px solid ${l.done?C.k:"rgba(53,64,36,0.18)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:l.done?C.b:C.m,flexShrink:0,fontWeight:700}}>
                {l.done?"✓":i+1}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,color:active.id===l.id?C.k:C.d,fontWeight:active.id===l.id?700:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.title}</div>
                <div style={{fontSize:10,color:C.m,marginTop:2,fontWeight:500}}>{l.type==="quiz"?"📝":"▶"} {l.duration}</div>
              </div>
            </div>
          ))}
        </aside>

        {/* Main */}
        <main style={{flex:1,padding:"26px 30px",overflowY:"auto"}}>

          {/* ══ CERTIFICATE SCREEN ══ */}
          {showCert && (
            <div style={{maxWidth:600,margin:"0 auto",textAlign:"center"}}>
              <div style={{background:`linear-gradient(135deg,${C.k},${C.m})`,borderRadius:22,padding:"42px 34px",boxShadow:"0 16px 48px rgba(53,64,36,0.32)"}}>
                <div style={{fontSize:60,marginBottom:12,display:"inline-block",animation:"pulse 2s ease-in-out infinite"}}>🏅</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:C.b,marginBottom:6}}>Congratulations!</div>
                <div style={{fontSize:14,color:C.t,marginBottom:26,fontWeight:500}}>You have successfully completed the course</div>

                {/* Certificate preview */}
                <div style={{background:"rgba(229,215,196,0.1)",border:"1.5px solid rgba(229,215,196,0.28)",borderRadius:16,padding:"26px",marginBottom:26}}>
                  <div style={{fontSize:9,letterSpacing:"3px",textTransform:"uppercase",color:"rgba(229,215,196,0.55)",marginBottom:9,fontWeight:600}}>Certificate of Completion</div>
                  <div style={{width:48,height:2,background:C.m,borderRadius:2,margin:"0 auto 14px"}}/>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:700,color:C.b,marginBottom:7}}>{course.title}</div>
                  <div style={{fontSize:12,color:C.t,fontWeight:500}}>Issued by SkillPath AI · {new Date().toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"})}</div>
                  <div style={{display:"flex",justifyContent:"center",gap:5,marginTop:12}}>
                    {"★★★★★".split("").map((s,i)=><span key={i} style={{color:C.m,fontSize:18}}>{s}</span>)}
                  </div>
                </div>

                {/* Download button */}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  style={{background:C.b,border:"none",borderRadius:13,padding:"16px 28px",color:C.k,fontSize:15,fontWeight:800,cursor:downloading?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",marginBottom:11,boxShadow:"0 6px 20px rgba(0,0,0,0.18)",transition:"all .2s",opacity:downloading?0.72:1}}>
                  {downloading
                    ? <><span style={{display:"inline-block",width:16,height:16,border:"2px solid #354024",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}></span> Generating PDF...</>
                    : <><span style={{fontSize:19}}>⬇️</span> Download Certificate PDF</>}
                </button>
                <button onClick={onBack} style={{background:"rgba(229,215,196,0.1)",border:"1.5px solid rgba(229,215,196,0.22)",borderRadius:12,padding:"11px 28px",color:C.t,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%",fontWeight:500}}>
                  ← Back to courses
                </button>
              </div>
              <p style={{color:C.m,fontSize:12,marginTop:13,fontWeight:500}}>📥 PDF saves automatically to your Downloads folder</p>
            </div>
          )}

          {/* ══ QUIZ ══ */}
          {!showCert && active.type==="quiz" && (
            <div style={{maxWidth:600}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.k,marginBottom:5}}>Final Quiz 📝</div>
              <div style={{fontSize:13,color:C.m,marginBottom:26,fontWeight:500}}>Score 2 out of 3 to earn your certificate</div>

              {QUIZ.map((q,qi) => (
                <div key={qi} style={{marginBottom:24,background:C.t,borderRadius:15,padding:"18px",border:`1.5px solid rgba(53,64,36,0.12)`}}>
                  <div style={{fontSize:14,color:C.k,fontWeight:700,marginBottom:13,lineHeight:1.5}}>Q{qi+1}. {q.q}</div>
                  {q.opts.map((o,oi) => {
                    let cls = "qbtn";
                    if (quizDone) { if(oi===q.ans) cls+=" ok"; else if(quizAnswers[qi]===oi) cls+=" no"; }
                    else if(quizAnswers[qi]===oi) cls+=" sel";
                    return <button key={oi} className={cls} disabled={quizDone} onClick={()=>setQuizAnswers({...quizAnswers,[qi]:oi})}>{String.fromCharCode(65+oi)}. {o}</button>;
                  })}
                </div>
              ))}

              {!quizDone ? (
                <button
                  onClick={()=>{ setQuizDone(true); if(passed) setTimeout(()=>setShowCert(true),700); }}
                  disabled={Object.keys(quizAnswers).length < QUIZ.length}
                  style={{background:Object.keys(quizAnswers).length<QUIZ.length?"rgba(53,64,36,0.1)":C.k,border:"none",borderRadius:12,padding:"13px 30px",color:Object.keys(quizAnswers).length<QUIZ.length?C.m:C.b,fontSize:14,fontWeight:700,cursor:Object.keys(quizAnswers).length<QUIZ.length?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:Object.keys(quizAnswers).length<QUIZ.length?"none":"0 4px 14px rgba(53,64,36,0.3)",transition:"all .2s"}}>
                  Submit Quiz →
                </button>
              ) : (
                <div style={{background:passed?"rgba(53,64,36,0.08)":"rgba(127,29,29,0.06)",border:`2px solid ${passed?C.m:"#fca5a5"}`,borderRadius:15,padding:"20px",textAlign:"center"}}>
                  <div style={{fontSize:38,marginBottom:8}}>{passed?"🎉":"😕"}</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:passed?C.k:"#7f1d1d",marginBottom:5}}>
                    {passed?"Passed! Your certificate is ready!":"Not quite — try again"}
                  </div>
                  <div style={{fontSize:13,color:C.m,fontWeight:500,marginBottom:passed?0:14}}>Score: {score}/{QUIZ.length}</div>
                  {!passed && (
                    <button onClick={()=>{setQuizDone(false);setQuizAnswers({});}} style={{background:C.k,border:"none",borderRadius:9,padding:"9px 22px",color:C.b,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Retry Quiz</button>
                  )}
                  {passed && (
                    <button onClick={()=>setShowCert(true)} style={{marginTop:11,background:C.m,border:"none",borderRadius:10,padding:"12px 26px",color:C.b,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
                      View & Download Certificate 🏅
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ VIDEO LESSON ══ */}
          {!showCert && active.type!=="quiz" && (
            <div style={{maxWidth:800}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:700,color:C.k,marginBottom:4}}>{active.title}</div>
              <div style={{fontSize:12,color:C.m,marginBottom:19,fontWeight:500}}>Lesson {idx+1} of {list.length} · {active.duration}</div>

              {/* YouTube embed */}
              <div style={{position:"relative",paddingBottom:"56.25%",height:0,borderRadius:17,overflow:"hidden",marginBottom:20,background:C.k,border:`2px solid rgba(53,64,36,0.18)`,boxShadow:"0 10px 30px rgba(53,64,36,0.22)"}}>
                <iframe
                  key={active.id}
                  src={`https://www.youtube.com/embed/${videos[idx]||videos[0]}?rel=0&modestbranding=1`}
                  title={active.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{position:"absolute",top:0,left:0,width:"100%",height:"100%"}}
                />
              </div>

              {/* Takeaway */}
              <div style={{background:C.t,border:`1.5px solid rgba(53,64,36,0.14)`,borderRadius:13,padding:"15px 18px",marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:700,color:C.k,marginBottom:4}}>💡 Key takeaways</div>
                <div style={{fontSize:13,color:C.d,lineHeight:1.7,fontWeight:500}}>Watch the full video and take notes. Click <strong>Mark Complete & Next</strong> to track your progress toward your certificate.</div>
              </div>

              {/* Nav buttons */}
              <div style={{display:"flex",gap:11,flexWrap:"wrap"}}>
                {idx>0&&(
                  <button onClick={prev} style={{background:C.t,border:`1.5px solid rgba(53,64,36,0.2)`,borderRadius:10,padding:"11px 20px",color:C.k,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>← Previous</button>
                )}
                <button onClick={next} style={{background:`linear-gradient(135deg,${C.k},${C.m})`,border:"none",borderRadius:10,padding:"11px 26px",color:C.b,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(53,64,36,0.3)",flex:1,maxWidth:280}}>
                  {idx===list.length-1?"Complete Course 🏁":"Mark Complete & Next →"}
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}