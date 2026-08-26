import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminContentManager.tsx')
let s = fs.readFileSync(file, 'utf8')

// Remove every previous copy of the derived galleryFit declaration, then add
// exactly one declaration after galleryPreview. This makes the build patch
// safe to run repeatedly and prevents TS2451 redeclaration failures.
s = s.replace(/\n const galleryFit=form\.image_fit==='contain'\?'contain':'cover'/g, '')
if (s.includes('const galleryPreview=preview||form.image_url') && !s.includes("const galleryPreview=preview||form.image_url\n const galleryFit=")) {
  s = s.replace(
    "const galleryPreview=preview||form.image_url",
    "const galleryPreview=preview||form.image_url\n const galleryFit=form.image_fit==='contain'?'contain':'cover'"
  )
}

// Keep the simple, standard two-mode editor. Remove any legacy crop/zoom UI
// if an older build patch left it behind.
s = s.replace(/<div className=\"admin-field\"><label>Image preview mode<\/label>[\s\S]*?<\/div>/g, '')

// Ensure the preview-mode controls exist exactly once for the gallery form.
if (!s.includes('>Fit image to preview</button>')) {
  const marker = "<div className=\"admin-field\"><label>Upload image from your device</label>"
  const start = s.indexOf(marker)
  if (start !== -1) {
    const end = s.indexOf('</div>', start) + 6
    if (end > 5) {
      s = s.slice(0, end) + "<div className=\"admin-field\"><label>Preview mode</label><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><button type=\"button\" className={`admin-btn ${galleryFit==='contain'?'gold':''}`} onClick={()=>update('image_fit','contain')}>Fit image to preview</button><button type=\"button\" className={`admin-btn ${galleryFit==='cover'?'gold':''}`} onClick={()=>update('image_fit','cover')}>Fill image to preview</button></div></div>" + s.slice(end)
    }
  }
}

if (!s.includes('GALLERY_LIVE_PREVIEW_V4')) s = s.replace('export function AdminContentManager', '/* GALLERY_LIVE_PREVIEW_V4 */\nexport function AdminContentManager')
fs.writeFileSync(file, s)
console.log('Gallery admin preview patch normalized: one galleryFit declaration, Fit/Fill controls only')