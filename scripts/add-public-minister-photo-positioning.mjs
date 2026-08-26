import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/App.tsx')
let source = fs.readFileSync(file, 'utf8')
if (source.includes('MINISTER_PHOTO_FIT_FILL_V2')) process.exit(0)

// Keep only the one display setting shared with Admin: Fit or Fill.
source = source.replace(/  image_fit\?: string\n(?:  image_zoom\?: number\n  image_position_x\?: number\n  image_position_y\?: number\n)?/g, "  image_fit?: string\n")
source = source.replace(/  image_2_fit\?: string\n(?:  image_2_zoom\?: number\n  image_2_position_x\?: number\n  image_2_position_y\?: number\n)?/g, "  image_2_fit?: string\n")
source = source.replace(/  image_3_fit\?: string\n(?:  image_3_zoom\?: number\n  image_3_position_x\?: number\n  image_3_position_y\?: number\n)?/g, "  image_3_fit?: string\n")

source = source.replace(/  photoSettings: \{ fit:string; zoom:number; x:number; y:number \}\[\]\n/g, "  photoSettings: { fit:string }[]\n")
source = source.replace(/photoSettings: \[\{fit:'cover',zoom:100,x:50,y:50\}\]/g, "photoSettings: [{fit:'cover'}]")
source = source.replace(/photoSettings: \[[\s\S]*?\],\n          \}/g, "photoSettings: [\n              {fit:m.image_fit==='contain'?'contain':'cover'},\n              {fit:m.image_2_fit==='contain'?'contain':'cover'},\n              {fit:m.image_3_fit==='contain'?'contain':'cover'},\n            ],\n          }")
source = source.replace(/const settings = \(m\.photoSettings \|\| \[\]\)\[currentPhoto\] \|\| \{fit:'cover',zoom:100,x:50,y:50\}/g, "const settings = (m.photoSettings || [])[currentPhoto] || {fit:'cover'}")
source = source.replace(/style=\{\{ width: '100%', height: '100%', objectFit: settings\.fit as any, objectPosition: settings\.x \+ '%' \+ settings\.y \+ '%', transform: 'scale\(' \+ \(settings\.zoom \/ 100\) \+ '\)', transformOrigin: 'center center', filter:/g, "style={{ width: '100%', height: '100%', objectFit: settings.fit as any, filter:")
source = source.replace(/style=\{\{ width: '100%', height: '100%', objectFit: \(selectedMinister\.photoSettings\?\.\[modalPhotoIndex\]\?\.fit \|\| 'cover'\) as any, objectPosition: \(selectedMinister\.photoSettings\?\.\[modalPhotoIndex\]\?\.x \?\? 50\) \+ '%' \+ \(selectedMinister\.photoSettings\?\.\[modalPhotoIndex\]\?\.y \?\? 50\) \+ '%', transform: 'scale\(' \+ \(\(selectedMinister\.photoSettings\?\.\[modalPhotoIndex\]\?\.zoom \|\| 100\) \/ 100\) \+ '\)', transformOrigin: 'center center' \}\}/g, "style={{ width: '100%', height: '100%', objectFit: (selectedMinister.photoSettings?.[modalPhotoIndex]?.fit || 'cover') as any }}")

source += "\n/* MINISTER_PHOTO_FIT_FILL_V2 */\n"
fs.writeFileSync(file, source)
console.log('Public minister renderer standardized to the same Fit/Fill rule used by Admin')
