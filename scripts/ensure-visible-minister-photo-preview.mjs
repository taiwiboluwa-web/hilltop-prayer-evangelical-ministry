import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminPortal.tsx')
let source = fs.readFileSync(file, 'utf8')

if (!source.includes("import MinisterPhotoEditor from '../components/MinisterPhotoEditor';")) {
  source = source.replace("import { supabase } from '../supabase';", "import { supabase } from '../supabase';\nimport MinisterPhotoEditor from '../components/MinisterPhotoEditor';")
}

if (!source.includes('VISIBLE_MINISTER_PHOTO_PREVIEW')) {
  const marker = "          <div className=\"flex flex-wrap gap-3 mt-3\">"
  const editor = "          <MinisterPhotoEditor minister={ministers.find(m=>(m.display_order??m.id)===selectedMinister)} images={[mImage, (ministers.find(m=>(m.display_order??m.id)===selectedMinister)?.image_url_2||''), (ministers.find(m=>(m.display_order??m.id)===selectedMinister)?.image_url_3||'')]} onSaved={fetchMinisters} />\n          <div className=\"VISIBLE_MINISTER_PHOTO_PREVIEW\">"
  if (!source.includes(marker)) throw new Error('Minister form action marker not found')
  source = source.replace(marker, editor + marker)
}

fs.writeFileSync(file, source)
console.log('Visible minister photo preview rendered in AdminPortal')
