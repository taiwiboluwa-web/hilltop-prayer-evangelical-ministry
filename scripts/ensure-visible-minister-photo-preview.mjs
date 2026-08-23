import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminPortal.tsx')
let source = fs.readFileSync(file, 'utf8')

const importLine = "import MinisterPhotoEditor from '../components/MinisterPhotoEditor';"
if (!source.includes("../components/MinisterPhotoEditor")) {
  source = source.replace("import { supabase } from '../supabase';", "import { supabase } from '../supabase';\n" + importLine)
}

// Remove malformed/duplicate preview injections left by earlier build patches.
source = source.replace(/\s*<div className="VISIBLE_MINISTER_PHOTO_PREVIEW">/g, '')
source = source.replace(/\s*<\/div>\s*(?=<div className="flex flex-wrap gap-3 mt-3">)/g, '')
source = source.replace(/\s*<MinisterPhotoEditor minister=\{ministers\.find\(m=>\(m\.display_order\?\?m\.id\)===selectedMinister\)\} images=\{\[mImage, \(ministers\.find\(m=>\(m\.display_order\?\?m\.id\)===selectedMinister\)\?\.image_url_2\|\|'\'\), \(ministers\.find\(m=>\(m\.display_order\?\?m\.id\)===selectedMinister\)\?\.image_url_3\|\|'\'\)\]\} onSaved=\{fetchMinisters\} \/>/g, '')
source = source.replace(/\s*<MinisterPhotoEditor minister=\{ministers\.find\(x => \(x\.display_order \?\? x\.id\) === selectedMinister\)\} images=\{\[mImage, mImage2, mImage3\]\} onSaved=\{fetchMinisters\} \/>/g, '')

const marker = '<form onSubmit={saveMinister} className={card}>'
const editor = "\n              <MinisterPhotoEditor minister={ministers.find(x => (x.display_order ?? x.id) === selectedMinister)} images={[mImage, mImage2, mImage3]} onSaved={fetchMinisters} />"
if (!source.includes('LIVE_MINISTER_PHOTO_PREVIEW_COMPONENT')) {
  if (!source.includes(marker)) throw new Error('Minister form not found for live photo preview')
  source = source.replace(marker, marker + "\n              {/* LIVE_MINISTER_PHOTO_PREVIEW_COMPONENT */}" + editor)
}

fs.writeFileSync(file, source)
console.log('Visible minister photo preview fixed')
