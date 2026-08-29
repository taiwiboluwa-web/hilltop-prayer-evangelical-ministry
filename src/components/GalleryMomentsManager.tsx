import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'

type GalleryItem = {
  id: string | number
  title: string
  image_url: string
  created_at?: string
  group_id?: string | null
  display_order?: number | null
  image_fit?: 'image' | 'cover' | 'contain' | null
}

type GalleryGroup = { key: string; title: string; items: GalleryItem[]; created_at?: string }
type SizePreset = 'original' | '1920x1080' | '1600x1200' | '1080x1080' | '1080x1350' | 'custom'
type EditorState = {
  rotation: number
  flipH: boolean
  brightness: number
  contrast: number
  saturation: number
  crop: 'original' | 'square' | 'portrait' | 'landscape'
  size: SizePreset
  customWidth: number
  customHeight: number
  fit: 'cover' | 'contain'
}
type PendingImage = { id: string; file: File; preview: string; editor: EditorState }

const MAX_PICTURES = 15
const MAX_OUTPUT_SIDE = 3000
const makeId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
const defaultEditor = (): EditorState => ({ rotation: 0, flipH: false, brightness: 100, contrast: 100, saturation: 100, crop: 'original', size: 'original', customWidth: 1600, customHeight: 1200, fit: 'cover' })
const editorFilter = (e: EditorState) => `brightness(${e.brightness}%) contrast(${e.contrast}%) saturate(${e.saturation}%)`
const editorTransform = (e: EditorState) => `rotate(${e.rotation}deg) scaleX(${e.flipH ? -1 : 1})`

function sizeForEditor(e: EditorState, sourceW: number, sourceH: number) {
  if (e.size === 'original') return { width: Math.min(sourceW, MAX_OUTPUT_SIDE), height: Math.min(sourceH, MAX_OUTPUT_SIDE) }
  if (e.size === 'custom') return { width: Math.min(Math.max(320, e.customWidth), MAX_OUTPUT_SIDE), height: Math.min(Math.max(320, e.customHeight), MAX_OUTPUT_SIDE) }
  const [width, height] = e.size.split('x').map(Number)
  return { width, height }
}

async function imageToBlob(src: string, editor: EditorState, mime = 'image/jpeg'): Promise<Blob> {
  const response = await fetch(src, { mode: 'cors', cache: 'no-store' })
  if (!response.ok) throw new Error(`Could not read image (${response.status}).`)
  const blob = await response.blob()
  const bitmap = await createImageBitmap(blob)
  const sourceW = bitmap.width
  const sourceH = bitmap.height
  const output = sizeForEditor(editor, sourceW, sourceH)
  const targetRatio = output.width / output.height
  let cropW = sourceW
  let cropH = sourceH
  if (editor.crop !== 'original') {
    const ratio = editor.crop === 'square' ? 1 : editor.crop === 'portrait' ? 4 / 5 : 16 / 9
    if (sourceW / sourceH > ratio) cropW = Math.round(sourceH * ratio)
    else cropH = Math.round(sourceW / ratio)
  } else if (editor.size !== 'original') {
    if (sourceW / sourceH > targetRatio) cropW = Math.round(sourceH * targetRatio)
    else cropH = Math.round(sourceW / targetRatio)
  }
  const rotated = Math.abs(editor.rotation % 180) === 90
  const canvas = document.createElement('canvas')
  canvas.width = rotated ? output.height : output.width
  canvas.height = rotated ? output.width : output.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Your browser could not create an image editor canvas.')
  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(editor.rotation * Math.PI / 180)
  ctx.scale(editor.flipH ? -1 : 1, 1)
  ctx.filter = editorFilter(editor)
  const drawW = rotated ? output.height : output.width
  const drawH = rotated ? output.width : output.height
  ctx.drawImage(bitmap, (sourceW - cropW) / 2, (sourceH - cropH) / 2, cropW, cropH, -drawW / 2, -drawH / 2, drawW, drawH)
  ctx.restore()
  if (typeof bitmap.close === 'function') bitmap.close()
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('Could not create the edited image.')), mime, 0.92))
}

