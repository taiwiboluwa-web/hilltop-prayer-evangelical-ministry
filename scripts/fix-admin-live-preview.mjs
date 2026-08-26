import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminContentManager.tsx')
let s = fs.readFileSync(file, 'utf8')

// Remove every previous copy of the derived galleryFit declaration, then add
// exactly one declaration after galleryPreview. This makes the build patch
// safe to run repeatedly and prevents TS2451 redeclaration failures.
s = s.replace(/\n const galleryFit=form\.image_fit==='contain'\?'contain':'cover'/g, '')
if (s.includes('const galleryPreview=preview||form.image_url') && !s.includes("const galleryPreview=preview||form.image_url\n const galleryFit=")) {
  s = s.replace(
    "const galleryPreview=preview||form.image_url",
    "const galleryPreview=preview||form.image_url\n const galleryFit=form.image_fit==='contain'?'contain':'cover'"
  )
}

// Keep the simple, standard two-mode editor. Remove any legacy crop/zoom UI
// if an older build patch left it behind.
s = s.replace(/<div className=\"admin-field\"><label>Image preview mode<\/label>[\s\S]*?<\/div>/g, '')

// Ensure the preview-mode controls exist exactly once for the gallery form.
if (!s.includes('>Fit image to preview</button>')) {
  const marker = "<div className=\"admin-field\"><label>Upload image from your device</label>"
  const start = s.indexOf(marker)
  if (start !== -1) {
    const end = s.indexOf('</div>', start) + 6
    if (end > 5) {
      s = s.slice(0, end) + "<div className=\"admin-field\"><label>Preview mode</label><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><button type=\"button\" className={`admin-btn ${galleryFit==='contain'?'gold':''}`} onClick={()=>update('image_fit','contain')}>Fit image to preview</button><button type=\"button\" className={`admin-btn ${galleryFit==='cover'?'gold':''}`} onClick={()=>update('image_fit','cover')}>Fill image to preview</button></div></div>" + s.slice(end)
    }
  }
}

if (!s.includes('GALLERY_LIVE_PREVIEW_V4')) s = s.replace('export function AdminContentManager', '/* GALLERY_LIVE_PREVIEW_V4 */\nexport function AdminContentManager')
fs.writeFileSync(file, s)
console.log('Gallery admin preview patch normalized: one galleryFit declaration, Fit/Fill controls only')

// The minister editor was being patched with ministerFit references without
// reliably creating the React state first. Repair that at the source during
// the build, before TypeScript runs. This is deliberately idempotent.
const ministerFile = path.resolve('src/pages/AdminPortal.tsx')
let minister = fs.readFileSync(ministerFile, 'utf8')

minister = minister.replace(
  /interface Minister \{[^}]*\}/,
  "interface Minister { id:number|string; name:string; role:string; desc?:string; desc_text?:string; image_url?:string; img?:string; image_url_2?:string; image_url_3?:string; image_fit?:'cover'|'contain'; display_order:number }"
)

if (!minister.includes("const [ministerFit,setMinisterFit]")) {
  const stateMarker = "const [mImage,setMImage]=useState('');"
  if (minister.includes(stateMarker)) {
    minister = minister.replace(
      stateMarker,
      stateMarker + "\n  const [mImage2,setMImage2]=useState(''),[mImage3,setMImage3]=useState('');\n  const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');"
    )
  } else {
    const fetchMarker = "  const fetchMinisters=async()=>"
    minister = minister.replace(
      fetchMarker,
      "  const [mImage2,setMImage2]=useState(''),[mImage3,setMImage3]=useState('');\n  const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');\n\n" + fetchMarker
    )
  }
}

minister = minister.replace(
  "setMImage(m.image_url||m.img||'')",
  "setMImage(m.image_url||m.img||'');setMImage2(m.image_url_2||'');setMImage3(m.image_url_3||'');setMinisterFit(m.image_fit==='contain'?'contain':'cover')"
)
minister = minister.replace(
  "setMImage(m?.image_url||m?.img||'')",
  "setMImage(m?.image_url||m?.img||'');setMImage2(m?.image_url_2||'');setMImage3(m?.image_url_3||'');setMinisterFit(m?.image_fit==='contain'?'contain':'cover')"
)

minister = minister.replace(
  "image_url:mImage,img:mImage,display_order:selectedMinister",
  "image_url:mImage,img:mImage,image_url_2:mImage2,image_url_3:mImage3,image_fit:ministerFit,display_order:selectedMinister"
)

fs.writeFileSync(ministerFile, minister)
console.log('Minister editor state repaired: Fit/Fill state is guaranteed before TypeScript')
