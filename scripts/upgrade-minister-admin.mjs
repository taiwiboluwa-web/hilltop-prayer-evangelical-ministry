import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminPortal.tsx')
let source = fs.readFileSync(file, 'utf8')

if (source.includes('/* DYNAMIC_MINISTER_MANAGER_V2 */')) process.exit(0)

const oldState = "const [ministers,setMinisters]=useState<Minister[]>([]),[selectedMinister,setSelectedMinister]=useState(1),[mName,setMName]=useState(''),[mRole,setMRole]=useState(''),[mDesc,setMDesc]=useState(''),[mImage,setMImage]=useState('');"
const newState = oldState + "\n  const maxMinisterSlot=Math.max(3,...ministers.map(m=>Number(m.display_order)||0));\n  const ministerSlots=Array.from({length:maxMinisterSlot},(_,i)=>i+1);"
if (!source.includes(oldState)) throw new Error('AdminPortal state marker not found')
source = source.replace(oldState, newState)

const oldChoose = "const chooseMinister=(order:number)=>{setSelectedMinister(order);const m=ministers.find(x=>(x.display_order??x.id)===order);setMName(m?.name||'');setMRole(m?.role||'');setMDesc(m?.desc_text||m?.desc||'');setMImage(m?.image_url||m?.img||'')};"
const newChoose = oldChoose + "\n  const addMinisterSlot=()=>{const next=maxMinisterSlot+1;setSelectedMinister(next);setMName('');setMRole('');setMDesc('');setMImage('')};\n  const removeMinisterSlot=async(order:number)=>{const m=ministers.find(x=>(x.display_order??x.id)===order);if(m){if(!confirm(`Remove ${m.name} from Slot ${order}?`))return;const {error}=await supabase.from('ministers').delete().eq('id',m.id);if(error){alert(error.message);return}}setMName('');setMRole('');setMDesc('');setMImage('');setSelectedMinister(Math.max(1,Math.min(order,maxMinisterSlot)));await fetchMinisters()};"
if (!source.includes(oldChoose)) throw new Error('Minister chooser marker not found')
source = source.replace(oldChoose, newChoose)

const oldSave = "const saveMinister=async(e:React.FormEvent)=>{e.preventDefault();if(!mName.trim()||!mRole.trim()){alert('Enter the minister name and role.');return}const existing=ministers.find(x=>(x.display_order??x.id)===selectedMinister);const payload={name:mName.trim(),role:mRole.trim(),desc:mDesc,desc_text:mDesc,image_url:mImage,img:mImage,display_order:selectedMinister};const result=existing?await supabase.from('ministers').update(payload).eq('id',existing.id):await supabase.from('ministers').insert(payload);if(result.error)alert(result.error.message);else{await fetchMinisters();alert(`Minister slot ${selectedMinister} saved.`)}};"
if (!source.includes(oldSave)) throw new Error('Minister save marker not found')

const start = source.indexOf("{tab==='ministers'&&<div className=\"grid xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)] gap-5\">")
const end = source.indexOf("{tab==='gallery'&&", start)
if (start < 0 || end < 0) throw new Error('Minister JSX block not found')

