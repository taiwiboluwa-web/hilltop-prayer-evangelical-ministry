import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminPortal.tsx')
let source = fs.readFileSync(file, 'utf8')

// The previous version could skip the state injection when another build patch
// had already modified the minister state declaration. Make this patch resilient.
const ministerInterface = /interface Minister \{[^}]*\}/
const interfaceText = "interface Minister { id:number; name:string; role:string; desc?:string; desc_text?:string; image_url?:string; img?:string; image_url_2?:string; image_url_3?:string; image_fit?:string; image_zoom?:number; image_position_x?:number; image_position_y?:number; image_2_fit?:string; image_2_zoom?:number; image_2_position_x?:number; image_2_position_y?:number; image_3_fit?:string; image_3_zoom?:number; image_3_position_x?:number; image_3_position_y?:number; display_order:number }"
source = source.replace(ministerInterface, interfaceText)

const photoState = "  const [photoEditor,setPhotoEditor]=useState(1),[photoZoom,setPhotoZoom]=useState(100),[photoX,setPhotoX]=useState(50),[photoY,setPhotoY]=useState(50),[photoFit,setPhotoFit]=useState<'cover'|'contain'>('cover');\n"
if (!source.includes('[photoEditor,setPhotoEditor]')) {
  const ministerState = /  const \[ministers,setMinisters\]=useState<Minister\[\]>/
  const stateLineEnd = source.indexOf('\n', source.search(ministerState))
  if (stateLineEnd < 0) throw new Error('Could not locate minister state declaration')
  source = source.slice(0, stateLineEnd + 1) + photoState + source.slice(stateLineEnd + 1)
}

// Ensure the three image state values exist even when an earlier patch rewrote the minister state line.
if (!source.includes('[mImage2,setMImage2]')) {
  source = source.replace("[mDesc,setMDesc]=useState(''),[mImage,setMImage]=useState('');", "[mDesc,setMDesc]=useState(''),[mImage,setMImage]=useState(''),[mImage2,setMImage2]=useState(''),[mImage3,setMImage3]=useState('');")
}

if (!source.includes('MINISTER_PHOTO_EDITOR_HELPERS')) {
  const marker = "  const removeMinister=async()=>{"
  const helpers = `  const selectPhotoForEditor=(slot:number)=>{const m=ministers.find(x=>(x.display_order??x.id)===selectedMinister);setPhotoEditor(slot);if(!m)return;const presets=slot===1?[m.image_fit,m.image_zoom,m.image_position_x,m.image_position_y]:slot===2?[m.image_2_fit,m.image_2_zoom,m.image_2_position_x,m.image_2_position_y]:[m.image_3_fit,m.image_3_zoom,m.image_3_position_x,m.image_3_position_y];setPhotoFit(presets[0]==='contain'?'contain':'cover');setPhotoZoom(Number(presets[1])||100);setPhotoX(Number(presets[2])||50);setPhotoY(Number(presets[3])||50)};\n  const photoEditorUrl=photoEditor===1?mImage:photoEditor===2?mImage2:mImage3;\n  const photoStyle={width:'100%',height:'100%',objectFit:photoFit,objectPosition:photoX+'% '+photoY+'%',transform:'scale('+photoZoom/100+')',transformOrigin:'center center',transition:'transform .15s ease,object-position .15s ease'} as React.CSSProperties;\n  const savePhotoControls=async()=>{const m=ministers.find(x=>(x.display_order??x.id)===selectedMinister);if(!m){alert('Save the minister first, then adjust the photo.');return}const field=photoEditor===1?{image_fit:photoFit,image_zoom:photoZoom,image_position_x:photoX,image_position_y:photoY}:photoEditor===2?{image_2_fit:photoFit,image_2_zoom:photoZoom,image_2_position_x:photoX,image_2_position_y:photoY}:{image_3_fit:photoFit,image_3_zoom:photoZoom,image_3_position_x:photoX,image_3_position_y:photoY};const {error}=await supabase.from('ministers').update(field).eq('id',m.id);if(error)alert(error.message);else{await fetchMinisters();alert('Photo display settings saved.')}};\n  /* MINISTER_PHOTO_EDITOR_HELPERS */\n`
  if (source.includes(marker)) source = source.replace(marker, helpers + marker)
}

