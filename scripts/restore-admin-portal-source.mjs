import fs from 'node:fs/promises'

// Restore AdminPortal from the known-good baseline before the remaining build
// patches run. This step is intentionally idempotent so repeated Vercel builds
// cannot accumulate duplicate React state or stale gallery controls.
const sourceUrl = 'https://raw.githubusercontent.com/taiwiboluwa-web/hilltop-prayer-evangelical-ministry/e3e0d1362e0658f237ff142a62edb0e59c0aa4d9/src/pages/AdminPortal.tsx'
const response = await fetch(sourceUrl)
if (!response.ok) throw new Error(`Unable to restore AdminPortal source: ${response.status}`)
let source = await response.text()

if (!source.includes('function AdminPortal') && !source.includes('function AdminPortal({')) {
  throw new Error('AdminPortal source validation failed')
}

source = source.replace(
  /interface Minister \{[^}]+\}/,
  "interface Minister { id:number|string; name:string; role:string; desc?:string; desc_text?:string; image_url?:string; img?:string; image_url_2?:string; image_url_3?:string; image_fit?:'cover'|'contain'; display_order:number }"
)

const canonicalMinisterState = "  const [ministers,setMinisters]=useState<Minister[]>([]),[selectedMinister,setSelectedMinister]=useState(1),[mName,setMName]=useState(''),[mRole,setMRole]=useState(''),[mDesc,setMDesc]=useState(''),[mImage,setMImage]=useState('');\n  const [mImage2,setMImage2]=useState(''),[mImage3,setMImage3]=useState('');\n  const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');"

// Replace the entire minister state region, regardless of what an older build
// left behind. This is what prevents the mImage2/mImage3 redeclaration loop.
const adminStart = source.indexOf('export function AdminPortal({ onBack }: AdminPortalProps)')
const ministersStart = source.indexOf('  const [ministers,setMinisters', adminStart)
const galleryStateStart = source.indexOf('  const [gallery,setGallery', ministersStart)
if (adminStart < 0 || ministersStart < 0 || galleryStateStart < 0) throw new Error('AdminPortal minister state anchors not found')
source = source.slice(0, ministersStart) + canonicalMinisterState + '\n' + source.slice(galleryStateStart)

source = source.replace(
  "setMImage(m.image_url||m.img||'')",
  "setMImage(m.image_url||m.img||'');setMImage2(m.image_url_2||'');setMImage3(m.image_url_3||'');setMinisterFit(m.image_fit==='contain'?'contain':'cover')"
)
source = source.replace(
  "setMImage(m?.image_url||m?.img||'')",
  "setMImage(m?.image_url||m?.img||'');setMImage2(m?.image_url_2||'');setMImage3(m?.image_url_3||'');setMinisterFit(m?.image_fit==='contain'?'contain':'cover')"
)
source = source.replace(
  "image_url:mImage,img:mImage,display_order:selectedMinister",
  "image_url:mImage,img:mImage,image_url_2:mImage2,image_url_3:mImage3,image_fit:ministerFit,display_order:selectedMinister"
)

if (!source.includes("import { GalleryMomentsManager }")) {
  source = source.replace(
    "import { supabase } from '../supabase';",
    "import { supabase } from '../supabase';\nimport { GalleryMomentsManager } from '../components/GalleryMomentsManager';"
  )
}

// Always replace the legacy single-image Gallery Moments editor with the
// grouped uploader. Do not depend on a previous patch having run.
const galleryRenderStart = source.indexOf('  const renderGallery=()=> <>')
const galleryRenderEnd = source.indexOf('  const renderVideos=()=>', galleryRenderStart)
if (galleryRenderStart >= 0 && galleryRenderEnd > galleryRenderStart) {
  source = source.slice(0, galleryRenderStart) + "  const renderGallery=()=> <GalleryMomentsManager />;\n\n" + source.slice(galleryRenderEnd)
} else if (!source.includes('const renderGallery=()=> <GalleryMomentsManager />')) {
  throw new Error('AdminPortal Gallery Moments render anchor not found')
}

for (const [name, pattern] of [
  ['mImage2', /const \[mImage2,setMImage2\]=useState/g],
  ['mImage3', /const \[mImage3,setMImage3\]=useState/g],
  ['ministerFit', /const \[ministerFit,setMinisterFit\]=useState/g],
]) {
  const count = source.match(pattern)?.length ?? 0
  if (count !== 1) throw new Error(`AdminPortal restoration produced ${count} ${name} state declarations`)
}

if (!source.includes('image_url_2') || !source.includes('image_url_3') || !source.includes('ministerFit')) {
  throw new Error('AdminPortal minister photo fields are missing after restoration')
}
if (!source.includes('const renderGallery=()=> <GalleryMomentsManager />')) {
  throw new Error('Grouped Gallery Moments UI is missing after restoration')
}

await fs.writeFile('src/pages/AdminPortal.tsx', source, 'utf8')
console.log('AdminPortal restored safely with multi-photo minister editor and grouped Gallery Moments uploader')