const ministerBlock = `{tab==='ministers'&&<div className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div><p className="text-[9px] tracking-[.18em] uppercase text-[#e4c76b]">Ministers</p><h1 className="text-2xl font-semibold mt-1">Manage ministry team</h1><p className="text-xs text-neutral-500 mt-2">Create as many ministry-team slots as you need. Select a slot to edit it, or remove it completely.</p></div>
            <button type="button" onClick={addMinisterSlot} className="h-11 px-5 rounded-full bg-[#d5aa49] text-[#09090b] text-xs font-bold tracking-[.12em] uppercase hover:bg-[#e4c76b]">+ Add Minister Slot</button>
          </div>
          <div className="grid xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)] gap-5">
            <form onSubmit={saveMinister} className={card}>
              <div className="flex items-center justify-between gap-4 mb-6"><div><p className="text-[9px] tracking-[.18em] uppercase text-[#e4c76b]">Slot {selectedMinister}</p><h2 className="text-lg font-semibold mt-1">{ministers.some(m=>(m.display_order??m.id)===selectedMinister)?'Edit minister':'Add minister'}</h2></div><span className="text-[10px] text-neutral-500">{ministers.length} published</span></div>
              <label className={label}>Minister slot<select value={selectedMinister} onChange={e=>chooseMinister(Number(e.target.value))} className={input}>{ministerSlots.map(n=><option key={n} value={n}>Slot {n} · {ministers.find(m=>(m.display_order??m.id)===n)?.name||'Open'}</option>)}</select></label>
              <label className={label}>Full name<input className={input} value={mName} onChange={e=>setMName(e.target.value)} placeholder="Pst. Emmanuel Oloya"/></label>
              <label className={label}>Role / title<input className={input} value={mRole} onChange={e=>setMRole(e.target.value)} placeholder="Resident Pastor"/></label>
              <label className={label}>About / biography<textarea className={area} value={mDesc} onChange={e=>setMDesc(e.target.value)} placeholder="Write a full biography or brief description…"/></label>
              <div className="grid md:grid-cols-2 gap-4"><label className={label}>Picture URL<input className={input} value={mImage} onChange={e=>setMImage(e.target.value)} placeholder="https://…"/></label><label className={label}>Upload picture<input type="file" accept="image/*" onChange={e=>upload(e,'gallery',setMImage)} className="w-full h-11 pt-2 px-2 text-xs bg-[#111118] border border-dashed border-white/10 rounded-xl"/></label></div>
              <div className="flex flex-wrap gap-3 mt-3"><button className="flex-1 min-w-[180px] h-11 rounded-full bg-[#d5aa49] text-[#09090b] text-xs font-bold tracking-[.12em] uppercase">{ministers.some(m=>(m.display_order??m.id)===selectedMinister)?'Save Changes':'Add Minister'}</button><button type="button" onClick={()=>removeMinisterSlot(selectedMinister)} className={'px-5 h-11 rounded-full text-xs ' + danger}>Remove Slot</button></div>
            </form>
            <div className={card}>
              <div className="flex items-center justify-between gap-3 mb-4"><div><h2 className="text-sm font-semibold">Minister slots</h2><p className="text-[11px] text-neutral-500 mt-1">{ministerSlots.length} slots available</p></div><span className="text-[10px] text-neutral-500">{ministers.length} filled</span></div>
              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">{ministerSlots.map(n=>{const m=ministers.find(x=>(x.display_order??x.id)===n);return <div key={n} className={'flex items-center gap-3 p-3 rounded-xl border ' + (selectedMinister===n ? 'border-[#c9a84c]/35 bg-[#c9a84c]/5' : 'border-white/10 bg-white/[.02]')}>
                <button type="button" onClick={()=>chooseMinister(n)} className="min-w-0 flex-1 flex items-center gap-3 text-left"><div className="w-11 h-11 rounded-full border border-white/10 overflow-hidden bg-white/[.02] shrink-0">{m?.image_url||m?.img?<img src={m.image_url||m.img} className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center text-neutral-600">○</div>}</div><div className="min-w-0"><span className="block text-[9px] uppercase tracking-widest text-[#e4c76b]">Slot {n}</span><strong className="block text-sm truncate">{m?.name||'Open Slot'}</strong><span className="block text-[11px] text-neutral-500 truncate">{m?.role||'Available for a new minister'}</span></div></button>
                <button type="button" onClick={()=>chooseMinister(n)} className="px-3 py-2 rounded-full border border-white/10 text-[9px] uppercase tracking-wider text-neutral-400 hover:text-white">{m?'Edit':'Add'}</button>
                {m&&<button type="button" onClick={()=>removeMinisterSlot(n)} className="px-3 py-2 rounded-full border border-red-500/20 text-[9px] uppercase tracking-wider text-red-300 hover:bg-red-500/10">Remove</button>}
              </div>})}</div>
            </div>
          </div>
        </div>}
        `

source = source.slice(0, start) + ministerBlock + source.slice(end)
source = source.replace("  const counts=useMemo", "  /* DYNAMIC_MINISTER_MANAGER_V2 */\n  const counts=useMemo")
fs.writeFileSync(file, source)
console.log('Minister manager upgraded')
