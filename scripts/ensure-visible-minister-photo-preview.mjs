import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminPortal.tsx')
let source = fs.readFileSync(file, 'utf8')

const importLine = "import MinisterPhotoEditor from '../components/MinisterPhotoEditor';"
if (!source.includes("../components/MinisterPhotoEditor")) {
  source = source.replace("import { supabase } from '../supabase';", "import { supabase } from '../supabase';\n" + importLine)
}

// ensure-live-minister-photo-preview.mjs runs immediately before this script.
// If it already placed the editor in the minister form, do nothing. This avoids
// duplicate JSX and, importantly, never adds an unmatched wrapper <div>.
if (source.includes('LIVE_MINISTER_PHOTO_PREVIEW_COMPONENT')) {
  fs.writeFileSync(file, source)
  console.log('Visible minister photo preview already present; skipped duplicate injection')
  process.exit(0)
}

const marker = '<form onSubmit={saveMinister} className={card}>'
const editor = "\n              {/* LIVE_MINISTER_PHOTO_PREVIEW_COMPONENT */}\n              <MinisterPhotoEditor minister={ministers.find(x => (x.display_order ?? x.id) === selectedMinister)} images={[mImage, mImage2, mImage3]} onSaved={fetchMinisters} />"

if (!source.includes(marker)) throw new Error('Minister form not found for live photo preview')
source = source.replace(marker, marker + editor)

fs.writeFileSync(file, source)
console.log('Visible minister photo preview rendered in AdminPortal')
