import React, { useEffect, useMemo, useState } from "react";
import { BRAND, Header, Tabs, ProgressCircle, RoleSelect } from "./components/ui.js";
import { useHub } from "./components/store.js";
import checklistsJson from "./data/checklists.json";
import { FileDown, Link as LinkIcon } from "lucide-react";
import jsPDF from "jspdf";

export default function App(){
  const { state, setState, toggleDone, setRole, setAdmin } = useHub();
  const [active,setActive]=useState('home');
  useEffect(()=>{ if(!state.checklists){ setState(s=>({...s, checklists: checklistsJson })); } }, []);
  const role = state.currentUser.role || 'teacher';
  const roleSections = state.checklists?.[role] || [];
  const {percent, total, done} = useMemo(()=>{
    let total=0, done=0;
    for(const sec of roleSections){
      for(const it of sec.items){
        total += 1;
        if(state.progress?.[role]?.[it.id]) done += 1;
      }
    }
    return { percent: total? Math.round(100*done/total):0, total, done };
  }, [state.progress, roleSections, role]);
  const canEdit = state.currentUser.isAdmin || state.currentUser.isMentor;
  return <div style={{minHeight:'100vh', background:'#f8fafc'}}>
    <Header crest={state.crest} scripture={state.scripture} />
    <Tabs active={active} setActive={setActive} />
    <main>
      {active==='home' && <Home percent={percent} setRole={setRole} role={role} />}
      {active==='progress' && <Progress role={role} roleSections={roleSections} percent={percent} done={done} total={total} toggleDone={toggleDone} setRole={setRole} canEdit={canEdit}/>}
      {active==='resources' && <Resources resources={state.resources} canEdit={canEdit} setState={setState}/>}
      {active==='calendar' && <Calendar events={state.calendar} canEdit={canEdit} setState={setState}/>}
      {active==='forms' && <Forms forms={state.forms} resources={state.resources}/>}
      {active==='feedback' && <Feedback/>}
      {active==='admin' && <AdminGate canEdit={canEdit} setAdmin={setAdmin}><AdminPanel/></AdminGate>}
    </main>
    <footer style={{textAlign:'center',fontSize:12,padding:'12px 8px',background:'#fff',borderTop:'1px solid #e2e8f0'}}>
      © {new Date().getFullYear()} St Patrick’s College Mackay · Navy/Gold/Red/White branding
    </footer>
    <style>{`@media print { nav, header, footer { display:none !important; } main { padding:0 !important; } }`}</style>
  </div>;
}

function Home({percent, role, setRole}){
  return <div style={{padding:16, display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}}>
    <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:16,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <ProgressCircle percent={percent}/>
    </div>
    <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:16}}>
      <h3 style={{marginTop:0,color:BRAND.navy}}>Quick Actions</h3>
      <ul>
        <li>Open Progress tracker</li>
        <li>Upload or link your Induction Handbook (Resources)</li>
        <li>Download Forms</li>
      </ul>
      <div style={{marginTop:12}}><RoleSelect role={role} setRole={e=>setRole(e)}/></div>
    </div>
  </div>;
}

