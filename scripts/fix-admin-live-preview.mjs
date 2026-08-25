import fs from 'node:fs'
const file='src/pages/AdminContentManager.tsx'
let s=fs.readFileSync(file,'utf8')
if(s.includes('ADMIN_LIVE_PREVIEW_V2')) process.exit(0)
s=s.replace("const [items,setItems]=useState<any[]>([]),[editing,setEditing]=useState<any|null>(null),[saving,setSaving]=useState(false),[preview,setPreview]=useState('')", "const [items,setItems]=useState<any[]>([]),[editing,setEditing]=useState<any|null>(null),[saving,setSaving]=useState(false),[preview,setPreview]=useState(''),[previewError,setPreviewError]=useState(false)")
s=s.replace("const reset=()=>{setEditing(null);setPreview('');", "const reset=()=>{setEditing(null);setPreview('');setPreviewError(false);")
s=s.replace("const edit=(x:any)=>{setEditing(x);setForm({...x});setPreview(x.image_url||x.thumbnail_url||'')}", "const edit=(x:any)=>{setEditing(x);setForm({...x});setPreview(x.image_url||x.thumbnail_url||'');setPreviewError(false)}")
s=s.replace("setPreview(URL.createObjectURL(file));", "setPreviewError(false);setPreview(URL.createObjectURL(file));",1)
s=s.replace("setPreview(u)}", "setPreviewError(false);setPreview(u)}")
s=s.replace("{preview&&<div className=\"admin-field\"><label>Live image preview</label><img src={preview} className=\"admin-preview\" alt=\"Upload preview\"/></div>}", "{(kind==='gallery'||kind==='videos')&&<div className=\"admin-field\"><label>Live image preview</label>{preview&&!previewError?<img key={preview} src={preview} className=\"admin-preview\" alt=\"Live preview\" onLoad={()=>setPreviewError(false)} onError={()=>setPreviewError(true)}/>:<div className=\"admin-preview\" style={{display:'grid',placeItems:'center',minHeight:180,padding:24,textAlign:'center'}}>{previewError?'Preview could not load. Check the image URL or upload the image again.':'Select or upload an image to see the live preview.'}</div>}</div>}")
s=s.replace("return <div>", "/* ADMIN_LIVE_PREVIEW_V2 */\nreturn <div>")
fs.writeFileSync(file,s)
console.log('Admin live image preview fixed')
