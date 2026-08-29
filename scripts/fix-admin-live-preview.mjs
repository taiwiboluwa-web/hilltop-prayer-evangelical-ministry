import fs from 'node:fs'
import path from 'node:path'

const galleryFile = path.resolve('src/pages/AdminContentManager.tsx')
let gallery = fs.readFileSync(galleryFile, 'utf8')

gallery = gallery.replace(/\n const galleryFit=form\.image_fit==='contain'\?'contain':'cover'/g, '')
if (gallery.includes('const galleryPreview=preview||form.image_url') && !gallery.includes("const galleryPreview=preview||form.image_url\n const galleryFit=")) {
  gallery = gallery.replace('const galleryPreview=preview||form.image_url', "const galleryPreview=preview||form.image_url\n const galleryFit=form.image_fit==='contain'?'contain':'cover'")
}
gallery = gallery.replace(/<div className=\"admin-field\"><label>Image preview mode<\/label>[\s\S]*?<\/div>/g, '')
if (!gallery.includes('>Fit image to preview</button>')) {
  const marker = '<div className="admin-field"><label>Upload image from your device</label>'
  const start = gallery.indexOf(marker)
  if (start !== -1) {
    const end = gallery.indexOf('</div>', start) + 6
    if (end > 5) gallery = gallery.slice(0, end) + "<div className=\"admin-field\"><label>Preview mode</label><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><button type=\"button\" className={`admin-btn ${galleryFit==='contain'?'gold':''}`} onClick={()=>update('image_fit','contain')}>Fit image to preview</button><button type=\"button\" className={`admin-btn ${galleryFit==='cover'?'gold':''}`} onClick={()=>update('image_fit','cover')}>Fill image to preview</button></div></div>" + gallery.slice(end)
  }
}
if (!gallery.includes('GALLERY_LIVE_PREVIEW_V4')) gallery = gallery.replace('export function AdminContentManager', '/* GALLERY_LIVE_PREVIEW_V4 */\nexport function AdminContentManager')
fs.writeFileSync(galleryFile, gallery)
console.log('Gallery admin preview patch normalized: one galleryFit declaration, Fit/Fill controls only')

const ministerFile = path.resolve('src/pages/AdminPortal.tsx')
let minister = fs.readFileSync(ministerFile, 'utf8')

minister = minister.replace(/interface Minister \{[^}]*\}/, "interface Minister { id:string|number; name:string; role:string; desc?:string; desc_text?:string; image_url?:string; img?:string; image_url_2?:string; image_url_3?:string; image_fit?:'cover'|'contain'; display_order:number }")

// Remove every historical state tuple globally. The pipe in the TypeScript
// union is escaped so the JavaScript RegExp matches the complete declaration.
const historicalStateTuples = [
  /\[mImage2,setMImage2\]=useState\(''\)/g,
  /\[mImage3,setMImage3\]=useState\(''\)/g,
  /\[ministerFit,setMinisterFit\]=useState<'cover'\|'contain'>\('cover'\)/g,
]
for (const pattern of historicalStateTuples) minister = minister.replace(pattern, '')

minister = minister.replace(/const\s*;\s*/g, '')
minister = minister.replace(/,\s*;/g, ';')
minister = minister.replace(/const\s*,/g, 'const ')

const adminStart = minister.indexOf('export function AdminPortal({ onBack }: AdminPortalProps)')
const ministersStart = minister.indexOf('  const [ministers,setMinisters', adminStart)
const galleryStateStart = minister.indexOf('  const [gallery,setGallery', ministersStart)
if (adminStart < 0 || ministersStart < 0 || galleryStateStart < 0) throw new Error('Minister state anchors not found in AdminPortal')

const canonicalMinisterState = `  const [ministers,setMinisters]=useState<Minister[]>([]),[selectedMinister,setSelectedMinister]=useState(1),[mName,setMName]=useState(''),[mRole,setMRole]=useState(''),[mDesc,setMDesc]=useState(''),[mImage,setMImage]=useState('');
  const [mImage2,setMImage2]=useState('');
  const [mImage3,setMImage3]=useState('');
  const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');
`
minister = minister.slice(0, ministersStart) + canonicalMinisterState + minister.slice(galleryStateStart)

minister = minister.replace(/setMImage\(m\.image_url\|\|m\.img\|\|''\)(?:;setMImage2\(m\.image_url_2\|\|''\);setMImage3\(m\.image_url_3\|\|''\);setMinisterFit\(m\.image_fit==='contain'\?'contain':'cover'\))?/g, "setMImage(m.image_url||m.img||'');setMImage2(m.image_url_2||'');setMImage3(m.image_url_3||'');setMinisterFit(m.image_fit==='contain'?'contain':'cover')")
minister = minister.replace(/setMImage\(m\?\.image_url\|\|m\?\.img\|\|''\)(?:;setMImage2\(m\?\.image_url_2\|\|''\);setMImage3\(m\?\.image_url_3\|\|''\);setMinisterFit\(m\?\.image_fit==='contain'\?'contain':'cover'\))?/g, "setMImage(m?.image_url||m?.img||'');setMImage2(m?.image_url_2||'');setMImage3(m?.image_url_3||'');setMinisterFit(m?.image_fit==='contain'?'contain':'cover')")
minister = minister.replace(/image_url:mImage,img:mImage(?:,image_url_2:mImage2,image_url_3:mImage3,image_fit:ministerFit)?,display_order:selectedMinister/, "image_url:mImage,img:mImage,image_url_2:mImage2,image_url_3:mImage3,image_fit:ministerFit,display_order:selectedMinister")

const counts = {
  m2: (minister.match(/const \[mImage2,setMImage2\]=useState\(''\);/g) || []).length,
  m3: (minister.match(/const \[mImage3,setMImage3\]=useState\(''\);/g) || []).length,
  fit: (minister.match(/const \[ministerFit,setMinisterFit\]=useState<'cover'|'contain'>\('cover'\);/g) || []).length
}
if (counts.m2 !== 1 || counts.m3 !== 1 || counts.fit !== 1) throw new Error(`Minister editor state normalization failed: expected one Fit/Fill state block (mImage2=${counts.m2}, mImage3=${counts.m3}, ministerFit=${counts.fit})`)

fs.writeFileSync(ministerFile, minister)
console.log('Minister editor source normalized: exactly one Fit/Fill state block, no duplicate declarations')
