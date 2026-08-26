import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminContentManager.tsx')
let s = fs.readFileSync(file, 'utf8')

s = s.replace(/\n const galleryFit=form\.image_fit==='contain'\?'contain':'cover'/g, '')
if (s.includes('const galleryPreview=preview||form.image_url') && !s.includes("const galleryPreview=preview||form.image_url\n const galleryFit=")) {
  s = s.replace('const galleryPreview=preview||form.image_url', "const galleryPreview=preview||form.image_url\n const galleryFit=form.image_fit==='contain'?'contain':'cover'")
}
s = s.replace(/<div className=\"admin-field\"><label>Image preview mode<\/label>[\s\S]*?<\/div>/g, '')
if (!s.includes('>Fit image to preview</button>')) {
  const marker = '<div className="admin-field"><label>Upload image from your device</label>'
  const start = s.indexOf(marker)
  if (start !== -1) {
    const end = s.indexOf('</div>', start) + 6
    if (end > 5) s = s.slice(0, end) + "<div className=\"admin-field\"><label>Preview mode</label><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><button type=\"button\" className={`admin-btn ${galleryFit==='contain'?'gold':''}`} onClick={()=>update('image_fit','contain')}>Fit image to preview</button><button type=\"button\" className={`admin-btn ${galleryFit==='cover'?'gold':''}`} onClick={()=>update('image_fit','cover')}>Fill image to preview</button></div></div>" + s.slice(end)
  }
}
if (!s.includes('GALLERY_LIVE_PREVIEW_V4')) s = s.replace('export function AdminContentManager', '/* GALLERY_LIVE_PREVIEW_V4 */\nexport function AdminContentManager')
fs.writeFileSync(file, s)
console.log('Gallery admin preview patch normalized: one galleryFit declaration, Fit/Fill controls only')

const ministerFile = path.resolve('src/pages/AdminPortal.tsx')
let minister = fs.readFileSync(ministerFile, 'utf8')

minister = minister.replace(/interface Minister \{[^}]*\}/, "interface Minister { id:number|string; name:string; role:string; desc?:string; desc_text?:string; image_url?:string; img?:string; image_url_2?:string; image_url_3?:string; image_fit?:'cover'|'contain'; display_order:number }")

// Remove every previous generated declaration, including declarations accidentally
// embedded in the large combined React state declaration.
minister = minister.replace(/\s*const \[mImage2,setMImage2\]=useState\(''\);?/g, '')
minister = minister.replace(/\s*const \[mImage3,setMImage3\]=useState\(''\);?/g, '')
minister = minister.replace(/\s*const \[ministerFit,setMinisterFit\]=useState<'cover'\|'contain'>\('cover'\);?/g, '')
minister = minister.replace(/,?\s*\[mImage2,setMImage2\]=useState\(''\)/g, '')
minister = minister.replace(/,?\s*\[mImage3,setMImage3\]=useState\(''\)/g, '')
minister = minister.replace(/,?\s*\[ministerFit,setMinisterFit\]=useState<'cover'\|'contain'>\('cover'\)/g, '')

// The primary image state lives inside a large combined `const` declaration.
// Insert the generated states AFTER its semicolon, never inside that declaration.
const stateBlock = "\n  const [mImage2,setMImage2]=useState('');\n  const [mImage3,setMImage3]=useState('');\n  const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');"
const primaryState = /\[mImage,setMImage\]=useState\(''\);/
if (!/const \[mImage2,setMImage2\]=useState\(''\);/.test(minister)) {
  const match = minister.match(primaryState)
  if (!match || match.index == null) throw new Error('Minister editor state normalization failed: primary image state was not found')
  const insertAt = match.index + match[0].length
  minister = minister.slice(0, insertAt) + stateBlock + minister.slice(insertAt)
}

// Remove any accidental duplicate canonical blocks while preserving the first one.
let seenM2 = false
minister = minister.replace(/\n\s*const \[mImage2,setMImage2\]=useState\(''\);/g, m => {
  if (seenM2) return ''
  seenM2 = true
  return m
})
let seenM3 = false
minister = minister.replace(/\n\s*const \[mImage3,setMImage3\]=useState\(''\);/g, m => {
  if (seenM3) return ''
  seenM3 = true
  return m
})
let seenFit = false
minister = minister.replace(/\n\s*const \[ministerFit,setMinisterFit\]=useState<'cover'\|'contain'>\('cover'\);/g, m => {
  if (seenFit) return ''
  seenFit = true
  return m
})

// Ensure loading/selection restores the saved Fit/Fill value and secondary photos.
minister = minister.replace(/setMImage\(m\.image_url\|\|m\.img\|\|''\)(?:;setMImage2\(m\.image_url_2\|\|''\);setMImage3\(m\.image_url_3\|\|''\);setMinisterFit\(m\.image_fit==='contain'\?'contain':'cover'\))?/g, "setMImage(m.image_url||m.img||'');setMImage2(m.image_url_2||'');setMImage3(m.image_url_3||'');setMinisterFit(m.image_fit==='contain'?'contain':'cover')")
minister = minister.replace(/setMImage\(m\?\.image_url\|\|m\?\.img\|\|''\)(?:;setMImage2\(m\?\.image_url_2\|\|''\);setMImage3\(m\?\.image_url_3\|\|''\);setMinisterFit\(m\?\.image_fit==='contain'\?'contain':'cover'\))?/g, "setMImage(m?.image_url||m?.img||'');setMImage2(m?.image_url_2||'');setMImage3(m?.image_url_3||'');setMinisterFit(m?.image_fit==='contain'?'contain':'cover')")

// Ensure the save payload persists all three photos and the Fit/Fill selection.
minister = minister.replace(/image_url:mImage,img:mImage(?:,image_url_2:mImage2,image_url_3:mImage3,image_fit:ministerFit)?,display_order:selectedMinister/, "image_url:mImage,img:mImage,image_url_2:mImage2,image_url_3:mImage3,image_fit:ministerFit,display_order:selectedMinister")

const counts = {
  m2: (minister.match(/const \[mImage2,setMImage2\]=useState\(''\);/g) || []).length,
  m3: (minister.match(/const \[mImage3,setMImage3\]=useState\(''\);/g) || []).length,
  fit: (minister.match(/const \[ministerFit,setMinisterFit\]=useState<'cover'\|'contain'>\('cover'\);/g) || []).length
}
if (counts.m2 !== 1 || counts.m3 !== 1 || counts.fit !== 1) {
  throw new Error(`Minister editor state normalization failed: expected one Fit/Fill state block (mImage2=${counts.m2}, mImage3=${counts.m3}, ministerFit=${counts.fit})`)
}

fs.writeFileSync(ministerFile, minister)
console.log('Minister editor source normalized: exactly one Fit/Fill state block, no duplicate declarations')
