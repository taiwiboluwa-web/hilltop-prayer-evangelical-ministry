import fs from 'node:fs/promises'

// Restore AdminPortal from the known-good baseline before the remaining build
// patches run. This step must be idempotent: every Vercel build must produce
// exactly one copy of each React state declaration.
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

// Replace everything from the ministers state declaration up to the gallery
// state declaration. This removes any old/duplicate mImage2/mImage3 state.
const adminStart = source.indexOf('export function AdminPortal({ onBack }: AdminPortalProps)')
const ministersStart = source.indexOf('  const [ministers,setMinisters', adminStart)
const galleryStartState = source.indexOf('  const [gallery,setGallery', ministersStart)
if (adminStart < 0 || ministersStart < 0 || galleryStartState < 0) {
  throw new Error('AdminPortal minister state anchors not found')
}
const beforeMinisterState = source.slice(0, ministersStart)
const afterMinisterState = source.slice(galleryStartState)
source = beforeMinisterState + canonicalMinisterState + '\n' + afterMinisterState

// Synchronize the three minister photo fields and Fit/Fill mode when loading
// or selecting a minister. Plain string replacements keep this deterministic.
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

const galleryRenderStart = source.indexOf('  const renderGallery=()=> <>')
const galleryRenderEnd = source.indexOf('  const renderVideos=()=>', galleryRenderStart)
if (galleryRenderStart >= 0 && galleryRenderEnd > galleryRenderStart && !source.slice(galleryRenderStart, galleryRenderEnd).includes('GalleryMomentsManager')) {
  source = source.slice(0, galleryRenderStart) + "  const renderGallery=()=> <GalleryMomentsManager />;\n\n" + source.slice(galleryRenderEnd)
}

// Build-time safety checks. Fail before tsc if this file is ever malformed.
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
if (!source.includes('GalleryMomentsManager')) {
  throw new Error('AdminPortal grouped Gallery Moments manager is missing after restoration')
}

await fs.writeFile('src/pages/AdminPortal.tsx', source, 'utf8')
console.log('AdminPortal restored safely with minister photo fields and grouped Gallery Moments support')
