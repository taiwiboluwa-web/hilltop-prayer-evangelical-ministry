import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/App.tsx')
let source = fs.readFileSync(file, 'utf8')
if (source.includes('MINISTER_PHOTO_POSITIONING_V1')) process.exit(0)

source = source.replace(
  "  image_url_3?: string\n}",
  "  image_url_3?: string\n  image_fit?: string\n  image_zoom?: number\n  image_position_x?: number\n  image_position_y?: number\n  image_2_fit?: string\n  image_2_zoom?: number\n  image_2_position_x?: number\n  image_2_position_y?: number\n  image_3_fit?: string\n  image_3_zoom?: number\n  image_3_position_x?: number\n  image_3_position_y?: number\n}"
)
source = source.replace(
  "  photos: string[]\n}",
  "  photos: string[]\n  photoSettings: { fit:string; zoom:number; x:number; y:number }[]\n}"
)
source = source.replace(
  "            photos: uniquePhotos.length ? uniquePhotos : [IMGS.pastor],\n          }",
  "            photos: uniquePhotos.length ? uniquePhotos : [IMGS.pastor],\n            photoSettings: [\n              {fit:m.image_fit==='contain'?'contain':'cover',zoom:Number(m.image_zoom)||100,x:Number(m.image_position_x)||50,y:Number(m.image_position_y)||50},\n              {fit:m.image_2_fit==='contain'?'contain':'cover',zoom:Number(m.image_2_zoom)||100,x:Number(m.image_2_position_x)||50,y:Number(m.image_2_position_y)||50},\n              {fit:m.image_3_fit==='contain'?'contain':'cover',zoom:Number(m.image_3_zoom)||100,x:Number(m.image_3_position_x)||50,y:Number(m.image_3_position_y)||50},\n            ],\n          }"
)
source = source.replace(
  "const photo = m.photos[currentPhoto] || m.img\n            return (",
  "const photo = m.photos[currentPhoto] || m.img\n            const settings = m.photoSettings[currentPhoto] || {fit:'cover',zoom:100,x:50,y:50}\n            return ("
)
source = source.replace(
  "style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85) saturate(0.85)', transition: 'opacity .25s ease, transform .45s ease' }}",
  "style={{ width: '100%', height: '100%', objectFit: settings.fit as any, objectPosition: settings.x + '% ' + settings.y + '%', transform: 'scale(' + (settings.zoom / 100) + ')', transformOrigin: 'center center', filter: 'brightness(0.85) saturate(0.85)', transition: 'opacity .25s ease, transform .45s ease, object-position .2s ease' }}"
)
source = source.replace(
  "<img src={selectedMinister.photos[modalPhotoIndex] || selectedMinister.img} alt={selectedMinister.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />",
  "<img src={selectedMinister.photos[modalPhotoIndex] || selectedMinister.img} alt={selectedMinister.name} style={{ width: '100%', height: '100%', objectFit: (selectedMinister.photoSettings[modalPhotoIndex]?.fit || 'cover') as any, objectPosition: (selectedMinister.photoSettings[modalPhotoIndex]?.x ?? 50) + '% ' + (selectedMinister.photoSettings[modalPhotoIndex]?.y ?? 50) + '%', transform: 'scale(' + ((selectedMinister.photoSettings[modalPhotoIndex]?.zoom || 100) / 100) + ')', transformOrigin: 'center center' }} />"
)
source = source.replace("/* MINISTER_GALLERY_V1 */", "/* MINISTER_GALLERY_V1 */\n/* MINISTER_PHOTO_POSITIONING_V1 */")
fs.writeFileSync(file, source)
console.log('Public minister photo positioning applied')