if (!source.includes('Photo display editor')) {
  const marker = '</div>\n          <div className="flex flex-wrap gap-3 mt-3">'
  const editor = `<div className="mt-6 p-4 rounded-2xl border border-[#c9a84c]/20 bg-[#c9a84c]/[.03]"><div className="flex flex-wrap items-center justify-between gap-3 mb-4"><div><p className="text-[9px] tracking-[.16em] uppercase text-[#e4c76b]">Photo display editor</p><p className="text-xs text-neutral-500 mt-1">Adjust the crop and preview it before saving.</p></div><button type="button" onClick={savePhotoControls} className="px-4 h-9 rounded-full border border-[#c9a84c]/30 text-[#e4c76b] text-[9px] font-bold uppercase tracking-wider">Save Photo Settings</button></div><div className="grid lg:grid-cols-[260px_1fr] gap-5"><div className="h-64 rounded-xl overflow-hidden bg-[#08080e] border border-white/10 flex items-center justify-center">{photoEditorUrl?<img src={photoEditorUrl} alt="Minister preview" style={photoStyle}/>:<span className="text-xs text-neutral-600">Add a photo to preview it</span>}</div><div className="space-y-4"><div className="flex gap-2 flex-wrap">{[1,2,3].map(slot=><button type="button" key={slot} onClick={()=>selectPhotoForEditor(slot)} className={'px-4 h-9 rounded-full text-[9px] uppercase tracking-wider border '+(photoEditor===slot?'border-[#c9a84c] bg-[#c9a84c]/10 text-[#e4c76b]':'border-white/10 text-neutral-400')}>Photo {slot}</button>)}</div><label className={label}>Zoom · {photoZoom}%<input type="range" min="100" max="180" value={photoZoom} onChange={e=>setPhotoZoom(Number(e.target.value))} className="w-full accent-[#c9a84c]"/></label><label className={label}>Horizontal position · {photoX}%<input type="range" min="0" max="100" value={photoX} onChange={e=>setPhotoX(Number(e.target.value))} className="w-full accent-[#c9a84c]"/></label><label className={label}>Vertical position · {photoY}%<input type="range" min="0" max="100" value={photoY} onChange={e=>setPhotoY(Number(e.target.value))} className="w-full accent-[#c9a84c]"/></label><div className="flex gap-2 flex-wrap"><button type="button" onClick={()=>setPhotoFit('cover')} className={'px-4 h-9 rounded-full text-[9px] border '+(photoFit==='cover'?'border-[#c9a84c] text-[#e4c76b]':'border-white/10 text-neutral-400')}>Cover</button><button type="button" onClick={()=>setPhotoFit('contain')} className={'px-4 h-9 rounded-full text-[9px] border '+(photoFit==='contain'?'border-[#c9a84c] text-[#e4c76b]':'border-white/10 text-neutral-400')}>Contain</button><button type="button" onClick={()=>{setPhotoZoom(100);setPhotoX(50);setPhotoY(50);setPhotoFit('cover')}} className="px-4 h-9 rounded-full text-[9px] border border-white/10 text-neutral-400">Reset</button></div></div></div></div>`
  if (source.includes(marker)) source = source.replace(marker, '</div>\n          ' + editor + '\n          <div className="flex flex-wrap gap-3 mt-3">')
}

source = source.replace("image_url:mImage,img:mImage,display_order:selectedMinister", "image_url:mImage,img:mImage,image_url_2:mImage2,image_url_3:mImage3,display_order:selectedMinister,image_fit:photoFit,image_zoom:photoZoom,image_position_x:photoX,image_position_y:photoY")
source = source.replace("setMImage(m.image_url||m.img||'')", "setMImage(m.image_url||m.img||'');setMImage2(m.image_url_2||'');setMImage3(m.image_url_3||'');setPhotoEditor(1);setPhotoZoom(Number(m.image_zoom)||100);setPhotoX(Number(m.image_position_x)||50);setPhotoY(Number(m.image_position_y)||50);setPhotoFit(m.image_fit==='contain'?'contain':'cover')")

if (!source.includes('MINISTER_PHOTO_EDITOR_V2')) source += "\n/* MINISTER_PHOTO_EDITOR_V2 */\n"
fs.writeFileSync(file, source)
console.log('Minister photo editor build patch applied')
