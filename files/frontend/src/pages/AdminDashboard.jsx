import { useState } from "react";

const mockUsers = [
  {id:1,name:"Priya Sharma",email:"priya@example.com",role:"Student",courses:3,active:true},
  {id:2,name:"Rahul Verma",email:"rahul@example.com",role:"Working Professional",courses:5,active:true},
  {id:3,name:"Ananya Singh",email:"ananya@example.com",role:"Career Switcher",courses:2,active:false},
  {id:4,name:"Vikram Nair",email:"vikram@example.com",role:"Fresher",courses:4,active:true},
  {id:5,name:"Kavya Reddy",email:"kavya@example.com",role:"Student",courses:1,active:true},
];
const mockCourses = [
  {id:1,title:"Machine Learning with Python",category:"ML & AI",enrolled:842,rating:4.9,lessons:14,published:true},
  {id:2,title:"Full Stack React & Node.js",category:"Web Dev",enrolled:1204,rating:4.8,lessons:22,published:true},
  {id:3,title:"Data Analysis with Pandas",category:"Data Science",enrolled:673,rating:4.7,lessons:16,published:true},
  {id:4,title:"System Design Fundamentals",category:"Engineering",enrolled:521,rating:4.9,lessons:10,published:true},
  {id:5,title:"AWS Cloud Practitioner",category:"Cloud",enrolled:389,rating:4.6,lessons:18,published:false},
];

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState(mockUsers);
  const [courses, setCourses] = useState(mockCourses);
  const [showAdd, setShowAdd] = useState(false);
  const [newCourse, setNewCourse] = useState({title:"",category:"ML & AI",lessons:10});

  const tabs = [
    {id:"overview",label:"Overview",icon:"⊞"},
    {id:"users",label:"Users",icon:"👥"},
    {id:"courses",label:"Courses",icon:"📚"},
    {id:"analytics",label:"Analytics",icon:"📈"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#E5D7C4",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .atab{background:none;border:none;color:#CFBB99;cursor:pointer;padding:10px 18px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;border-radius:12px;transition:all .2s;display:flex;align-items:center;gap:7px;white-space:nowrap}
        .atab:hover{color:#E5D7C4;background:rgba(229,215,196,0.1)}
        .atab.active{color:#354024;background:#889063;font-weight:700}
        .acard{background:#CFBB99;border:1.5px solid rgba(53,64,36,0.12);border-radius:18px;padding:22px;box-shadow:0 2px 8px rgba(53,64,36,0.06);transition:all .2s}
        .acard:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(53,64,36,0.12)}
        .dtable{width:100%;border-collapse:collapse}
        .dtable th{font-size:11px;font-weight:700;color:#889063;letter-spacing:.6px;text-transform:uppercase;padding:13px 16px;text-align:left;border-bottom:2px solid rgba(53,64,36,0.1);background:#E5D7C4}
        .dtable td{padding:14px 16px;font-size:13px;border-bottom:1px solid rgba(53,64,36,0.08);color:#354024;font-weight:500}
        .dtable tr:hover td{background:rgba(53,64,36,0.03)}
        .ainput{background:#E5D7C4;border:2px solid rgba(53,64,36,0.2);border-radius:10px;padding:11px 14px;color:#354024;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;width:100%;box-sizing:border-box;transition:border-color .2s;font-weight:500}
        .ainput:focus{border-color:#354024}
        .ainput::placeholder{color:#889063}
      `}</style>

      {/* Admin Header */}
      <header style={{background:"#354024",padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 20px rgba(53,64,36,0.35)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"#889063",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:"0 3px 10px rgba(0,0,0,0.2)"}}>🛡</div>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#E5D7C4"}}>SkillPath <span style={{color:"#889063"}}>Admin</span></span>
          <span style={{background:"#889063",borderRadius:20,padding:"3px 12px",fontSize:11,color:"#354024",fontWeight:700,marginLeft:4}}>ADMIN</span>
        </div>
        <nav style={{display:"flex",gap:4}}>
          {tabs.map(t=>(
            <button key={t.id} className={`atab ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <button onClick={onLogout} style={{background:"rgba(229,215,196,0.12)",border:"1.5px solid rgba(229,215,196,0.25)",borderRadius:8,padding:"7px 16px",color:"#CFBB99",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>Logout</button>
      </header>

      <main style={{padding:"28px 32px 48px",maxWidth:1100,margin:"0 auto",width:"100%",boxSizing:"border-box",animation:"slideUp .5s ease both"}}>

        {/* OVERVIEW */}
        {tab==="overview"&&<>
          <div style={{marginBottom:26}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:"#354024",margin:"0 0 4px"}}>Admin Dashboard</h1>
            <p style={{color:"#889063",fontSize:14,margin:0,fontWeight:500}}>Platform overview & real-time management</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
            {[
              {val:"3,629",label:"Total learners",delta:"+12% this month",icon:"👥",grad:"linear-gradient(135deg,#354024,#889063)"},
              {val:"50",label:"Free courses",delta:"+3 this month",icon:"📚",grad:"linear-gradient(135deg,#889063,#CFBB99)"},
              {val:"8,412",label:"Certificates issued",delta:"+340 this week",icon:"🏅",grad:"linear-gradient(135deg,#4C3D19,#889063)"},
              {val:"94%",label:"Completion rate",delta:"↑ 2% this week",icon:"📈",grad:"linear-gradient(135deg,#354024,#4C3D19)"},
            ].map(({val,label,delta,icon,grad})=>(
              <div key={label} className="acard">
                <div style={{width:42,height:42,borderRadius:12,background:grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:12,boxShadow:"0 4px 12px rgba(53,64,36,0.2)"}}>{icon}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:"#354024"}}>{val}</div>
                <div style={{fontSize:12,color:"#889063",marginTop:3,fontWeight:500}}>{label}</div>
                <div style={{fontSize:11,color:"#354024",marginTop:6,fontWeight:600,background:"rgba(53,64,36,0.08)",borderRadius:20,padding:"3px 10px",display:"inline-block"}}>{delta}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:"#CFBB99",border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:18,overflow:"hidden",boxShadow:"0 2px 8px rgba(53,64,36,0.06)"}}>
              <div style={{padding:"18px 20px",borderBottom:"1px solid rgba(53,64,36,0.1)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#354024"}}>Recent sign-ups</div>
                <button onClick={()=>setTab("users")} style={{fontSize:12,color:"#889063",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>View all →</button>
              </div>
              {users.slice(0,4).map(u=>(
                <div key={u.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 20px",borderBottom:"1px solid rgba(53,64,36,0.06)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#354024,#889063)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#E5D7C4"}}>{u.name[0]}</div>
                    <div><div style={{fontSize:13,fontWeight:600,color:"#354024"}}>{u.name}</div><div style={{fontSize:11,color:"#889063",fontWeight:500}}>{u.role}</div></div>
                  </div>
                  <span style={{background:u.active?"rgba(53,64,36,0.12)":"rgba(53,64,36,0.05)",color:u.active?"#354024":"#889063",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{u.active?"Active":"Inactive"}</span>
                </div>
              ))}
            </div>
            <div style={{background:"#CFBB99",border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:18,overflow:"hidden",boxShadow:"0 2px 8px rgba(53,64,36,0.06)"}}>
              <div style={{padding:"18px 20px",borderBottom:"1px solid rgba(53,64,36,0.1)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#354024"}}>Top courses</div>
                <button onClick={()=>setTab("courses")} style={{fontSize:12,color:"#889063",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Manage →</button>
              </div>
              {courses.slice(0,4).map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 20px",borderBottom:"1px solid rgba(53,64,36,0.06)"}}>
                  <div><div style={{fontSize:13,fontWeight:600,color:"#354024",maxWidth:210,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div><div style={{fontSize:11,color:"#889063",fontWeight:500}}>{c.enrolled} enrolled · ⭐ {c.rating}</div></div>
                  <span style={{background:c.published?"rgba(53,64,36,0.12)":"rgba(136,144,99,0.15)",color:c.published?"#354024":"#889063",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{c.published?"Live":"Draft"}</span>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* USERS */}
        {tab==="users"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#354024",margin:0}}>Users <span style={{color:"#889063",fontSize:16,fontFamily:"'DM Sans',sans-serif"}}>({users.length})</span></h1>
          </div>
          <div style={{background:"#CFBB99",border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:18,overflow:"hidden",boxShadow:"0 2px 8px rgba(53,64,36,0.06)"}}>
            <table className="dtable">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Courses</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{users.map((u)=>(
                <tr key={u.id}>
                  <td><div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#354024,#889063)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#E5D7C4"}}>{u.name[0]}</div>
                    {u.name}
                  </div></td>
                  <td style={{color:"#889063"}}>{u.email}</td>
                  <td style={{color:"#889063"}}>{u.role}</td>
                  <td>{u.courses}</td>
                  <td><span style={{background:u.active?"rgba(53,64,36,0.12)":"rgba(53,64,36,0.05)",color:u.active?"#354024":"#889063",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700}}>{u.active?"Active":"Inactive"}</span></td>
                  <td><button onClick={()=>setUsers(users.filter(x=>x.id!==u.id))} style={{padding:"5px 14px",borderRadius:8,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",border:"1.5px solid rgba(53,64,36,0.25)",background:"rgba(53,64,36,0.06)",color:"#354024",fontWeight:600}}>Remove</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>}

        {/* COURSES */}
        {tab==="courses"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#354024",margin:0}}>Courses <span style={{color:"#889063",fontSize:16,fontFamily:"'DM Sans',sans-serif"}}>({courses.length})</span></h1>
            <button onClick={()=>setShowAdd(true)} style={{background:"#354024",border:"none",borderRadius:10,padding:"10px 22px",color:"#E5D7C4",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(53,64,36,0.3)"}}>+ Add Course</button>
          </div>
          {showAdd&&(
            <div style={{background:"#CFBB99",border:"2px solid #889063",borderRadius:18,padding:"24px",marginBottom:20,boxShadow:"0 4px 16px rgba(53,64,36,0.1)"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:"#354024",marginBottom:16}}>New Course</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <input className="ainput" placeholder="Course title" value={newCourse.title} onChange={e=>setNewCourse({...newCourse,title:e.target.value})} style={{gridColumn:"1/3"}}/>
                <select className="ainput" value={newCourse.category} onChange={e=>setNewCourse({...newCourse,category:e.target.value})} style={{background:"#E5D7C4"}}>
                  {["ML & AI","Web Dev","Data Science","Cloud","Security","Engineering"].map(c=><option key={c}>{c}</option>)}
                </select>
                <input className="ainput" placeholder="No. of lessons" type="number" value={newCourse.lessons} onChange={e=>setNewCourse({...newCourse,lessons:+e.target.value})}/>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>{if(!newCourse.title)return;setCourses([...courses,{id:courses.length+1,...newCourse,enrolled:0,rating:0,published:false}]);setShowAdd(false);setNewCourse({title:"",category:"ML & AI",lessons:10});}} style={{background:"#354024",border:"none",borderRadius:8,padding:"10px 22px",color:"#E5D7C4",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Save Course</button>
                <button onClick={()=>setShowAdd(false)} style={{background:"rgba(53,64,36,0.08)",border:"1.5px solid rgba(53,64,36,0.2)",borderRadius:8,padding:"10px 18px",color:"#354024",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{background:"#CFBB99",border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:18,overflow:"hidden",boxShadow:"0 2px 8px rgba(53,64,36,0.06)"}}>
            <table className="dtable">
              <thead><tr><th>Title</th><th>Category</th><th>Enrolled</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{courses.map(c=>(
                <tr key={c.id}>
                  <td style={{maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</td>
                  <td style={{color:"#889063"}}>{c.category}</td>
                  <td>{c.enrolled}</td>
                  <td style={{color:"#4C3D19",fontWeight:700}}>{c.rating>0?`⭐ ${c.rating}`:"-"}</td>
                  <td><span style={{background:c.published?"rgba(53,64,36,0.12)":"rgba(136,144,99,0.15)",color:c.published?"#354024":"#889063",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700}}>{c.published?"Live":"Draft"}</span></td>
                  <td><div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setCourses(courses.map(x=>x.id===c.id?{...x,published:!x.published}:x))} style={{padding:"5px 12px",borderRadius:7,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",border:"1.5px solid #889063",background:"rgba(136,144,99,0.1)",color:"#354024",fontWeight:600}}>{c.published?"Unpublish":"Publish"}</button>
                    <button onClick={()=>setCourses(courses.filter(x=>x.id!==c.id))} style={{padding:"5px 12px",borderRadius:7,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",border:"1.5px solid rgba(53,64,36,0.25)",background:"rgba(53,64,36,0.06)",color:"#354024",fontWeight:600}}>Del</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>}

        {/* ANALYTICS */}
        {tab==="analytics"&&<>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#354024",margin:"0 0 22px"}}>Analytics 📈</h1>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
            {[
              ["Daily active users","284",[40,55,48,70,62,80,75],"#354024"],
              ["Certificates today","47",[10,14,12,18,15,22,20],"#889063"],
              ["Avg. session (min)","38",[32,35,30,40,38,42,38],"#4C3D19"],
            ].map(([l,v,spark,col])=>(
              <div key={l} className="acard">
                <div style={{fontSize:12,color:"#889063",marginBottom:8,fontWeight:500}}>{l}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:"#354024",marginBottom:14}}>{v}</div>
                <svg viewBox="0 0 100 30" width="100%" height="30" preserveAspectRatio="none">
                  <polyline points={spark.map((v2,i)=>`${i*100/6},${30-v2*.35}`).join(" ")} fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:"#CFBB99",border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:18,padding:"22px",boxShadow:"0 2px 8px rgba(53,64,36,0.06)"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#354024",marginBottom:18}}>Enrollments by category</div>
              {[["ML & AI",65,"#354024"],["Web Dev",55,"#889063"],["Data Science",45,"#4C3D19"],["Cloud",30,"#889063"],["Security",20,"#354024"]].map(([cat,pct,col])=>(
                <div key={cat} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:13,color:"#354024",fontWeight:600}}>{cat}</span>
                    <span style={{fontSize:12,color:"#889063",fontWeight:500}}>{pct}%</span>
                  </div>
                  <div style={{background:"rgba(53,64,36,0.1)",borderRadius:6,height:7}}>
                    <div style={{width:`${pct}%`,height:7,borderRadius:6,background:`linear-gradient(90deg,${col},#889063)`}}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"#CFBB99",border:"1.5px solid rgba(53,64,36,0.12)",borderRadius:18,padding:"22px",boxShadow:"0 2px 8px rgba(53,64,36,0.06)"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#354024",marginBottom:18}}>User breakdown</div>
              {[["Students","58%","#354024"],["Working Professionals","25%","#889063"],["Career Switchers","12%","#4C3D19"],["Freshers","5%","#CFBB99"]].map(([r,pct,col])=>(
                <div key={r} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(53,64,36,0.08)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:10,height:10,borderRadius:2,background:col}}/>
                    <span style={{fontSize:13,color:"#354024",fontWeight:500}}>{r}</span>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,color:"#354024"}}>{pct}</span>
                </div>
              ))}
              <div style={{marginTop:16,background:"linear-gradient(135deg,#354024,#889063)",borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:12,color:"#E5D7C4",fontWeight:700}}>📈 Growth insight</div>
                <div style={{fontSize:12,color:"#CFBB99",marginTop:4,fontWeight:500}}>Working professional segment grew 34% this month!</div>
              </div>
            </div>
          </div>
        </>}

      </main>
    </div>
  );
}

 