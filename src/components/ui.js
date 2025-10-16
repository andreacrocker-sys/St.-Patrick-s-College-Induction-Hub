import React from 'react';
export const BRAND = { navy:'#0b1e39', gold:'#d4af37', red:'#b71c1c', white:'#ffffff' };
export function Header({crest, scripture}){
  const quote = scripture?.[0];
  return <header style={{background:BRAND.navy,color:BRAND.white,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      {crest ? <img src={crest} alt='crest' style={{width:40,height:40,objectFit:'contain'}}/> : <div style={{width:40,height:40,background:BRAND.gold,borderRadius:8}}/>}
      <div>
        <div style={{fontWeight:700}}>St Patrick’s College Mackay</div>
        <div style={{fontSize:12,opacity:.8}}>Compassion · Hope · Justice · Respect</div>
      </div>
    </div>
    <div style={{fontSize:12,opacity:.9}}>{quote?.text} — <i>{quote?.ref}</i></div>
  </header>;
}
export function Tabs({active,setActive}){
  const items=[['home','Home'],['progress','Progress'],['resources','Resources'],['calendar','Calendar'],['forms','Forms'],['feedback','Feedback'],['admin','Admin']];
  return <nav style={{display:'flex',gap:8,flexWrap:'wrap',padding:8,background:'#fff',borderBottom:'1px solid #e2e8f0',position:'sticky',top:0,zIndex:10}}>
    {items.map(([k,l])=>(
      <button key={k} onClick={()=>setActive(k)} style={{padding:'6px 10px',borderRadius:8,border:'1px solid #e2e8f0',background:active===k?BRAND.gold:'#fff',color:active===k?BRAND.navy:'#111'}}>{l}</button>
    ))}
  </nav>;
}
export function ProgressCircle({percent=0,size=140,stroke=12}){
  const r = (size-stroke)/2;
  const c = 2*Math.PI*r;
  const dash = (percent/100)*c;
  return <svg width={size} height={size}>
    <circle cx={size/2} cy={size/2} r={r} stroke="#e2e8f0" strokeWidth={stroke} fill="none"/>
    <circle cx={size/2} cy={size/2} r={r} stroke={BRAND.gold} strokeWidth={stroke} fill="none"
      strokeDasharray={`${dash} ${c-dash}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="22" fill={BRAND.navy} fontWeight="700">{percent}%</text>
  </svg>;
}
export function RoleSelect({role,setRole}){
  return <div style={{display:'flex',alignItems:'center',gap:8}}>
    <span style={{fontSize:12,opacity:.8}}>Role:</span>
    <select value={role} onChange={e=>setRole(e.target.value)}>
      <option value="teacher">Teacher</option>
      <option value="aide">Teacher Aide/Educator</option>
      <option value="ancillary">Ancillary Staff</option>
      <option value="leadership">Leadership</option>
    </select>
  </div>;
}