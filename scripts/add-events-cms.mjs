import { readFile, writeFile } from 'node:fs/promises'

const appPath = 'src/App.tsx'
let app = await readFile(appPath, 'utf8')
const importLine = "import { MinistryEvents } from './components/MinistryEvents'"
if (!app.includes(importLine)) {
  app = app.replace("import { Navbar, Logo } from './components/Navbar'", "import { Navbar, Logo } from './components/Navbar'\n" + importLine)
}

const eventsStart = app.indexOf('function Events() {')
const ministersStart = app.indexOf('function MinistersSection()', eventsStart)
if (eventsStart !== -1 && ministersStart !== -1) {
  const replacement = `function Events() {\n  return (\n    <section id="events" style={{ padding: '140px 24px 100px', background: 'var(--bg)', position: 'relative', overflow: 'hidden', minHeight: '80vh' }}>\n      <div className="glow-warm" style={{ width: 800, height: 600, bottom: -200, right: -100 }}/>\n      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>\n        <div className="label" style={{ marginBottom: 16 }}>Calendar</div>\n        <AnimatedText tag="h2" className="display" style={{ fontSize: 'clamp(2rem,4.5vw,3.4rem)', marginBottom: 48 }}>Upcoming Events</AnimatedText>\n        <MinistryEvents />\n      </div>\n    </section>\n  )\n}\n\n`
  app = app.slice(0, eventsStart) + replacement + app.slice(ministersStart)
}
await writeFile(appPath, app, 'utf8')

const adminPath = 'src/pages/AdminPortal.tsx'
let admin = await readFile(adminPath, 'utf8')
const adminImport = "import { AdminEvents } from './AdminEvents'"
if (!admin.includes(adminImport)) {
  admin = admin.replace("import { supabase } from '../supabase';", "import { supabase } from '../supabase';\n" + adminImport)
}
if (!admin.includes("'events'")) {
  admin = admin.replace("type Tab = 'ministers'|'gallery'|'videos'|'live'|'audio';", "type Tab = 'ministers'|'gallery'|'videos'|'live'|'audio'|'events';")
  const audioTab = "  {id:'audio',label:'Audio Messages',icon:'M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zm-7 9a7 7 0 0014 0M12 19v3m-4 0h8'},"
  admin = admin.replace(audioTab, audioTab + "\n  {id:'events',label:'Calendar / Events',icon:'M8 2v4m8-4v4M3 10h18M5 5h14a2 2 0 012 2v13H3V7a2 2 0 012-2z'},")
}
const conditional = "  if(tab==='events')return <AdminEvents onClose={()=>setTab('ministers')} />;\n"
if (!admin.includes("<AdminEvents onClose")) {
  const anchor = "  const input='w-full h-11 px-3 bg-[#111118]"
  admin = admin.replace(anchor, conditional + '\n' + anchor)
}

// AdminPortal's dashboard count map must contain every possible Tab value.
// The event manager itself loads the authoritative event list from Supabase.
const oldCounts = "const counts=useMemo(()=>({ministers:ministers.length,gallery:gallery.length,videos:sermons.length,live:liveActive?1:0,audio:audio.length}),[ministers,gallery,sermons,liveActive,audio]);"
const newCounts = "const counts=useMemo(()=>({ministers:ministers.length,gallery:gallery.length,videos:sermons.length,live:liveActive?1:0,audio:audio.length,events:0}),[ministers,gallery,sermons,liveActive,audio]);"
if (admin.includes(oldCounts)) {
  admin = admin.replace(oldCounts, newCounts)
} else if (admin.includes("events:0")) {
  // Already stabilized.
} else {
  // Keep the build idempotent if the count expression has been reformatted.
  admin = admin.replace(/const counts=useMemo\(\(\)=>\(\{([^}]*)\}\),\[([^\]]*)\]\);/, (match, body, deps) => {
    return body.includes('events:') ? match : `const counts=useMemo(()=>({${body},events:0}),[${deps}]);`
  })
}

await writeFile(adminPath, admin, 'utf8')
console.log('Supabase events calendar integration applied')
