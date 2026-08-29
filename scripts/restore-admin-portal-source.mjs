import fs from 'node:fs/promises'

// AdminPortal is restored from a known-good source before the remaining build
// patches run. Keep this step completely idempotent: repeated Vercel builds
// must produce the same AdminPortal source and must never append duplicate
// React state declarations.
const sourceUrl = 'https://raw.githubusercontent.com/taiwiboluwa-web/hilltop-prayer-evangelical-ministry/e3e0d1362e0658f237ff142a62edb0e59c0aa4d9/src/pages/AdminPortal.tsx'
const response = await fetch(sourceUrl)
if (!response.ok) throw new Error(`Unable to restore AdminPortal source: ${response.status}`)
let source = await response.text()

if (!source.includes('function AdminPortal') && !source.includes('function AdminPortal({')) {
  throw new Error('AdminPortal source validation failed')
}

// Canonical Minister type. These fields are optional because older Supabase
// rows may only have image_url/img populated.
source = source.replace(
  /interface Minister \{[^}]+\}/,
  "interface Minister { id:number|string; name:string; role:string; desc?:string; desc_text?:string; image_url?:string; img?:string; image_url_2?:string; image_url_3?:string; image_fit?:'cover'|'contain'; display_order:number }"
)

// Replace the entire minister state declaration with exactly one canonical
// declaration. This is safer than checking whether individual fragments exist.
const ministerStatePattern = /  const \[ministers,setMinisters\]=useState<Minister\[\]>\(\[\]\),\[selectedMinister,setSelectedMinister\]=useState\(1\),\[mName,setMName\]=useState\(''\),\[mRole,setMRole\]=useState\(''\),\[mDesc,setMDesc\]=useState\(''\),\[mImage,setMImage\]=useState\(''\);(?:\n  const \[mImage2,setMImage2\]=useState\(''\),\[mImage3,setMImage3\]=useState\(''\);)?(?:\n  const \[mImage2,setMImage2\]=useState\(''\),\[mImage3,setMImage3\]=useState\(''\);)?(?:\n  const \[ministerFit,setMinisterFit\]=useState<'cover'\|'contain'>\('cover'\);)?/g
const canonicalMinisterState = "  const [ministers,setMinisters]=useState<Minister[]>([]),[selectedMinister,setSelectedMinister]=useState(1),[mName,setMName]=useState(''),[mRole,setMRole]=useState(''),[mDesc,setMDesc]=useState(''),[mImage,setMImage]=useState('');\n  const [mImage2,setMImage2]=useState(''),[mImage3,setMImage3]=useState('');\n  const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');"
if (!ministerStatePattern.test(source)) {
  // Fallback for a source that has a different whitespace layout: replace the
  // first minister declaration line between the AdminPortal function and the
  // gallery state declaration.
  const adminStart = source.indexOf('export function AdminPortal({ onBack }: AdminPortalProps)')
  const galleryState = source.indexOf("  const [gallery,setGallery", adminStart)
  if (adminStart < 0 || galleryState < 0) throw new Error('AdminPortal minister state anchor not found')
  const before = source.slice(0, adminStart)
  const body = source.slice(adminStart, galleryState)
  const stateStart = body.indexOf('  const [ministers,setMinisters')
  if (stateStart < 0) throw new Error('AdminPortal minister state declaration not found')
  source = before + body.slice(0, stateStart) + canonicalMinisterState + '\n' + body.slice(body.indexOf('\n', stateStart) + 1) + source.slice(galleryState)
} else {
  source = source.replace(ministerStatePattern, canonicalMinisterState + '\n')
}

// Normalize minister loading/selection so the extra photos and Fit/Fill mode
// always follow the selected record.
source = source.replace(
  /setMImage\(m\.image_url\|\|m\.img\|\|'\'\)\)/g,
  "setMImage(m.image_url||m.img||'');setMImage2(m.image_url_2||'');setMImage3(m.image_url_3||'');setMinisterFit(m.image_fit==='contain'?'contain':'cover')"
)
source = source.replace(
  /setMImage\(m\.image_url\|\|m\.img\|\|'\'\)\}\)\}/g,
  "setMImage(m.image_url||m.img||'');setMImage2(m.image_url_2||'');setMImage3(m.image_url_3||'');setMinisterFit(m.image_fit==='contain'?'contain':'cover')}}"
)
source = source.replace(
  "setMImage(m?.image_url||m?.img||'')",
  "setMImage(m?.image_url||m?.img||'');setMImage2(m?.image_url_2||'');setMImage3(m?.image_url_3||'');setMinisterFit(m?.image_fit==='contain'?'contain':'cover')"
)

// Canonicalize the minister save payload if the base source has it.
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

const galleryStart = source.indexOf('  const renderGallery=()=> <>')
const galleryEnd = source.indexOf('  const renderVideos=()=>', galleryStart)
if (galleryStart >= 0 && galleryEnd > galleryStart && !source.slice(galleryStart, galleryEnd).includes('GalleryMomentsManager')) {
  source = source.slice(0, galleryStart) + "  const renderGallery=()=> <GalleryMomentsManager />;\n\n" + source.slice(galleryEnd)
}

if (!source.includes('image_url_2') || !source.includes('image_url_3') || !source.includes('ministerFit') || !source.includes('GalleryMomentsManager')) {
  throw new Error('AdminPortal restoration validation failed')
}

// Hard safety checks: duplicate declarations are a build-breaking condition.
const duplicateStatePatterns = [
  /const \[mImage2,setMImage2\]=useState/g,
  /const \[mImage3,setMImage3\]=useState/g,
  /const \[ministerFit,setMinisterFit\]=useState/g,
]
for (const pattern of duplicateStatePatterns) {
  const count = source.match(pattern)?.length ?? 0
  if (count !== 1) throw new Error(`AdminPortal restoration produced ${count} copies of ${pattern}`)
}

await fs.writeFile('src/pages/AdminPortal.tsx', source, 'utf8')
console.log('AdminPortal restored with idempotent minister photo fields and grouped Gallery Moments support')
