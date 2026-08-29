import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminContentManager.tsx')
let s = fs.readFileSync(file, 'utf8')
s = s.replace(/\n const galleryFit=form\.image_fit==='contain'\?'contain':'cover'/g, '')
if (s.includes('const galleryPreview=preview||form.image_url') && !s.includes("const galleryPreview=preview||form.image_url\n const galleryFit=")) s = s.replace('const galleryPreview=preview||form.image_url', "const galleryPreview=preview||form.image_url\n const galleryFit=form.image_fit==='contain'?'contain':'cover'")
if(!s.includes('GALLERY_LIVE_PREVIEW_V4'))s=s.replace('export function AdminContentManager','/* GALLERY_LIVE_PREVIEW_V4 */\nexport function AdminContentManager')
fs.writeFileSync(file,s)
console.log('Gallery admin preview patch normalized: one galleryFit declaration, Fit/Fill controls only')

// Final deterministic guard for minister Fit/Fill state. Earlier build steps
// may change the declaration formatting, so only insert the missing state.
const ministerFile = path.resolve('src/pages/AdminPortal.tsx')
let minister = fs.readFileSync(ministerFile, 'utf8')
const hasFit = /const\s*\[ministerFit\s*,\s*setMinisterFit\]\s*=\s*useState/.test(minister)
const needsFit = minister.includes('ministerFit') || minister.includes('setMinisterFit')
if (needsFit && !hasFit) {
  const anchor = 'const [ministers,setMinisters]=useState<Minister[]>([])'
  const start = minister.indexOf(anchor)
  if (start < 0) throw new Error('Minister state anchor not found')
  const end = minister.indexOf(';', start)
  if (end < 0) throw new Error('Minister state declaration terminator not found')
  minister = minister.slice(0, end + 1) + "\n  const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');" + minister.slice(end + 1)
  fs.writeFileSync(ministerFile, minister)
  console.log('Minister editor fit state restored safely')
} else {
  console.log('Minister editor fit state already present; no change required')
}
