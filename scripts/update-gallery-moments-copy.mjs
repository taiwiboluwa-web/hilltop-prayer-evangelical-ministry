import fs from 'node:fs'

const file = 'src/components/GalleryMomentsEnhancer.tsx'
if (!fs.existsSync(file)) process.exit(0)
let source = fs.readFileSync(file, 'utf8')
source = source.replace('>Gallery Moments</span>', '>Gallery and Moments</span>')
source = source.replace('>Moments from Hilltop</h2>', '>A Glimpse Into Our Fellowship</h2>')
source = source.replace('Gallery moments will appear here as they are uploaded.</p>', 'Gallery moments will appear here as they are uploaded from the Admin Dashboard.</p>')
source = source.replace('Everything uploaded here also appears under Events.', 'Everything uploaded here appears in the public Gallery and Moments section.')
fs.writeFileSync(file, source)
console.log('Gallery and Moments copy updated and linked to Admin Dashboard content')
