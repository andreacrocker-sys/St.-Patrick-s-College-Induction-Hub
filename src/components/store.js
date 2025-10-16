import { create } from 'zustand';
const defaultState = {
  currentUser: { id:'u-1', name:'Guest', role:'teacher', isAdmin:false, isMentor:false },
  scripture: [{ref:'Micah 6:8', text:'Act justly, love mercy, and walk humbly with your God.'}],
  crest: null,
  resources: [],
  forms: [],
  calendar: [],
  checklists: null,
  progress: {},
};
export const useHub = create((set,get)=>({
  state: JSON.parse(localStorage.getItem('spc_v2_state')||'null') || defaultState,
  setState: (updater)=> set(s=>{
    const next = typeof updater==='function' ? updater(s.state) : updater;
    localStorage.setItem('spc_v2_state', JSON.stringify(next));
    return { state: next };
  }),
  toggleDone: (role, itemId)=> set(s=>{
    const st = {...s.state};
    st.progress = st.progress || {};
    const roleProg = st.progress[role] || {};
    roleProg[itemId] = !roleProg[itemId];
    st.progress[role] = roleProg;
    localStorage.setItem('spc_v2_state', JSON.stringify(st));
    return { state: st };
  }),
  setRole: (role)=> set(s=>({ state: {...s.state, currentUser: {...s.state.currentUser, role} } })),
  setAdmin: (isAdmin)=> set(s=>({ state: {...s.state, currentUser: {...s.state.currentUser, isAdmin} } })),
}));