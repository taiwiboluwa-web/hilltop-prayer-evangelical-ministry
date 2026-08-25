import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/components/GalleryMomentsEnhancer.tsx')
let source = fs.readFileSync(file, 'utf8')
if (source.includes('GALLERY_LIVE_RENDERING_V2')) process.exit(0)

source = source.replace(
  "created_at?: string\n}",
  "created_at?: string\n  image_fit?: 'cover' | 'contain'\n  image_zoom?: number\n  image_position_x?: number\n  image_position_y?: number\n}")
source = source.replace(
  "const box = admin ? 'aspect-[4/3]' : 'aspect-[16/10]'\n  return <div className={`${box} bg-black overflow-hidden relative`}>",
  "const box = admin ? 'aspect-[4/3]' : 'aspect-[16/10]'\n  const fit = item.image_fit === 'contain' ? 'contain' : 'cover'\n  const zoom = Math.max(1, Math.min(3, Number(item.image_zoom) || 1))\n  const x = Number(item.image_position_x ?? 50)\n  const y = Number(item.image_position_y ?? 50)\n  const mediaStyle: React.CSSProperties = { width:'100%', height:'100%', objectFit:fit, objectPosition:`${x}% ${y}%`, transform:`scale(${zoom})`, transformOrigin:'center center', display:'block' }\n  return <div className={`${box} bg-black overflow-hidden relative`}>")
source = source.replace(
  "<video src={item.image_url} controls playsInline preload=\"metadata\" className=\"w-full h-full object-cover\" />",
  "<video src={item.image_url} controls playsInline preload=\"metadata\" style={mediaStyle} />"
)
source = source.replace(
  "<img src={item.image_url} alt={item.title} loading=\"lazy\" className=\"w-full h-full object-cover\" />",
  "<img src={item.image_url} alt={item.title} loading=\"lazy\" style={mediaStyle} />"
)
source = source.replace('export function GalleryMomentsEnhancer', '/* GALLERY_LIVE_RENDERING_V2 */\nexport function GalleryMomentsEnhancer')
fs.writeFileSync(file, source)
console.log('Gallery public rendering now uses saved admin crop settings')
