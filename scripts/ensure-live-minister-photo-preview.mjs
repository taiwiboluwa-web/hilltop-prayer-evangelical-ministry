import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('src/pages/AdminPortal.tsx');
let source = fs.readFileSync(file, 'utf8');

const importLine = "import MinisterPhotoEditor from '../components/MinisterPhotoEditor';\n";
if (!source.includes("../components/MinisterPhotoEditor")) {
  source = source.replace("import { supabase } from '../supabase';\n", "import { supabase } from '../supabase';\n" + importLine);
}

const marker = '<form onSubmit={saveMinister} className={card}>';
const component = `<MinisterPhotoEditor minister={ministers.find(x => (x.display_order ?? x.id) === selectedMinister)} images={[mImage, mImage2, mImage3]} onSaved={fetchMinisters} />`;

if (!source.includes('LIVE_MINISTER_PHOTO_PREVIEW_COMPONENT')) {
  if (!source.includes(marker)) throw new Error('Minister form not found for live photo preview');
  source = source.replace(marker, marker + '\n              {/* LIVE_MINISTER_PHOTO_PREVIEW_COMPONENT */}\n              ' + component);
}

fs.writeFileSync(file, source);
console.log('Live minister photo preview injected');