function EditorControls({ editor, setEditor }: { editor: EditorState; setEditor: React.Dispatch<React.SetStateAction<EditorState>> }) {
  const update = (patch: Partial<EditorState>) => setEditor(current => ({ ...current, ...patch }))
  return <div className="gallery-editor-controls">
    <div className="gallery-editor-row">
      <button type="button" className="admin-mini" onClick={() => update({ rotation: (editor.rotation + 90) % 360 })}>↻ Rotate</button>
      <button type="button" className="admin-mini" onClick={() => update({ flipH: !editor.flipH })}>⇋ Flip</button>
      <button type="button" className="admin-mini" onClick={() => setEditor(defaultEditor())}>Reset</button>
    </div>
    <label>Crop / ratio<select className="admin-select" value={editor.crop} onChange={e => update({ crop: e.target.value as EditorState['crop'] })}><option value="original">Original</option><option value="square">Square 1:1</option><option value="portrait">Portrait 4:5</option><option value="landscape">Landscape 16:9</option></select></label>
    <label>Output size<select className="admin-select" value={editor.size} onChange={e => update({ size: e.target.value as SizePreset })}><option value="original">Original size</option><option value="1920x1080">1920 × 1080 px</option><option value="1600x1200">1600 × 1200 px</option><option value="1080x1080">1080 × 1080 px</option><option value="1080x1350">1080 × 1350 px</option><option value="custom">Custom size</option></select></label>
    {editor.size === 'custom' && <div className="gallery-size-fields"><label>Width (px)<input className="admin-input" type="number" min="320" max={MAX_OUTPUT_SIDE} value={editor.customWidth} onChange={e => update({ customWidth: Number(e.target.value) || 320 })} /></label><label>Height (px)<input className="admin-input" type="number" min="320" max={MAX_OUTPUT_SIDE} value={editor.customHeight} onChange={e => update({ customHeight: Number(e.target.value) || 320 })} /></label></div>}
    <label>Display fit<select className="admin-select" value={editor.fit} onChange={e => update({ fit: e.target.value as EditorState['fit'] })}><option value="cover">Fill frame (cover)</option><option value="contain">Show full picture (contain)</option></select></label>
    <label>Brightness <input type="range" min="60" max="140" value={editor.brightness} onChange={e => update({ brightness: Number(e.target.value) })} /><span>{editor.brightness}%</span></label>
    <label>Contrast <input type="range" min="60" max="140" value={editor.contrast} onChange={e => update({ contrast: Number(e.target.value) })} /><span>{editor.contrast}%</span></label>
    <label>Saturation <input type="range" min="0" max="160" value={editor.saturation} onChange={e => update({ saturation: Number(e.target.value) })} /><span>{editor.saturation}%</span></label>
  </div>
}

function EditorPreview({ src, editor }: { src: string; editor: EditorState }) {
  const previewRatio = editor.size === 'custom' ? editor.customWidth / Math.max(1, editor.customHeight) : editor.size === 'original' ? undefined : Number(editor.size.split('x')[0]) / Number(editor.size.split('x')[1])
  return <div className="gallery-editor-preview" style={previewRatio ? { aspectRatio: `${previewRatio}` } : undefined}><img src={src} alt="Editing preview" style={{ filter: editorFilter(editor), transform: editorTransform(editor), objectFit: editor.fit }} /><div className="gallery-editor-badge">{editor.size === 'original' ? 'ORIGINAL SIZE' : editor.size === 'custom' ? `${editor.customWidth} × ${editor.customHeight}` : `${editor.size} PX`}</div></div>
}

