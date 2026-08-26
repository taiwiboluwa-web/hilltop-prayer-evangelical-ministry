import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/components/GalleryMomentsEnhancer.tsx')
let source = fs.readFileSync(file, 'utf8')

// Keep the public renderer deliberately simple: it must use the exact same
// two modes exposed by AdminContentManager. Legacy zoom/position values are
// intentionally ignored so old database rows cannot change the live result.
source = source.replace(
  /type GalleryItem = \{[^}]+\}/,
  "type GalleryItem = { id:string; title:string; image_url:string; media_type:'image'|'video'; mime_type?:string|null; created_at?:string; image_fit?:'cover'|'contain' }"
)
source = source.replace(
  /const imageStyle=\(item:GalleryItem\):React\.CSSProperties=>\(\{[^}]+\}\)/,
  "const imageStyle=(item:GalleryItem):React.CSSProperties=>({width:'100%',height:'100%',display:'block',objectFit:item.image_fit==='contain'?'contain':'cover',objectPosition:'center',transform:'none',transformOrigin:'center center'})"
)
source = source.replace(
  "Use Admin Portal → Gallery Moments for the full image fit, zoom and positioning controls.",
  "Admin Portal controls: Fit image to preview or Fill image to preview. The public gallery uses the same setting."
)
source = source.replace(
  "/* GALLERY_LIVE_RENDERING_V2 */\n",
  ""
)
if (!source.includes('GALLERY_LIVE_RENDERING_V3')) source = source.replace('export function GalleryMomentsEnhancer', '/* GALLERY_LIVE_RENDERING_V3 */\nexport function GalleryMomentsEnhancer')
fs.writeFileSync(file, source)
console.log('Gallery public renderer synchronized to Admin Fit/Fill settings')