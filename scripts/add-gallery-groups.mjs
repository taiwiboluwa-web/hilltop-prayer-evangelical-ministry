import fs from 'node:fs'

const file='src/pages/AdminPortal.tsx'
let source=fs.readFileSync(file,'utf8')

if(!source.includes("GalleryMomentsManager")){
  source=source.replace("import { supabase } from '../supabase';", "import { supabase } from '../supabase';\nimport { GalleryMomentsManager } from '../components/GalleryMomentsManager';")
}

const start=source.indexOf('  const renderGallery=()=> <>')
const end=source.indexOf('  const renderVideos=()=>', start)
if(start===-1||end===-1){
  console.log('Grouped gallery admin patch skipped; renderGallery markers not found.')
}else if(!source.slice(start,end).includes('<GalleryMomentsManager')){
  source=source.slice(0,start)+"  const renderGallery=()=> <GalleryMomentsManager />;\n\n"+source.slice(end)
  fs.writeFileSync(file,source)
  console.log('Grouped Gallery Moments admin uploader applied.')
}else{
  console.log('Grouped Gallery Moments admin uploader already applied.')
}