export function GalleryMomentsManager() {
  const [items, setItems] = useState<GalleryItem[]>([]), [title, setTitle] = useState(''), [pending, setPending] = useState<PendingImage[]>([]), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [editingPending, setEditingPending] = useState<string | null>(null), [editingItem, setEditingItem] = useState<GalleryItem | null>(null), [itemEditor, setItemEditor] = useState<EditorState>(defaultEditor), [editingItemBusy, setEditingItemBusy] = useState(false)
  const load = async () => { const { data, error } = await supabase.from('gallery_moments').select('*').order('created_at', { ascending: false }); if (error) { setMessage(error.message); return }; setItems((data || []) as GalleryItem[]) }
  useEffect(() => { load() }, [])
  const groups = useMemo<GalleryGroup[]>(() => { const map = new Map<string, GalleryGroup>(); for (const item of items) { const key = item.group_id || `single-${item.id}`; if (!map.has(key)) map.set(key, { key, title: item.title || 'Gallery Moment', items: [], created_at: item.created_at }); const group = map.get(key)!; group.items.push(item); if (!group.created_at || ((item.created_at || '') > (group.created_at || ''))) group.created_at = item.created_at }; return Array.from(map.values()).map(group => ({ ...group, items: [...group.items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)) })) }, [items])
  const selectFiles = (next: FileList | null) => { const chosen = Array.from(next || []).filter(file => file.type.startsWith('image/')); if (chosen.length > MAX_PICTURES) { setMessage(`You can upload a maximum of ${MAX_PICTURES} pictures per gallery group.`); return }; pending.forEach(item => URL.revokeObjectURL(item.preview)); setPending(chosen.map(file => ({ id: makeId(), file, preview: URL.createObjectURL(file), editor: defaultEditor() }))); setMessage(chosen.length ? `${chosen.length} picture${chosen.length === 1 ? '' : 's'} selected. Click EDIT on any picture before publishing.` : '') }
  const removePending = (id: string) => setPending(current => { const item = current.find(entry => entry.id === id); if (item) URL.revokeObjectURL(item.preview); return current.filter(entry => entry.id !== id) })
  const addGroup = async (event: React.FormEvent) => { event.preventDefault(); if (!title.trim()) { setMessage('Enter a title or catalog for this gallery group.'); return }; if (!pending.length) { setMessage('Select one or more pictures.'); return }; if (pending.length > MAX_PICTURES) { setMessage(`Maximum ${MAX_PICTURES} pictures per group.`); return }; setBusy(true); setMessage('Preparing edited gallery pictures…'); const groupId = makeId(); try { const rows: Record<string, unknown>[] = []; for (let index = 0; index < pending.length; index++) { const selected = pending[index]; const editedBlob = await imageToBlob(selected.preview, selected.editor); const safe = selected.file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, ''); const path = `moments/${groupId}/${String(index + 1).padStart(3, '0')}_${safe}.jpg`; const { error: uploadError } = await supabase.storage.from('gallery').upload(path, editedBlob, { cacheControl: '31536000', upsert: false, contentType: 'image/jpeg' }); if (uploadError) throw uploadError; const url = supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl; rows.push({ title: title.trim(), image_url: url, media_type: 'image', mime_type: 'image/jpeg', image_fit: selected.editor.fit, group_id: groupId, display_order: index }) }; const { error } = await supabase.from('gallery_moments').insert(rows); if (error) throw error; pending.forEach(item => URL.revokeObjectURL(item.preview)); setTitle(''); setPending([]); setMessage(`Gallery group published with ${rows.length} picture${rows.length === 1 ? '' : 's'}.`); await load() } catch (error: any) { setMessage(error?.message || 'Gallery upload failed.') } finally { setBusy(false) } }
  const openItemEditor = (item: GalleryItem) => { setEditingItem(item); setItemEditor({ ...defaultEditor(), fit: item.image_fit === 'contain' ? 'contain' : 'cover' }); setMessage('') }
  const saveItemEdit = async () => { if (!editingItem) return; setEditingItemBusy(true); setMessage('Saving edited picture…'); try { const blob = await imageToBlob(editingItem.image_url, itemEditor); const path = `moments/edited/${String(editingItem.id)}-${Date.now()}.jpg`; const { error: uploadError } = await supabase.storage.from('gallery').upload(path, blob, { cacheControl: '31536000', upsert: false, contentType: 'image/jpeg' }); if (uploadError) throw uploadError; const newUrl = supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl; const { error: updateError } = await supabase.from('gallery_moments').update({ image_url: newUrl, image_fit: itemEditor.fit }).eq('id', editingItem.id); if (updateError) throw updateError; setItems(current => current.map(item => item.id === editingItem.id ? { ...item, image_url: newUrl, image_fit: itemEditor.fit } : item)); setEditingItem(null); setMessage('Picture updated successfully with the selected size and display settings.') } catch (error: any) { setMessage(error?.message || 'Could not save the edited picture. Try replacing the picture if the existing URL cannot be read by the browser.') } finally { setEditingItemBusy(false) } }
  const removeGroup = async (group: GalleryGroup) => { if (!confirm(`Delete the entire “${group.title}” gallery group (${group.items.length} pictures)?`)) return; setBusy(true); try { const paths = group.items.map(item => { try { return new URL(item.image_url).pathname.split('/storage/v1/object/public/gallery/')[1] } catch { return null } }).filter(Boolean) as string[]; if (paths.length) await supabase.storage.from('gallery').remove(paths); const { error } = await supabase.from('gallery_moments').delete().in('id', group.items.map(item => item.id)); if (error) throw error; await load(); setMessage('Gallery group deleted.') } catch (error: any) { setMessage(error?.message || 'Could not delete gallery group.') } finally { setBusy(false) } }
  return <><style>{`\n.gallery-upload-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:15px}.gallery-upload-card{position:relative;background:#11120f;border:1px solid rgba(255,255,255,.08);overflow:hidden}.gallery-upload-card img{width:100%;aspect-ratio:1;display:block;object-fit:cover}.gallery-upload-actions{display:flex;gap:5px;padding:7px}.gallery-upload-actions button{flex:1}.gallery-number{position:absolute;top:6px;left:6px;padding:3px 6px;background:rgba(0,0,0,.75);color:#fff;font-size:8px}.gallery-editor-backdrop{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.78);display:grid;place-items:center;padding:24px}.gallery-editor-modal{width:min(1040px,96vw);max-height:92vh;overflow:auto;background:#0d0e0b;border:1px solid rgba(217,173,76,.3);box-shadow:0 24px 80px rgba(0,0,0,.55)}.gallery-editor-head{padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;justify-content:space-between;align-items:center}.gallery-editor-head h3{margin:0;font:500 18px Georgia,serif}.gallery-editor-body{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:18px;padding:18px}.gallery-editor-preview{position:relative;min-height:420px;max-height:65vh;background:#050605;display:grid;place-items:center;overflow:hidden;border:1px solid rgba(255,255,255,.08);margin:auto;width:100%}.gallery-editor-preview img{width:100%;height:100%;max-width:100%;max-height:65vh;object-fit:contain;transition:.18s}.gallery-editor-badge{position:absolute;left:10px;bottom:10px;background:rgba(0,0,0,.72);padding:5px 7px;color:#d9ad4c;font-size:8px;letter-spacing:.12em}.gallery-editor-controls{display:grid;gap:12px;align-content:start}.gallery-editor-controls label{display:grid;gap:6px;color:#898a7f;font-size:9px;letter-spacing:.1em;text-transform:uppercase}.gallery-editor-controls label>span{text-align:right;color:#d9ad4c}.gallery-editor-controls input[type=range]{width:100%}.gallery-editor-row{display:flex;gap:7px;flex-wrap:wrap}.gallery-size-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px}.gallery-editor-footer{display:flex;justify-content:flex-end;gap:8px;padding:15px 18px;border-top:1px solid rgba(255,255,255,.07)}@media(max-width:800px){.gallery-upload-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.gallery-editor-body{grid-template-columns:1fr}.gallery-editor-preview{min-height:280px}}\n`}</style>
    <div className="admin-grid">
      <section className="admin-panel"><div className="admin-panel-head"><div><h2>New gallery group</h2><span>Upload up to {MAX_PICTURES} pictures as one catalog / moment</span></div></div><div className="admin-panel-body"><form onSubmit={addGroup}><div className="admin-field"><label>Catalog / Group title</label><input className="admin-input" value={title} onChange={event => setTitle(event.target.value)} placeholder="Sunday Thanksgiving Service" /></div><div className="admin-field"><label>Select up to {MAX_PICTURES} pictures</label><input className="admin-input" type="file" accept="image/*" multiple onChange={event => selectFiles(event.target.files)} /><div className="admin-helper" style={{ marginTop: 7 }}>Choose multiple pictures. Each picture can be edited, cropped and resized before publishing.</div></div>{pending.length > 0 && <div className="gallery-upload-grid">{pending.map((item,index)=><div className="gallery-upload-card" key={item.id}><img src={item.preview} alt={`Selected ${index+1}`} style={{ filter: editorFilter(item.editor), transform: editorTransform(item.editor), objectFit: item.editor.fit }} /><span className="gallery-number">{index+1}</span><div className="gallery-upload-actions"><button type="button" className="admin-mini" onClick={()=>setEditingPending(item.id)}>EDIT / SIZE</button><button type="button" className="admin-mini del" onClick={()=>removePending(item.id)}>REMOVE</button></div></div>)}</div>}<div className="admin-form-actions"><button className="admin-btn gold" type="submit" disabled={busy || pending.length > MAX_PICTURES}>{busy?'Publishing…':'Publish gallery group'}</button></div>{message&&<div className="admin-helper" style={{marginTop:12}}>{message}</div>}</form></div></section>
      <section className="admin-panel"><div className="admin-panel-head"><div><h2>Published gallery groups</h2><span>{groups.length} group{groups.length===1?'':'s'}</span></div></div><div className="admin-panel-body">{groups.length?<div className="admin-list">{groups.map(group=><div key={group.key} className="admin-list-item" style={{alignItems:'flex-start'}}><div style={{display:'grid',gridTemplateColumns:'repeat(2,50px)',gap:4,flexShrink:0}}>{group.items.slice(0,4).map(item=><img key={String(item.id)} src={item.image_url} alt="" style={{width:50,height:50,objectFit:item.image_fit==='contain'?'contain':'cover',background:'#111'}} />)}</div><div className="admin-list-main"><b>{group.title}</b><span>{group.items.length} picture{group.items.length===1?'':'s'} · {group.created_at?new Date(group.created_at).toLocaleDateString('en-NG'):''}</span><div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:8}}>{group.items.map((item,index)=><button key={String(item.id)} type="button" className="admin-mini" disabled={busy} onClick={()=>openItemEditor(item)}>Edit picture {index+1}</button>)}</div></div><button className="admin-mini del" disabled={busy} onClick={()=>removeGroup(group)}>Delete group</button></div>)}</div>:<div className="admin-empty">No gallery moments yet.</div>}</div></section>
    </div>
    {editingPending&&(()=>{const item=pending.find(entry=>entry.id===editingPending);if(!item)return null;const editor=item.editor;const setEditor=(next:React.SetStateAction<EditorState>)=>setPending(current=>current.map(entry=>entry.id===item.id?{...entry,editor:typeof next==='function'?next(entry.editor):next}:entry));return <div className="gallery-editor-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setEditingPending(null)}}><div className="gallery-editor-modal"><div className="gallery-editor-head"><h3>Edit picture {pending.findIndex(entry=>entry.id===item.id)+1}</h3><button type="button" className="admin-mini" onClick={()=>setEditingPending(null)}>CLOSE</button></div><div className="gallery-editor-body"><EditorPreview src={item.preview} editor={editor}/><EditorControls editor={editor} setEditor={setEditor}/></div><div className="gallery-editor-footer"><button type="button" className="admin-btn gold" onClick={()=>setEditingPending(null)}>APPLY EDIT</button></div></div></div>})()}
    {editingItem&&<div className="gallery-editor-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget&&!editingItemBusy)setEditingItem(null)}}><div className="gallery-editor-modal"><div className="gallery-editor-head"><div><h3>Edit uploaded picture</h3><div className="admin-helper" style={{marginTop:4}}>{editingItem.title}</div></div><button type="button" className="admin-mini" disabled={editingItemBusy} onClick={()=>setEditingItem(null)}>CLOSE</button></div><div className="gallery-editor-body"><EditorPreview src={editingItem.image_url} editor={itemEditor}/><EditorControls editor={itemEditor} setEditor={setItemEditor}/></div><div className="gallery-editor-footer"><button type="button" className="admin-btn" disabled={editingItemBusy} onClick={()=>setEditingItem(null)}>CANCEL</button><button type="button" className="admin-btn gold" disabled={editingItemBusy} onClick={saveItemEdit}>{editingItemBusy?'SAVING…':'SAVE EDITED PICTURE'}</button></div></div></div>}
  </>
}
