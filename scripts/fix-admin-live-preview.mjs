import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminContentManager.tsx')
let s = fs.readFileSync(file, 'utf8')
s = s.replace(/\n const galleryFit=form\.image_fit==='contain'\?'contain':'cover'/g, '')
if (s.includes('const galleryPreview=preview||form.image_url') && !s.includes("const galleryPreview=preview||form.image_url\n const galleryFit=")) s = s.replace('const galleryPreview=preview||form.image_url', "const galleryPreview=preview||form.image_url\n const galleryFit=form.image_fit==='contain'?'contain':'cover'")
if(!s.includes('GALLERY_LIVE_PREVIEW_V4'))s=s.replace('export function AdminContentManager','/* GALLERY_LIVE_PREVIEW_V4 */\nexport function AdminContentManager')
fs.writeFileSync(file,s)
console.log('Gallery admin preview patch normalized: one galleryFit declaration, Fit/Fill controls only')

// Keep the legacy minister editor references type-safe without destructively
// rewriting AdminPortal. Add the state only when its consumers exist and the
// declarations are genuinely missing.
const ministerFile = path.resolve('src/pages/AdminPortal.tsx')
let minister = fs.readFileSync(ministerFile, 'utf8')
const needsFit = minister.includes('ministerFit') || minister.includes('setMinisterFit')
const hasFit = minister.includes("const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');")
if (needsFit && !hasFit) {
  const anchor = "const [ministers,setMinisters]=useState<Minister[]>([]),[selectedMinister,setSelectedMinister]=useState(1),[mName,setMName]=useState(''),[mRole,setMRole]=useState(''),[mDesc,setMDesc]=useState(''),[mImage,setMImage]=useState('');"
  if (minister.includes(anchor)) {
    minister = minister.replace(anchor, anchor + "\n  const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');")
    fs.writeFileSync(ministerFile, minister)
    console.log('Minister editor fit state restored safely')
  } else {
    console.log('Minister editor fit state anchor not found; leaving AdminPortal unchanged')
  }
} else {
  console.log('Minister editor fit state already present; no change required')
}
