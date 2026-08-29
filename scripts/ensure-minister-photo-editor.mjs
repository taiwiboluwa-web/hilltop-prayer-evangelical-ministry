import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminPortal.tsx')
let source = fs.readFileSync(file, 'utf8')
source = source.replace(/,\[photoEditor,setPhotoEditor\]=useState\(1\),\[photoZoom,setPhotoZoom\]=useState\([^)]*\),\[photoX,setPhotoX\]=useState\([^)]*\),\[photoY,setPhotoY\]=useState\([^)]*\),\[photoFit,setPhotoFit\]=useState<[^>]+>\('cover'\)/g, '')
source = source.replace(/interface Minister \{[^}]+\}/, "interface Minister { id:string|number; name:string; role:string; desc?:string; desc_text?:string; image_url?:string; img?:string; image_url_2?:string; image_url_3?:string; image_fit?:'cover'|'contain'; display_order:number }")

const ministerAnchor = "const [ministers,setMinisters]=useState<Minister[]>([])"
if (!source.includes("const [ministerFit,setMinisterFit]")) {
  const i = source.indexOf(ministerAnchor)
  if (i >= 0) {
    const end = source.indexOf(';', i)
    if (end >= 0) source = source.slice(0, end + 1) + "\n  const [mImage2,setMImage2]=useState(''),[mImage3,setMImage3]=useState('');\n  const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');" + source.slice(end + 1)
  }
}
if (!source.includes("const [ministerFit,setMinisterFit]")) throw new Error('Unable to restore minister fit state')

source = source.replace("setMImage(m.image_url||m.img||'')", "setMImage(m.image_url||m.img||'');setMImage2(m.image_url_2||'');setMImage3(m.image_url_3||'');setMinisterFit(m.image_fit==='contain'?'contain':'cover')")
source = source.replace("setMImage(m?.image_url||m?.img||'')", "setMImage(m?.image_url||m?.img||'');setMImage2(m?.image_url_2||'');setMImage3(m?.image_url_3||'');setMinisterFit(m?.image_fit==='contain'?'contain':'cover')")
source = source.replace("image_url:mImage,img:mImage,display_order:selectedMinister", "image_url:mImage,img:mImage,image_url_2:mImage2,image_url_3:mImage3,image_fit:ministerFit,display_order:selectedMinister")

if (!source.includes('STANDARD_MINISTER_FIT_FILL')) source += "\n/* STANDARD_MINISTER_FIT_FILL */\n"
fs.writeFileSync(file, source)
console.log('Minister photo editor standardized: Fit/Fill only, no zoom or position controls')
