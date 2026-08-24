import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../supabase'

type GalleryItem = {
  id: string
  title: string
  image_url: string
  media_type: 'image' | 'video'
  mime_type?: string | null
  created_at?: string
}

const isAdminUser = (user: any) => user && (user.email === 'taiwiboluwa@gmail.com' || user.user_metadata?.role === 'admin')

function GalleryMedia({ item, admin = false }: { item: GalleryItem; admin?: boolean }) {
  const box = admin ? 'aspect-[4/3]' : 'aspect-[16/10]'
  return <div className={`${box} bg-black overflow-hidden relative`}>
    {item.media_type === 'video' ? (
      <video src={item.image_url} controls playsInline preload="metadata" className="w-full h-full object-cover" />
    ) : (
      <img src={item.image_url} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
    )}
    {item.media_type === 'video' && <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/75 text-[9px] uppercase tracking-widest text-white">Video</span>}
  </div>
}

export function GalleryMomentsEnhancer({ publicEvents = false }: { publicEvents?: boolean }) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [adminOpen, setAdminOpen] = useState(false)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [title, setTitle] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    const { data } = await supabase.from('gallery_moments').select('*').order('created_at', { ascending: false })
    if (data) setItems(data as GalleryItem[])
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!publicEvents) return
    const makeHost = () => {
      const eventSection = document.querySelector('#events') || Array.from(document.querySelectorAll('section')).find(s => /events/i.test(s.textContent || ''))
      if (!eventSection?.parentElement) return null
      let existing = document.getElementById('hilltop-gallery-moments-events-host')
      if (!existing) {
        existing = document.createElement('div')
        existing.id = 'hilltop-gallery-moments-events-host'
        eventSection.parentElement.insertBefore(existing, eventSection.nextSibling)
      }
      return existing
    }
    const timer = window.setTimeout(() => setHost(makeHost()), 100)
    return () => { window.clearTimeout(timer); document.getElementById('hilltop-gallery-moments-events-host')?.remove(); setHost(null) }
  }, [publicEvents])

  useEffect(() => {
    if (publicEvents) return
    const handler = async (event: MouseEvent) => {
      const button = (event.target as HTMLElement | null)?.closest('button')
      if (!button || !/Gallery Moments/i.test(button.textContent || '')) return
      const { data: { user } } = await supabase.auth.getUser()
      if (isAdminUser(user)) {
        setAdminOpen(true)
        await load()
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [publicEvents])

  const uploadAll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files.length) { setMessage('Choose one or more pictures or videos.'); return }
    setBusy(true); setMessage('Uploading…')
    try {
      for (const file of files) {
        const mediaType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : null
        if (!mediaType) continue
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `moments/${Date.now()}_${Math.random().toString(36).slice(2)}_${safe}`
        const { error } = await supabase.storage.from('gallery').upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
        if (error) throw error
        const url = supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl
        const { error: dbError } = await supabase.from('gallery_moments').insert({
          title: title.trim() || file.name.replace(/\.[^.]+$/, ''),
          image_url: url,
          media_type: mediaType,
          mime_type: file.type,
        })
        if (dbError) throw dbError
      }
      setTitle(''); setFiles([]); setMessage(`${files.length} item${files.length === 1 ? '' : 's'} uploaded successfully.`)
      await load()
    } catch (error: any) {
      setMessage(error?.message || 'Upload failed.')
    } finally { setBusy(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Remove this gallery moment?')) return
    const { error } = await supabase.from('gallery_moments').delete().eq('id', id)
    if (error) setMessage(error.message); else await load()
  }

  const gallery = useMemo(() => items, [items])

  if (publicEvents && host) return createPortal(
    <section style={{ background: '#08080e', padding: '72px 24px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}><span style={{ width: 38, height: 1, background: '#c9a84c' }}/><span style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#c9a84c' }}>Gallery Moments</span></div>
        <h2 style={{ color: '#f2ede4', fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(2rem,5vw,3.5rem)', margin: '0 0 30px' }}>Moments from Hilltop</h2>
        {gallery.length === 0 ? <p style={{ color: '#777', fontSize: 14 }}>Gallery moments will appear here as they are uploaded.</p> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>{gallery.map(item => <article key={item.id} style={{ overflow: 'hidden', borderRadius: 14, border: '1px solid rgba(255,255,255,.1)', background: '#0f0f18' }}><GalleryMedia item={item}/><div style={{ padding: 14, color: '#f2ede4', fontSize: 14 }}>{item.title}</div></article>)}</div>}
      </div>
    </section>, host
  )

  if (!adminOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto rounded-3xl border border-[#c9a84c]/25 bg-[#09090f] shadow-2xl overflow-hidden">
        <div className="p-5 md:p-7 border-b border-white/10 flex items-center justify-between gap-4">
          <div><p className="text-[9px] tracking-[.2em] uppercase text-[#e4c76b]">Gallery Moments</p><h2 className="text-xl md:text-2xl font-semibold text-white">Upload photos & videos</h2><p className="text-xs text-neutral-500 mt-1">Select multiple files at once. Everything uploaded here also appears under Events.</p></div>
          <button onClick={() => setAdminOpen(false)} className="w-10 h-10 rounded-full border border-white/10 text-neutral-400 hover:text-white">×</button>
        </div>
        <div className="p-5 md:p-7 grid lg:grid-cols-[380px_1fr] gap-6">
          <form onSubmit={uploadAll} className="rounded-2xl border border-white/10 bg-white/[.02] p-5 h-fit">
            <label className="block text-[9px] font-bold tracking-[.16em] uppercase text-neutral-500 mb-2">Title (optional)</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full h-11 px-3 mb-5 rounded-xl bg-[#111118] border border-white/10 text-white outline-none focus:border-[#c9a84c]/60" placeholder="Sunday worship" />
            <label className="block text-[9px] font-bold tracking-[.16em] uppercase text-neutral-500 mb-2">Pictures / Videos</label>
            <input type="file" multiple accept="image/*,video/*" onChange={e => setFiles(Array.from(e.target.files || []))} className="w-full min-h-24 p-3 text-xs text-neutral-300 bg-[#111118] border border-dashed border-white/15 rounded-xl" />
            {files.length > 0 && <div className="mt-3 space-y-1 max-h-32 overflow-auto">{files.map((file, i) => <div key={`${file.name}-${i}`} className="text-[11px] text-neutral-400 truncate">• {file.name}</div>)}</div>}
            <button disabled={busy} className="w-full h-11 mt-5 rounded-full bg-[#d5aa49] text-[#09090b] text-xs font-bold tracking-[.12em] uppercase disabled:opacity-50">{busy ? 'Uploading…' : `Upload ${files.length || ''} Item${files.length === 1 ? '' : 's'}`}</button>
            {message && <p className="text-xs text-neutral-400 mt-3">{message}</p>}
          </form>
          <div>
            <div className="flex justify-between mb-5"><h3 className="font-semibold text-white">Published moments</h3><span className="text-xs text-neutral-500">{gallery.length} total</span></div>
            {gallery.length === 0 ? <p className="text-sm text-neutral-500 py-12 text-center">No gallery moments yet.</p> : <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{gallery.map(item => <article key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[.02]"><GalleryMedia item={item} admin/><div className="p-3 flex items-center gap-2"><p className="text-sm truncate flex-1 text-white">{item.title}</p><button onClick={() => remove(item.id)} className="text-[10px] text-red-300">Remove</button></div></article>)}</div>}
          </div>
        </div>
      </div>
    </div>, document.body
  )
}
