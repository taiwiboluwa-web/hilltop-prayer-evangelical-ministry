import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminContentManager.tsx')
let s = fs.readFileSync(file, 'utf8')
if (s.includes('GALLERY_LIVE_PREVIEW_V3')) process.exit(0)

s = s.replace("const galleryDefaults = { image_fit: 'cover' }", "const galleryDefaults = { image_fit: 'cover' }")
s = s.replace("const galleryPreview=preview||form.image_url", "const galleryPreview=preview||form.image_url\n const galleryFit=form.image_fit==='contain'?'contain':'cover'")
s = s.replace("<div className=\"admin-field\"><label>Image preview mode</label><select className=\"admin-select\" value={form.image_fit||'cover'} onChange={e=>update('image_fit',e.target.value)}><option value=\"contain\">Fit image to preview</option><option value=\"cover\">Fill image to preview</option></select></div>", "<div className=\"admin-field\"><label>Preview mode</label><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><button type=\"button\" className={`admin-btn ${galleryFit==='contain'?'gold':''}`} onClick={()=>update('image_fit','contain')}>Fit image to preview</button><button type=\"button\" className={`admin-btn ${galleryFit==='cover'?'gold':''}`} onClick={()=>update('image_fit','cover')}>Fill image to preview</button></div></div>")
s = s.replace("export function AdminContentManager", "/* GALLERY_LIVE_PREVIEW_V3 */\nexport function AdminContentManager")
fs.writeFileSync(file, s)
console.log('Gallery admin preview standardized to exact public frame')