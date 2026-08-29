import { readFile, writeFile } from 'node:fs/promises'
const path='src/pages/AdminPortal.tsx'
let s=await readFile(path,'utf8')
if(!s.includes("./AdminMinisterManager")) s=s.replace("import { supabase } from '../supabase';", "import { supabase } from '../supabase';\nimport { AdminMinisterManager } from './AdminMinisterManager';\nimport { AdminContentManager } from './AdminContentManager';")
s=s.replace(/type Tab = 'overview'\|'ministers'\|'gallery'\|'videos'\|'live'\|'audio';/, "type Tab = 'overview'|'ministers'|'gallery'|'videos'|'live'|'audio'|'events';")
if(!s.includes("id:'events'")) s=s.replace("  { id:'audio', label:'Audio Messages', short:'AU' },", "  { id:'audio', label:'Audio Messages', short:'AU' },\n  { id:'events', label:'Upcoming Events', short:'EV' },")
if(!s.includes("events: svg(")) s=s.replace("  audio: svg('M12 3", "  events: svg('M8 2v4m8-4v4M3 10h18M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2Zm4 7h2m2 0h2m-6 4h2m2 0h2'),\n  audio: svg('M12 3")
const renderLine=/  const render=\(\)=>tab==='overview'\?renderOverview\(\):tab==='ministers'\?renderMinisters\(\):tab==='gallery'\?renderGallery\(\):tab==='videos'\?renderVideos\(\):tab==='live'\?renderLive\(\):renderAudio\(\);/;
s=s.replace(renderLine,"  const render=()=>tab==='overview'?renderOverview():tab==='ministers'?<AdminMinisterManager/>:tab==='gallery'?<AdminContentManager kind=\"gallery\"/>:tab==='videos'?<AdminContentManager kind=\"videos\"/>:tab==='live'?<AdminContentManager kind=\"live\"/>:tab==='audio'?<AdminContentManager kind=\"audio\"/>:<AdminEvents onClose={()=>setTab('overview')}/>;")
s=s.replace("<Stat label=\"Live Broadcast\" value={counts.live} kind={counts.live?'green':'red'}/>","<Stat label=\"Live Broadcast\" value={counts.live} kind={counts.live?'green':'red'}/><button className=\"admin-stat\" onClick={()=>setTab('events')} style={{textAlign:'left',cursor:'pointer'}}><div className=\"admin-stat-label\"><span className=\"admin-dot\"/>Upcoming Events</div><div className=\"admin-stat-value\">Manage →</div></button>")
await writeFile(path,s,'utf8')
console.log('Admin workspace upgraded: events, full CRUD, multi-photo minister editor, live image previews')
