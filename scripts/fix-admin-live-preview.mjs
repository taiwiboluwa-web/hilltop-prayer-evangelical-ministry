import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminContentManager.tsx')
let s = fs.readFileSync(file, 'utf8')
s = s.replace(/\n const galleryFit=form\.image_fit==='contain'\?'contain':'cover'/g, '')
if (s.includes('const galleryPreview=preview||form.image_url') && !s.includes("const galleryPreview=preview||form.image_url\n const galleryFit=")) s = s.replace('const galleryPreview=preview||form.image_url', "const galleryPreview=preview||form.image_url\n const galleryFit=form.image_fit==='contain'?'contain':'cover'")
s = s.replace(/<div className=\"admin-field\"><label>Image preview mode<\/label>[\s\S]*?<\/div>/g, '')
if (!s.includes('>Fit image to preview</button>')) {
 const marker='<div className="admin-field"><label>Upload image from your device</label>'
 const start=s.indexOf(marker)
 if(start!==-1){
  const end=s.indexOf('</div>',start)+6
  if(end>5)s=s.slice(0,end)+"<div className=\"admin-field\"><label>Preview mode</label><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><button type=\"button\" className={`admin-btn ${galleryFit==='contain'?'gold':''}`} onClick={()=>update('image_fit','contain')}>Fit image to preview</button><button type=\"button\" className={`admin-btn ${galleryFit==='cover'?'gold':''}`} onClick={()=>update('image_fit','cover')}>Fill image to preview</button></div></div>"+s.slice(end)
 }
}
if(!s.includes('GALLERY_LIVE_PREVIEW_V4'))s=s.replace('export function AdminContentManager','/* GALLERY_LIVE_PREVIEW_V4 */\nexport function AdminContentManager')
fs.writeFileSync(file,s)
console.log('Gallery admin preview patch normalized: one galleryFit declaration, Fit/Fill controls only')

// Legacy minister normalization: safe to skip when the primary state is absent.
const ministerFile=path.resolve('src/pages/AdminPortal.tsx')
let minister=fs.readFileSync(ministerFile,'utf8')
minister=minister.replace(/interface Minister \{[^}]*\}/,"interface Minister { id:number|string; name:string; role:string; desc?:string; desc_text?:string; image_url?:string; img?:string; image_url_2?:string; image_url_3?:string; image_fit?:'cover'|'contain'; display_order:number }")
const stateBlock="\n  const [mImage2,setMImage2]=useState('');\n  const [mImage3,setMImage3]=useState('');\n  const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');"
const primaryState=/\[mImage,setMImage\]=useState\(''\);/
if(!/const \[mImage2,setMImage2\]=useState\(''\);/.test(minister)){
 const match=minister.match(primaryState)
 if(match&&match.index!=null){const insertAt=match.index+match[0].length;minister=minister.slice(0,insertAt)+stateBlock+minister.slice(insertAt)}
 else console.log('Minister editor state already normalized; skipping legacy state insertion')
}
let seenM2=false
minister=minister.replace(/\n\s*const \[mImage2,setMImage2\]=useState\(''\);/g,m=>{if(seenM2)return '';seenM2=true;return m})
let seenM3=false
minister=minister.replace(/\n\s*const \[mImage3,setMImage3\]=useState\(''\);/g,m=>{if(seenM3)return '';seenM3=true;return m})
let seenFit=false
minister=minister.replace(/\n\s*const \[ministerFit,setMinisterFit\]=useState<'cover'|'contain'>\('cover'\);/g,m=>{if(seenFit)return '';seenFit=true;return m})
fs.writeFileSync(ministerFile,minister)
console.log('Minister editor live preview patch applied safely')
