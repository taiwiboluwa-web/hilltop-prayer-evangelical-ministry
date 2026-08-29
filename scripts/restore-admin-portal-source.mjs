import fs from 'node:fs/promises'

// AdminPortal had a bad generated commit that replaced most of the dashboard.
// Always restore the last known-good full dashboard source before other build
// patches run, then apply the small, deterministic additions required by the
// current minister editor and grouped gallery uploader.
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

const ministerState = "  const [ministers,setMinisters]=useState<Minister[]>([]),[selectedMinister,setSelectedMinister]=useState(1),[mName,setMName]=useState(''),[mRole,setMRole]=useState(''),[mDesc,setMDesc]=useState(''),[mImage,setMImage]=useState('');"
if (!source.includes("const [mImage2,setMImage2]")) {
  source = source.replace(
    ministerState,
    ministerState + "\n  const [mImage2,setMImage2]=useState(''),[mImage3,setMImage3]=useState('');\n  const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');"
  )
}

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

const galleryStart = source.indexOf('  const renderGallery=()=> <>')
const galleryEnd = source.indexOf('  const renderVideos=()=>', galleryStart)
if (galleryStart >= 0 && galleryEnd > galleryStart && !source.slice(galleryStart, galleryEnd).includes('GalleryMomentsManager')) {
  source = source.slice(0, galleryStart) + "  const renderGallery=()=> <GalleryMomentsManager />;\n\n" + source.slice(galleryEnd)
}

if (!source.includes('image_url_2') || !source.includes('image_url_3') || !source.includes('ministerFit') || !source.includes('GalleryMomentsManager')) {
  throw new Error('AdminPortal restoration validation failed')
}

await fs.writeFile('src/pages/AdminPortal.tsx', source, 'utf8')
console.log('AdminPortal restored from known-good source with minister photo fields and grouped Gallery Moments support')
