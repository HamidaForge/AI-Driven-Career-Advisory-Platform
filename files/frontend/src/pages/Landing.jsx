import { useState } from "react";

const roles = ["Student","Working Professional","Career Switcher","Fresher"];

export default function Landing({ onLogin }) {
  const [mode, setMode]   = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm]   = useState({name:"",email:"",password:"",role:"Student",adminKey:""});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true); setError("");
    await new Promise(r=>setTimeout(r,900));
    if (mode==="admin" && form.adminKey!=="admin123") {
      setError("Invalid admin key. Use: admin123"); setLoading(false); return;
    }
    onLogin({...form, isAdmin: mode==="admin"});
    setLoading(false);
  };

  const C = {k:"#354024",m:"#889063",t:"#CFBB99",b:"#E5D7C4",d:"#4C3D19"};

  return (
    <div style={{minHeight:"100vh",background:C.b,fontFamily:"'DM Sans',sans-serif",position:"relative",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(2deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .blob{position:absolute;border-radius:50%;filter:blur(72px);opacity:0.32;pointer-events:none}
        .nav-btn{background:rgba(53,64,36,0.1);border:1.5px solid rgba(53,64,36,0.18);border-radius:10px;padding:9px 20px;color:#354024;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}
        .nav-btn:hover{background:rgba(53,64,36,0.18)}
        .inp{width:100%;background:#E5D7C4;border:2px solid #889063;border-radius:10px;padding:12px 15px;color:#354024;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:all .2s;box-sizing:border-box;font-weight:500}
        .inp:focus{border-color:#354024;background:#CFBB99}
        .inp::placeholder{color:#889063}
        .main-btn{width:100%;padding:13px;border-radius:12px;border:none;font-size:15px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;background:#354024;color:#E5D7C4;box-shadow:0 6px 22px rgba(53,64,36,0.3);transition:all .3s}
        .main-btn:hover{background:#4C3D19;transform:translateY(-2px);box-shadow:0 10px 28px rgba(53,64,36,0.38)}
        .main-btn:disabled{opacity:0.6;transform:none}
        .feat-card{background:rgba(53,64,36,0.07);border:1.5px solid rgba(53,64,36,0.13);border-radius:20px;padding:26px 20px;cursor:pointer;transition:all .28s}
        .feat-card:hover{transform:translateY(-7px);background:rgba(53,64,36,0.11);box-shadow:0 20px 50px rgba(53,64,36,0.14)}
        select.inp option{background:#E5D7C4;color:#354024}
      `}</style>

      {/* Blobs */}
      <div className="blob" style={{width:520,height:520,background:"#889063",top:-160,right:-90,animation:"float 7s ease-in-out infinite"}}/>
      <div className="blob" style={{width:420,height:420,background:"#354024",bottom:-100,left:-110,animation:"float 9s ease-in-out infinite",animationDelay:"2s"}}/>
      <div className="blob" style={{width:260,height:260,background:"#CFBB99",top:"38%",left:"40%",animation:"float 6s ease-in-out infinite",animationDelay:"1s"}}/>

      {/* Navbar */}
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 52px",position:"relative",zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:10,background:C.k,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(53,64,36,0.28)"}}>
            <span style={{fontSize:19}}>🌿</span>
          </div>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:21,fontWeight:800,color:C.k,letterSpacing:"-0.4px"}}>SkillPath<span style={{color:C.m}}>AI</span></span>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="nav-btn" onClick={()=>{setMode("user");setIsLogin(true);}}>Sign in</button>
          <button onClick={()=>setMode("admin")} style={{background:C.k,border:"none",borderRadius:10,padding:"9px 22px",color:C.b,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(53,64,36,0.3)"}}>Admin →</button>
        </div>
      </nav>

      {!mode ? (<>
        {/* Hero */}
        <div style={{textAlign:"center",padding:"50px 24px 32px",position:"relative",zIndex:5,animation:"slideUp .8s ease both"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(53,64,36,0.09)",border:"1.5px solid rgba(53,64,36,0.18)",borderRadius:100,padding:"8px 22px",marginBottom:28}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:C.m,display:"inline-block"}}/>
            <span style={{fontSize:13,color:C.k,fontWeight:600}}>100% Free · AI-Powered · Instant Certificates</span>
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(36px,5vw,68px)",fontWeight:700,color:C.k,lineHeight:1.08,letterSpacing:"-1.5px",margin:"0 0 20px"}}>
            Your AI-Powered<br/>
            <span style={{color:C.m,fontStyle:"italic"}}>Career Growth Engine</span>
          </h1>
          <p style={{fontSize:17,color:C.d,maxWidth:520,margin:"0 auto 40px",lineHeight:1.75,fontWeight:400}}>
            Resume analysis · Career matching · Mock interviews · Salary insights · Free courses · Downloadable certificates
          </p>
          <div style={{display:"flex",gap:13,justifyContent:"center",flexWrap:"wrap",marginBottom:60}}>
            <button onClick={()=>{setMode("user");setIsLogin(false);}} style={{background:C.k,border:"none",borderRadius:14,padding:"15px 36px",color:C.b,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 8px 26px rgba(53,64,36,0.32)",transition:"all .3s"}}>
              🌱 Start for free
            </button>
            <button onClick={()=>{setMode("user");setIsLogin(true);}} style={{background:"rgba(53,64,36,0.09)",border:"2px solid #354024",borderRadius:14,padding:"15px 36px",color:C.k,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .3s"}}>
              Sign in
            </button>
          </div>
          {/* Stats */}
          <div style={{display:"flex",gap:48,justifyContent:"center",flexWrap:"wrap"}}>
            {[["50+","Free Courses"],["10K+","Learners"],["4","AI Features"],["∞","Certificates"]].map(([v,l])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:700,color:C.k}}>{v}</div>
                <div style={{fontSize:12,color:C.m,marginTop:3,fontWeight:500}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticker */}
        <div style={{overflow:"hidden",whiteSpace:"nowrap",padding:"12px 0",background:C.k,margin:"32px 0"}}>
          <div style={{display:"inline-block",animation:"ticker 28s linear infinite"}}>
            {[...Array(2)].flatMap(()=>["Resume AI","Career Matching","Mock Interviews","Salary Insights","AWS Readiness","Free Courses","AI Certificates","Skill Gap Analysis","Interview Prep"].map((t,i)=>(
              <span key={`${t}${i}`} style={{display:"inline-block",margin:"0 28px",fontSize:12,color:C.m,letterSpacing:"2px",textTransform:"uppercase",fontWeight:500}}>
                <span style={{color:C.t,marginRight:10}}>✦</span>{t}
              </span>
            )))}
          </div>
        </div>

        {/* Feature cards */}
        <div style={{padding:"10px 52px 64px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,maxWidth:1000,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>
          {[
            {icon:"📄",title:"Resume AI",desc:"Upload resume → career suggestions, ATS score, AWS readiness, interview questions"},
            {icon:"✦",title:"AI Career Advisor",desc:"Select skills & interests → personalized career roadmap powered by Claude AI"},
            {icon:"🎤",title:"Mock Interview",desc:"AI generates role-specific questions and evaluates your answers with scoring"},
            {icon:"💰",title:"Salary Insights",desc:"Real AI salary data for any tech role, city and experience level in India"},
          ].map(({icon,title,desc})=>(
            <div key={title} className="feat-card" onClick={()=>{setMode("user");setIsLogin(false);}}>
              <div style={{fontSize:30,marginBottom:12}}>{icon}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:C.k,marginBottom:7}}>{title}</div>
              <div style={{fontSize:12,color:C.d,lineHeight:1.65,fontWeight:500}}>{desc}</div>
              <div style={{width:28,height:3,borderRadius:2,background:C.m,marginTop:16}}/>
            </div>
          ))}
        </div>
      </>) : (
        /* Auth form */
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 24px",minHeight:"72vh"}}>
          <div style={{background:C.b,border:"2px solid rgba(53,64,36,0.14)",borderRadius:22,padding:"38px 34px",width:"100%",maxWidth:410,boxShadow:"0 22px 70px rgba(53,64,36,0.16)",animation:"pop .4s ease both"}}>
            <button onClick={()=>{setMode(null);setError("");}} style={{background:"none",border:"none",color:C.m,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",marginBottom:20,display:"flex",alignItems:"center",gap:5,fontWeight:600}}>← Back</button>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
              <div style={{width:42,height:42,borderRadius:11,background:mode==="admin"?C.d:C.k,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,boxShadow:"0 4px 14px rgba(53,64,36,0.28)"}}>
                {mode==="admin"?"🛡":"🌿"}
              </div>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:C.k}}>{mode==="admin"?"Admin Portal":isLogin?"Welcome back!":"Create account"}</div>
                <div style={{fontSize:11,color:C.m,fontWeight:500}}>SkillPath AI Platform</div>
              </div>
            </div>

            {mode==="user"&&(
              <div style={{display:"flex",background:"rgba(53,64,36,0.07)",borderRadius:11,padding:4,marginBottom:20}}>
                {["Sign in","Sign up"].map((t,i)=>(
                  <button key={t} onClick={()=>{setIsLogin(i===0);setError("");}}
                    style={{flex:1,padding:"8px",border:"none",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:(isLogin&&i===0)||(!isLogin&&i===1)?C.k:"transparent",color:(isLogin&&i===0)||(!isLogin&&i===1)?C.b:C.m,transition:"all .2s"}}>
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {mode==="user"&&!isLogin&&<input className="inp" placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>}
              <input className="inp" placeholder="Email address" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
              <input className="inp" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
              {mode==="user"&&!isLogin&&(
                <select className="inp" value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={{background:C.b}}>
                  {roles.map(r=><option key={r}>{r}</option>)}
                </select>
              )}
              {mode==="admin"&&<input className="inp" placeholder="Admin secret key" type="password" value={form.adminKey} onChange={e=>setForm({...form,adminKey:e.target.value})}/>}
              {error&&<div style={{fontSize:13,color:"#7f1d1d",background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"10px 13px",fontWeight:500}}>{error}</div>}
              <button className="main-btn" disabled={loading} onClick={handleSubmit}>
                {loading?"Verifying...":mode==="admin"?"Access Admin Panel →":isLogin?"Sign in →":"Create account →"}
              </button>
            </div>
            <p style={{fontSize:12,color:C.m,textAlign:"center",marginTop:16,fontWeight:500}}>
              {mode==="admin"?"Demo key: admin123":"100% free. No credit card required."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}