import React, { useEffect, useState } from "react";
import { FileDown, ClipboardCheck, Library, Calendar, Home, NotebookPen, Settings } from "lucide-react";
import jsPDF from "jspdf";
import checklists from "./data/checklists.json";

const BRAND = { navy: "#0b1e39", gold: "#d4af37", red: "#b71c1c", white: "#ffffff" };

function usePersistentState() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem("spc_state");
    return saved ? JSON.parse(saved) : {
      brandCrest: null,
      scripture: [{ ref: "Micah 6:8", text: "Act justly, love mercy, and walk humbly with your God." }],
      values: ["Compassion", "Hope", "Justice", "Respect"],
      currentUser: { id: "u-1", name: "Guest", role: "teacher" },
      sectionsByRole: checklists,
      uploadedDocs: [], feedback: []
    };
  });
  useEffect(()=>{ localStorage.setItem("spc_state", JSON.stringify(state)); }, [state]);
  return [state, setState];
}

function Header({ crest }) {
  const quote = "Compassion · Hope · Justice · Respect";
  return (
    <header style={{background: BRAND.navy, color: BRAND.white, padding: "10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {crest ? <img src={crest} alt="crest" style={{width:36,height:36,objectFit:"contain"}}/> : <div style={{width:36,height:36,background:BRAND.gold,borderRadius:8}}/>}
        <div>
          <div style={{fontWeight:700}}>St Patrick’s College Mackay</div>
          <div style={{fontSize:12,opacity:.8}}>{quote}</div>
        </div>
      </div>
      <div style={{fontSize:12,opacity:.85}}>“Act justly, love mercy, and walk humbly with your God.” — Micah 6:8</div>
    </header>
  );
}

function Tabs({ active, setActive }) {
  const items = [
    {key:"home", label:"Home", icon:<Home size={16}/>},
    {key:"progress", label:"Progress", icon:<ClipboardCheck size={16}/>},
    {key:"resources", label:"Resources", icon:<Library size={16}/>},
    {key:"calendar", label:"Calendar", icon:<Calendar size={16}/>},
    {key:"feedback", label:"Feedback", icon:<NotebookPen size={16}/>},
    {key:"admin", label:"Admin", icon:<Settings size={16}/>},
    {key:"forms", label:"Forms", icon:<FileDown size={16}/>},
  ];
  return (
    <nav style={{display:"flex",gap:8,flexWrap:"wrap",padding:8, borderBottom:"1px solid #e2e8f0", background:"#fff", position:"sticky", top:0, zIndex:10}}>
      {items.map(it => (
        <button key={it.key} onClick={()=>setActive(it.key)}
          style={{display:"inline-flex",alignItems:"center",gap:6, padding:"6px 10px", borderRadius:6, border:"1px solid #e2e8f0",
                  background: active===it.key ? BRAND.gold : "#fff",
                  color: active===it.key ? BRAND.navy : "#111"}}
        >{it.icon}{it.label}</button>
      ))}
    </nav>
  );
}

function Dashboard({ state }) {
  const quote = state.scripture?.[0];
  return (
    <div style={{padding:16}}>
      <h1 style={{color:BRAND.navy}}>Welcome to the Teacher Induction Hub</h1>
      <p style={{fontStyle:"italic"}}>{quote?.text} <span style={{opacity:.7}}>— {quote?.ref}</span></p>
      <div style={{marginTop:12, fontSize:14}}>Use the tabs above to navigate your induction resources, checklists, forms, and reports.</div>
    </div>
  );
}

function ProgressPage({ state, setState }) {
  const role = state.currentUser?.role || "teacher";
  const sections = state.sectionsByRole?.[role] || [];
  const toggle = (sid, tid) => {
    setState(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const sec = copy.sectionsByRole[role].find(s => s.id===sid);
      const item = sec.items.find(i => i.id===tid);
      item.done = !item.done;
      return copy;
    });
  };
  const complete = sections.reduce((acc,s)=>acc + s.items.filter(i=>i.done).length, 0);
  const total = sections.reduce((acc,s)=>acc + s.items.length, 0);
  const percent = total ? Math.round(100*complete/total) : 0;

  return (
    <div style={{padding:16}}>
      <div style={{marginBottom:8, fontWeight:600}}>Overall progress: {percent}%</div>
      {sections.map(sec => (
        <div key={sec.id} style={{border:"1px solid #e2e8f0",borderRadius:8,margin:"8px 0"}}>
          <div style={{background:"#f8fafc",padding:"8px 12px",fontWeight:600}}>{sec.title}</div>
          <div style={{padding:12}}>
            {sec.items.map(it => (
              <label key={it.id} style={{display:"flex",alignItems:"center",gap:8, padding:"6px 0"}}>
                <input type="checkbox" checked={!!it.done} onChange={()=>toggle(sec.id, it.id)} />
                <span style={{textDecoration: it.done ? "line-through" : "none", opacity: it.done ? .7 : 1}}>{it.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ResourcesPage({ state, setState }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const addLink = () => {
    if(!url) return;
    const id = "doc-" + Date.now();
    setState(prev => ({...prev, uploadedDocs: [...prev.uploadedDocs, {id, title: title || url, url}]}));
    setTitle(""); setUrl("");
  };
  const addPdf = () => {
    if(!file || !title) return;
    const id = "doc-" + Date.now();
    const blobUrl = URL.createObjectURL(file);
    setState(prev => ({...prev, uploadedDocs: [...prev.uploadedDocs, {id, title, url: blobUrl}]}));
    setTitle(""); setFile(null);
  };
  return (
    <div style={{padding:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12}}>
        <div style={{border:"1px solid #e2e8f0",borderRadius:8,padding:12}}>
          <div style={{fontWeight:600, marginBottom:6}}>Add Resource</div>
          <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={{width:"100%",margin:"4px 0"}}/>
          <input placeholder="Link (optional)" value={url} onChange={e=>setUrl(e.target.value)} style={{width:"100%",margin:"4px 0"}}/>
          <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} style={{width:"100%",margin:"4px 0"}}/>
          <div style={{display:"flex",gap:8, marginTop:6}}>
            <button onClick={addLink} style={{padding:"6px 10px"}}>Add Link</button>
            <button onClick={addPdf} style={{padding:"6px 10px"}}>Upload PDF</button>
          </div>
          <div style={{fontSize:12,opacity:.7,marginTop:6}}>Maps can be uploaded later as construction changes finish.</div>
        </div>
        <div style={{border:"1px solid #e2e8f0",borderRadius:8,padding:12}}>
          <div style={{fontWeight:600, marginBottom:6}}>Documents</div>
          {state.uploadedDocs.length===0 && <div style={{opacity:.7}}>No documents yet. Add one above.</div>}
          {state.uploadedDocs.map(doc => (
            <div key={doc.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #f1f5f9"}}>
              <div>
                <div style={{fontWeight:600}}>{doc.title}</div>
                <div style={{fontSize:12,opacity:.7}}>{doc.url}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>window.open(doc.url,"_blank")}>Open</button>
                <button onClick={()=>navigator.clipboard.writeText(doc.url)}>Copy Link</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarPage() {
  const events = [
    { date: "2025-01-20", title: "Staff Day (PD)", location: "Main Campus" },
    { date: "2025-01-27", title: "Term 1 Begins", location: "College" },
    { date: "2025-02-03", title: "WHS Refresher", location: "Library" },
  ];
  return (
    <div style={{padding:16}}>
      <h3>Upcoming Events</h3>
      <div style={{border:"1px solid #e2e8f0",borderRadius:8, overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead style={{background:"#f8fafc"}}>
            <tr><th style={{textAlign:"left",padding:8}}>Date</th><th style={{textAlign:"left",padding:8}}>Title</th><th style={{textAlign:"left",padding:8}}>Location</th></tr>
          </thead>
          <tbody>
            {events.map((e,i)=>(
              <tr key={i} style={{borderTop:"1px solid #e2e8f0"}}>
                <td style={{padding:8}}>{e.date}</td>
                <td style={{padding:8}}>{e.title}</td>
                <td style={{padding:8}}>{e.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeedbackPage({ state, setState }) {
  const [name, setName] = useState(""); const [msg, setMsg] = useState(""); const [rating, setRating] = useState(3);
  const submit = () => { if(!msg) return;
    setState(prev => ({...prev, feedback: [...prev.feedback, {id:"f-"+Date.now(), name, msg, rating, when:new Date().toISOString()}]}));
    setName(""); setMsg(""); setRating(3);
  };
  const exportCsv = () => {
    const rows = [["When","Name","Rating","Message"], ...state.feedback.map(f=>[f.when, f.name||"", f.rating, String(f.msg).replaceAll("\n"," ")])];
    const csv = rows.map(r=>r.map(c=>`"${String(c).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="feedback.csv"; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <div style={{padding:16, display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12}}>
      <div style={{border:"1px solid #e2e8f0",borderRadius:8,padding:12}}>
        <div style={{fontWeight:600, marginBottom:6}}>Submit Feedback</div>
        <input placeholder="Your name (optional)" value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",margin:"4px 0"}}/>
        <label>Rating: {rating}</label>
        <input type="range" min={1} max={5} value={rating} onChange={e=>setRating(Number(e.target.value))} style={{width:"100%"}}/>
        <textarea placeholder="What’s working well? What could improve?" value={msg} onChange={e=>setMsg(e.target.value)} style={{width:"100%",height:100,marginTop:6}}/>
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button onClick={submit}>Send</button>
          <button onClick={exportCsv}>Export CSV</button>
        </div>
      </div>
      <div style={{border:"1px solid #e2e8f0",borderRadius:8,padding:12}}>
        <div style={{fontWeight:600, marginBottom:6}}>Recent Feedback</div>
        {state.feedback.length===0 && <div style={{opacity:.7}}>No feedback yet.</div>}
        {state.feedback.map(f=>(
          <div key={f.id} style={{borderTop:"1px solid #f1f5f9", padding:"6px 0"}}>
            <div style={{fontSize:12,opacity:.8}}>{new Date(f.when).toLocaleString()}</div>
            <div style={{fontWeight:600}}>{f.name || "Anonymous"}</div>
            <div style={{opacity:.9}}>⭐ {f.rating}/5</div>
            <div>{f.msg}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormsPage() {
  const makePdf = (title, lines) => {
    const doc = new jsPDF({ unit: "pt" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text("St Patrick's College Mackay", 100, 48);
    doc.setFontSize(12); doc.text(title, 100, 68);
    doc.setDrawColor(12,30,57); doc.setLineWidth(2); doc.line(40,86,555,86);
    doc.setFont("helvetica","normal");
    let y=112; const max=515;
    lines.forEach(line=>{ const t=doc.splitTextToSize(line,max); doc.text(t,40,y); y+=20+(t.length-1)*12; if(y>760){doc.addPage(); y=60;} });
    doc.setFontSize(9); doc.setTextColor(183,28,28);
    doc.text("College values: Compassion · Hope · Justice · Respect", 40, 800);
    doc.save(title.replace(/\s+/g,"_") + ".pdf");
  };
  return (
    <div style={{padding:16}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button onClick={()=>makePdf("Goal Setting Template",["Goal Setting Template","Teacher Name: _________","Goals: _________","Actions: _________","Timeline: _________"])} style={{padding:"8px 12px"}}><FileDown size={16}/> Goal Setting Template</button>
        <button onClick={()=>makePdf("Peer Observation Form",["Peer Observation Form","Observer: _________","Focus: _________","Notes: _________"])} style={{padding:"8px 12px"}}><FileDown size={16}/> Peer Observation</button>
        <button onClick={()=>makePdf("Post-Observation Reflection",["Post-Observation Reflection","What went well: _________","What could improve: _________"])} style={{padding:"8px 12px"}}><FileDown size={16}/> Post-Observation</button>
      </div>
    </div>
  );
}

function AdminPage({ state, setState }) {
  const [crestFile, setCrestFile] = useState(null);
  const uploadCrest = () => {
    if(!crestFile) return;
    const reader = new FileReader();
    reader.onload = (e)=> setState(prev=>({...prev, brandCrest: String(e.target.result)}));
    reader.readAsDataURL(crestFile);
  };
  const [newScriptRef, setNewScriptRef] = useState("");
  const [newScriptText, setNewScriptText] = useState("");
  const addScript = ()=>{
    if(!newScriptRef || !newScriptText) return;
    setState(prev=>({...prev, scripture:[{ref:newScriptRef, text:newScriptText}, ...(prev.scripture||[])]}));
    setNewScriptRef(""); setNewScriptText("");
  };
  return (
    <div style={{padding:16, display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12}}>
      <div style={{border:"1px solid #e2e8f0",borderRadius:8,padding:12}}>
        <div style={{fontWeight:600, marginBottom:6}}>Branding</div>
        <input type="file" accept="image/*" onChange={e=>setCrestFile(e.target.files?.[0]||null)} />
        <button onClick={uploadCrest} style={{marginLeft:8}}>Upload Crest</button>
        <div style={{fontSize:12,opacity:.7,marginTop:6}}>Accepted: PNG/JPG. Appears in header and PDFs.</div>
      </div>
      <div style={{border:"1px solid #e2e8f0",borderRadius:8,padding:12}}>
        <div style={{fontWeight:600, marginBottom:6}}>Scripture / Mission</div>
        <input placeholder="e.g. Micah 6:8" value={newScriptRef} onChange={e=>setNewScriptRef(e.target.value)} style={{width:"100%",margin:"4px 0"}}/>
        <textarea placeholder="Verse or mission statement" value={newScriptText} onChange={e=>setNewScriptText(e.target.value)} style={{width:"100%",height:80}}/>
        <button onClick={addScript} style={{marginTop:6}}>Add</button>
      </div>
    </div>
  );
}

export default function App(){
  const [state, setState] = usePersistentState();
  const [active, setActive] = useState("home");

  return (
    <div style={{minHeight:"100vh", background:"#f8fafc"}}>
      <Header crest={state.brandCrest} />
      <Tabs active={active} setActive={setActive} />
      <main>
        {active==="home" && <Dashboard state={state}/>}
        {active==="progress" && <ProgressPage state={state} setState={setState}/>}
        {active==="resources" && <ResourcesPage state={state} setState={setState}/>}
        {active==="calendar" && <CalendarPage/>}
        {active==="feedback" && <FeedbackPage state={state} setState={setState}/>}
        {active==="forms" && <FormsPage/>}
        {active==="admin" && <AdminPage state={state} setState={setState}/>}
      </main>
      <footer style={{textAlign:"center", fontSize:12, padding:"12px 8px", background:"#fff", borderTop:"1px solid #e2e8f0"}}>
        © {new Date().getFullYear()} St Patrick’s College Mackay · Navy/Gold/Red/White branding
      </footer>
      <style>{`@media print { nav, header, footer { display: none !important; } main { padding: 0 !important; } }`}</style>
    </div>
  );
}
