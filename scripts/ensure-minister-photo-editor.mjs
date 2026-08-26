import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminPortal.tsx')
let source = fs.readFileSync(file, 'utf8')

// Remove legacy editor state injected by earlier builds.
source = source.replace(/,\[mImage2,setMImage2\]=useState\(''\),\[mImage3,setMImage3\]=useState\(''\)/g, '')
source = source.replace(/,\[photoEditor,setPhotoEditor\]=useState\(1\),\[photoZoom,setPhotoZoom\]=useState\([^)]*\),\[photoX,setPhotoX\]=useState\([^)]*\),\[photoY,setPhotoY\]=useState\([^)]*\),\[photoFit,setPhotoFit\]=useState<[^>]+>\('cover'\)/g, '')

// Keep the data model compatible, but presentation is controlled only by image_fit.
source = source.replace(/interface Minister \{[^}]+\}/, "interface Minister { id:number|string; name:string; role:string; desc?:string; desc_text?:string; image_url?:string; img?:string; image_fit?:'cover'|'contain'; display_order:number }")

if (!source.includes('STANDARD_MINISTER_FIT_FILL')) {
  const stateNeedle = "const [ministers,setMinisters]=useState<Minister[]>([]),[selectedMinister,setSelectedMinister]=useState(1),[mName,setMName]=useState(''),[mRole,setMRole]=useState(''),[mDesc,setMDesc]=useState(''),[mImage,setMImage]=useState('');"
  const stateReplacement = stateNeedle + "\n  const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');"
  if (source.includes(stateNeedle)) source = source.replace(stateNeedle, stateReplacement)

  source = source.replace("setMImage(m.image_url||m.img||'')", "setMImage(m.image_url||m.img||'');setMinisterFit(m.image_fit==='contain'?'contain':'cover')")
  source = source.replace("setMImage(m?.image_url||m?.img||'')", "setMImage(m?.image_url||m?.img||'');setMinisterFit(m?.image_fit==='contain'?'contain':'cover')")

  source = source.replace("image_url:mImage,img:mImage,display_order:selectedMinister", "image_url:mImage,img:mImage,image_fit:ministerFit,display_order:selectedMinister")

  const marker = "<div className=\"admin-field\"><label>Or upload a photo</label>"
  const simplePreview = `<div className=\"admin-field\"><label>Minister photo preview</label><div style={{width:'100%',height:300,background:'#080906',overflow:'hidden',border:'1px solid rgba(255,255,255,.09)',display:'flex',alignItems:'center',justifyContent:'center'}}>{mImage?<img src={mImage} alt=\"Minister live preview\" style={{width:'100%',height:'100%',objectFit:ministerFit}}/>:<span className=\"admin-helper\">Upload a photo to preview it</span>}</div><div style={{display:'flex',gap:8,marginTop:10}}><button type=\"button\" className=\"admin-btn\" onClick={()=>setMinisterFit('contain')}>Fit image to preview</button><button type=\"button\" className=\"admin-btn\" onClick={()=>setMinisterFit('cover')}>Fill image to preview</button></div><div className=\"admin-helper\" style={{marginTop:8}}>This exact Fit/Fill setting is saved with the minister and used on the public website.</div></div>`
  if (source.includes(marker)) source = source.replace(marker, simplePreview + marker)

  source += "\n/* STANDARD_MINISTER_FIT_FILL */\n"
}

fs.writeFileSync(file, source)
console.log('Minister photo editor standardized: Fit/Fill only, no zoom or position controls')
