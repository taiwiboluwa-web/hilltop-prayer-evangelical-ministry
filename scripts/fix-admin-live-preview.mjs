import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminContentManager.tsx')
let s = fs.readFileSync(file, 'utf8')
s = s.replace(/\n const galleryFit=form\.image_fit==='contain'\?'contain':'cover'/g, '')
if (s.includes('const galleryPreview=preview||form.image_url') && !s.includes("const galleryPreview=preview||form.image_url\n const galleryFit=")) s = s.replace('const galleryPreview=preview||form.image_url', "const galleryPreview=preview||form.image_url\n const galleryFit=form.image_fit==='contain'?'contain':'cover'")
if(!s.includes('GALLERY_LIVE_PREVIEW_V4'))s=s.replace('export function AdminContentManager','/* GALLERY_LIVE_PREVIEW_V4 */\nexport function AdminContentManager')
fs.writeFileSync(file,s)
console.log('Gallery admin preview patch normalized: one galleryFit declaration, Fit/Fill controls only')
console.log('Minister editor state normalization skipped: maintained by dedicated minister admin patches')
