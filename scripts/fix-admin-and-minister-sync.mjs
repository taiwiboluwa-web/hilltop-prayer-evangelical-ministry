import fs from 'node:fs'
import path from 'node:path'

const adminCss = path.resolve('src/admin.css')
let css = fs.readFileSync(adminCss, 'utf8')

// The React sidebar uses Tailwind width classes. Support both arbitrary widths and
// the standard w-16/w-64 variants so the actual <aside> width changes, not just labels.
const compatibility = `
/* Sidebar width compatibility: support both arbitrary and standard Tailwind width classes. */
body:has(aside.w-16) aside,body:has(aside.w-16) aside[class*="w-16"]{width:68px!important;min-width:68px!important;flex-basis:68px!important}
body:has(aside.w-16) aside .p-3>span,body:has(aside.w-16) aside .p-3 button>span,body:has(aside.w-16) aside>div:last-child span{width:0!important;opacity:0!important;margin:0!important;padding:0!important}
body:has(aside.w-16) aside .p-3 button{justify-content:center!important;padding:6px!important;gap:0!important}
body:has(aside.w-16) aside .p-3 button>div{width:40px!important;min-width:40px!important}
body:has(aside.w-16) aside>div:last-child{padding:14px 8px!important}
body:has(aside.w-64) aside,body:has(aside.w-64) aside[class*="w-64"]{width:248px!important;min-width:248px!important;flex-basis:248px!important}
body:has(aside.w-64) aside .p-3>span,body:has(aside.w-64) aside .p-3 button>span,body:has(aside.w-64) aside>div:last-child span{width:auto!important;opacity:1!important}
body:has(aside.w-64) aside .p-3 button{justify-content:flex-start!important;padding:6px 10px!important;gap:11px!important}
`
if (!css.includes('Sidebar width compatibility: support both')) fs.writeFileSync(adminCss, css + compatibility)

const appFile = path.resolve('src/App.tsx')
let app = fs.readFileSync(appFile, 'utf8')

// Keep the initial public fallback at the same three minister slots requested by the admin.
const open4 = /,\s*\{ id: 4, name: 'Open Slot', role: 'Associate Minister',[\s\S]*?img: IMGS\.worship \}/
const open5 = /,\s*\{ id: 5, name: 'Open Slot', role: 'Outreach Minister',[\s\S]*?img: IMGS\.community \}/
app = app.replace(open4, '').replace(open5, '')
fs.writeFileSync(appFile, app)

// Upgrade the minister editor to support up to three photos per minister.
const adminFile = path.resolve('src/pages/AdminPortal.tsx')
let admin = fs.readFileSync(adminFile, 'utf8')

admin = admin.replace(
  "interface Minister { id:number; name:string; role:string; desc?:string; desc_text?:string; image_url?:string; img?:string; display_order:number }",
  "interface Minister { id:string|number; name:string; role:string; desc?:string; desc_text?:string; image_url?:string; img?:string; image_url_2?:string; image_url_3?:string; display_order:number }"
)

admin = admin.replace(
  "[mName,setMName]=useState(''),[mRole,setMRole]=useState(''),[mDesc,setMDesc]=useState(''),[mImage,setMImage]=useState('');",
  "[mName,setMName]=useState(''),[mRole,setMRole]=useState(''),[mDesc,setMDesc]=useState(''),[mImage,setMImage]=useState(''),[mImage2,setMImage2]=useState(''),[mImage3,setMImage3]=useState('');"
)

admin = admin.replace(
  "setMImage(m.image_url||m.img||'')",
  "setMImage(m.image_url||m.img||'');setMImage2(m.image_url_2||'');setMImage3(m.image_url_3||'')"
)

admin = admin.replace(
  "setMDesc(m?.desc_text||m?.desc||'');setMImage(m?.image_url||m?.img||'')",
  "setMDesc(m?.desc_text||m?.desc||'');setMImage(m?.image_url||m?.img||'');setMImage2(m?.image_url_2||'');setMImage3(m?.image_url_3||'')"
)

admin = admin.replace(
  "setMName('');setMRole('');setMDesc('');setMImage('');await fetchMinisters()",
  "setMName('');setMRole('');setMDesc('');setMImage('');setMImage2('');setMImage3('');await fetchMinisters()"
)

admin = admin.replace(
  "image_url:mImage,img:mImage,display_order:selectedMinister",
  "image_url:mImage,img:mImage,image_url_2:mImage2,image_url_3:mImage3,display_order:selectedMinister"
)

const oldImages = `<div className="grid md:grid-cols-2 gap-4"><label className={label}>Picture URL<input className={input} value={mImage} onChange={e=>setMImage(e.target.value)} placeholder="https://…"/></label><label className={label}>Upload picture<input type="file" accept="image/*" onChange={e=>upload(e,'gallery',setMImage)} className="w-full h-11 pt-2 px-2 text-xs bg-[#111118] border border-dashed border-white/10 rounded-xl"/></label></div>`
const newImages = `<div className="space-y-4"><div className="flex items-center justify-between"><div><p className="text-[9px] tracking-[.16em] uppercase text-neutral-400">Minister photos</p><p className="text-[11px] text-neutral-600 mt-1">Add 1, 2, or 3 photos for this minister.</p></div><span className="text-[9px] uppercase tracking-wider text-[#e4c76b]">Up to 3</span></div><div className="grid md:grid-cols-3 gap-4"><label className={label}>Photo 1<input className={input} value={mImage} onChange={e=>setMImage(e.target.value)} placeholder="Photo URL"/><input type="file" accept="image/*" onChange={e=>upload(e,'gallery',setMImage)} className="mt-2 w-full h-10 pt-2 px-2 text-[10px] bg-[#111118] border border-dashed border-white/10 rounded-xl"/></label><label className={label}>Photo 2<input className={input} value={mImage2} onChange={e=>setMImage2(e.target.value)} placeholder="Optional URL"/><input type="file" accept="image/*" onChange={e=>upload(e,'gallery',setMImage2)} className="mt-2 w-full h-10 pt-2 px-2 text-[10px] bg-[#111118] border border-dashed border-white/10 rounded-xl"/></label><label className={label}>Photo 3<input className={input} value={mImage3} onChange={e=>setMImage3(e.target.value)} placeholder="Optional URL"/><input type="file" accept="image/*" onChange={e=>upload(e,'gallery',setMImage3)} className="mt-2 w-full h-10 pt-2 px-2 text-[10px] bg-[#111118] border border-dashed border-white/10 rounded-xl"/></label></div></div>`
if (admin.includes(oldImages)) admin = admin.replace(oldImages, newImages)

fs.writeFileSync(adminFile, admin)
console.log('Admin sidebar compatibility, three-slot public fallback, minister table support, and three-photo minister editor applied')