function Progress({role, roleSections, percent, done, total, toggleDone, setRole, canEdit}){
  const [filter,setFilter]=useState('');
  return <div style={{padding:16}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
      <div style={{display:'flex',alignItems:'center',gap:16}}>
        <RoleSelect role={role} setRole={setRole}/>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <ProgressCircle percent={percent} size={100} stroke={10}/>
          <div><div style={{fontWeight:700}}>{done}/{total} complete</div><div style={{fontSize:12,opacity:.7}}>Tap items to mark complete</div></div>
        </div>
      </div>
      <input placeholder="Search items…" value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:'6px 10px'}}/>
    </div>
    {roleSections.map(sec=>{
      const items = sec.items.filter(it=> it.label.toLowerCase().includes(filter.toLowerCase()));
      if(items.length===0) return null;
      return <section key={sec.id} style={{border:'1px solid #e2e8f0',borderRadius:12,background:'#fff',margin:'10px 0'}}>
        <div style={{padding:'10px 14px',background:'#f8fafc',borderBottom:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between'}}>
          <strong>{sec.title}</strong>
        </div>
        <div style={{padding:12}}>
          {items.map(it=> <ItemRow key={it.id} role={role} item={it} toggleDone={toggleDone} canEdit={canEdit}/>)}
        </div>
      </section>;
    })}
  </div>;
}

function ItemRow({role,item,toggleDone,canEdit}){
  const [link, setLink] = useState(item.link || '');
  const [edit, setEdit] = useState(false);
  const isDone = (window.localStorage.getItem('spc_v2_state') && JSON.parse(window.localStorage.getItem('spc_v2_state')).progress?.[role]?.[item.id]) || false;
  const applyLink = ()=>{
    const st = JSON.parse(localStorage.getItem('spc_v2_state'));
    const next = {...st};
    for(const roleKey of Object.keys(next.checklists)){
      for(const sec of next.checklists[roleKey]){
        const idx = sec.items.findIndex(i=>i.id===item.id);
        if(idx>=0){ sec.items[idx] = {...sec.items[idx], link }; }
      }
    }
    localStorage.setItem('spc_v2_state', JSON.stringify(next));
    window.location.reload();
  };
  return <div style={{display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:10, padding:'6px 0', borderBottom:'1px solid #f1f5f9'}}>
    <button onClick={()=>toggleDone(role,item.id)} title="Mark complete" style={{width:22,height:22,borderRadius:11,border:'1px solid #e2e8f0', background:isDone?BRAND.gold:'#fff'}} />
    <div>
      <div style={{fontWeight:600}}>{item.label}</div>
      {item.link && <a href={item.link} target="_blank" rel="noreferrer" style={{fontSize:12, display:'inline-flex', alignItems:'center', gap:4}}><LinkIcon size={14}/> Open related info</a>}
      {canEdit && <div style={{marginTop:6}}>
        {!edit && <button onClick={()=>setEdit(true)} style={{fontSize:12}}>Add/Edit link</button>}
        {edit && <div style={{display:'flex',gap:6}}>
          <input placeholder="Paste link to website or resource" value={link} onChange={e=>setLink(e.target.value)} style={{flex:1}}/>
          <button onClick={applyLink}>Save</button>
          <button onClick={()=>setEdit(false)}>Cancel</button>
        </div>}
      </div>}
    </div>
    {isDone && <span style={{color:BRAND.navy,fontSize:12,fontWeight:700}}>Done</span>}
  </div>;
}

function Resources({resources, canEdit, setState}){
  const [q,setQ]=useState('');
  const filtered = resources.filter(r=> (r.title||'').toLowerCase().includes(q.toLowerCase()));
  return <div style={{padding:16}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <input placeholder="Search resources…" value={q} onChange={e=>setQ(e.target.value)} style={{padding:'6px 10px'}}/>
      <div style={{fontSize:12,opacity:.7}}>Tip: upload Teacher Handbook PDF in Admin → Resources.</div>
    </div>
    <div style={{display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))'}}>
      {filtered.map(r=>(
        <div key={r.id} style={{border:'1px solid #e2e8f0',borderRadius:12,background:'#fff',padding:12,display:'flex',flexDirection:'column',gap:6}}>
          <div style={{fontWeight:700}}>{r.title}</div>
          <div style={{fontSize:12,opacity:.7}}>{(r.type||'link').toUpperCase()}</div>
          <div style={{display:'flex',gap:8,marginTop:6}}>
            <button onClick={()=>window.open(r.url,'_blank')}>Open</button>
            <button onClick={()=>navigator.clipboard.writeText(r.url)}>Copy Link</button>
          </div>
        </div>
      ))}
      {filtered.length===0 && <div style={{opacity:.7}}>No resources yet. Add some in Admin.</div>}
    </div>
  </div>;
}

function Calendar({events, canEdit, setState}){
  const [date,setDate]=useState(''); const [title,setTitle]=useState(''); const [loc,setLoc]=useState('');
  const add=()=>{ if(!canEdit) return; if(!date||!title) return; const id='cal-'+Date.now();
    setState(s=>({...s,calendar:[...s.calendar,{id,date,title,location:loc}]})); setDate(''); setTitle(''); setLoc(''); };
  const del=(id)=> setState(s=>({...s,calendar:s.calendar.filter(e=>e.id!==id)}));
  return <div style={{padding:16}}>
    {canEdit && <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
      <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <input placeholder="Location" value={loc} onChange={e=>setLoc(e.target.value)} />
      <button onClick={add}>Add</button>
    </div>}
    <div style={{border:'1px solid #e2e8f0',borderRadius:12,overflow:'hidden'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead style={{background:'#f8fafc'}}>
          <tr><th style={{textAlign:'left',padding:8}}>Date</th><th style={{textAlign:'left',padding:8}}>Title</th><th style={{textAlign:'left',padding:8}}>Location</th><th></th></tr>
        </thead>
        <tbody>
          {events.map(e=>(
            <tr key={e.id} style={{borderTop:'1px solid #e2e8f0'}}>
              <td style={{padding:8}}>{e.date}</td>
              <td style={{padding:8}}>{e.title}</td>
              <td style={{padding:8}}>{e.location}</td>
              <td style={{padding:8,textAlign:'right'}}>{canEdit && <button onClick={()=>del(e.id)} style={{fontSize:12}}>Delete</button>}</td>
            </tr>
          ))}
          {events.length===0 && <tr><td colSpan="4" style={{padding:12,opacity:.7}}>No events yet.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>;
}

function Forms({forms}){
  const generate = (title, lines)=>{
    const doc=new jsPDF({unit:'pt'});
    doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.text("St Patrick's College Mackay",100,48);
    doc.setFontSize(12); doc.text(title,100,68);
    doc.setDrawColor(12,30,57); doc.setLineWidth(2); doc.line(40,86,555,86);
    let y=112; const max=515; doc.setFont('helvetica','normal');
    lines.forEach(line=>{ const t=doc.splitTextToSize(line,max); doc.text(t,40,y); y+=20+(t.length-1)*12; if(y>760){doc.addPage(); y=60;} });
    doc.save(title.replace(/\s+/g,'_')+'.pdf');
  };
  const fallback = [
    {title:'Goal Setting Template', lines:['Goal Setting Template','Teacher: ______','Goals: ______','Actions: ______','Timeline: ______']},
    {title:'Peer Observation Form', lines:['Peer Observation Form','Observer: ______','Focus: ______','Notes: ______']},
    {title:'Post-Observation Reflection', lines:['Post-Observation Reflection','What went well: ______','What could improve: ______']},
  ];
  return <div style={{padding:16}}>
    {forms.length>0 ? (
      <div style={{display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))'}}>
        {forms.map(f=>(
          <div key={f.id} style={{border:'1px solid #e2e8f0',borderRadius:12,background:'#fff',padding:12}}>
            <div style={{fontWeight:700}}>{f.title}</div>
            <button onClick={()=>window.open(f.url,'_blank')} style={{marginTop:8}}><FileDown size={16}/> Open PDF</button>
          </div>
        ))}
      </div>
    ) : (
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {fallback.map(f=>(<button key={f.title} onClick={()=>generate(f.title,f.lines)} style={{padding:'8px 12px'}}><FileDown size={16}/> {f.title}</button>))}
      </div>
    )}
    <div style={{fontSize:12,opacity:.7,marginTop:8}}>Upload official handbook forms in Admin to replace these templates.</div>
  </div>;
}

function Feedback(){
  const [name,setName]=useState(''); const [msg,setMsg]=useState(''); const [rating,setRating]=useState(3);
  const submit=()=>{ alert('Thanks for your feedback!'); setName(''); setMsg(''); setRating(3); };
  return <div style={{padding:16,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:12}}>
    <div style={{border:'1px solid #e2e8f0',borderRadius:12,padding:12}}>
      <div style={{fontWeight:700,marginBottom:6}}>Submit Feedback</div>
      <input placeholder="Your name (optional)" value={name} onChange={e=>setName(e.target.value)} style={{width:'100%',margin:'4px 0'}}/>
      <label>Rating: {rating}</label>
      <input type="range" min={1} max={5} value={rating} onChange={e=>setRating(Number(e.target.value))} style={{width:'100%'}}/>
      <textarea placeholder="What’s working well? What could improve?" value={msg} onChange={e=>setMsg(e.target.value)} style={{width:'100%',height:100,marginTop:6}}/>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <button onClick={submit}>Send</button>
      </div>
    </div>
    <div style={{border:'1px solid #e2e8f0',borderRadius:12,padding:12}}>
      <div style={{fontWeight:700,marginBottom:6}}>Why this matters</div>
      <p>Your feedback helps refine induction for all staff and mentors.</p>
    </div>
  </div>;
}

function AdminGate({canEdit,setAdmin,children}){
  const [code,setCode]=useState('');
  if(canEdit) return children;
  return <div style={{padding:16}}>
    <div style={{border:'1px solid #e2e8f0',borderRadius:12,padding:16,background:'#fff',maxWidth:420}}>
      <h3>Admin / Mentor Access</h3>
      <p>Enter the admin code to unlock editing tools (branding, resources, calendar, forms, and checklist links).</p>
      <input placeholder="Enter admin code" value={code} onChange={e=>setCode(e.target.value)} />
      <button onClick={()=> setAdmin(code === 'SPC-ADMIN-2025')} style={{marginLeft:8}}>Unlock</button>
      <div style={{fontSize:12,opacity:.7,marginTop:6}}>Default demo code: <b>SPC-ADMIN-2025</b> (you can change this later in code).</div>
    </div>
  </div>;
}

function AdminPanel(){
  const Comp = React.lazy(()=> import('./components/Admin.jsx'));
  return <React.Suspense fallback={<div style={{padding:16}}>Loading admin tools…</div>}>
    <Comp/>
  </React.Suspense>;
}