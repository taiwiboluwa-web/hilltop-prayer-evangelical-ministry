import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface MinistryEvent {
  id: string
  title: string
  description: string
  event_date: string | null
  date_label: string | null
  time_label: string | null
  venue: string | null
  image_url: string | null
  is_published: boolean
  sort_order: number
}

export function MinistryEvents() {
  const [events, setEvents] = useState<MinistryEvent[]>([])
  const [preview, setPreview] = useState<MinistryEvent | null>(null)

  const formatDate = (date: string | null, fallback: string | null) => {
    if (!date) return fallback || 'Date to be announced'
    const d = new Date(`${date}T00:00:00`)
    return Number.isNaN(d.getTime()) ? (fallback || 'Date to be announced') : d.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      const { data } = await supabase
        .from('ministry_events')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('event_date', { ascending: true, nullsFirst: false })
      if (active && data) setEvents(data)
    }
    load()
    return () => { active = false }
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
      {events.map(ev => (
        <div key={ev.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: 200, background: '#0f0f18' }}>
            {ev.image_url ? (
              <img src={ev.image_url} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(201,168,76,.22), #0f0f18 70%)' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.42))' }} />
            <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(201,168,76,0.95)', color: '#08080e', padding: '6px 12px', borderRadius: 8, fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.75rem', textAlign: 'center', lineHeight: 1.1 }}>
              {formatDate(ev.event_date, ev.date_label)}
            </div>
            {ev.image_url && <button type="button" onClick={() => setPreview(ev)} style={{ position: 'absolute', right: 14, bottom: 14, border: '1px solid rgba(255,255,255,.35)', background: 'rgba(8,8,14,.72)', color: '#fff', padding: '9px 13px', borderRadius: 8, fontFamily: 'Outfit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Preview flyer</button>}
          </div>
          <div style={{ padding: '28px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontSize: '0.78rem', color: 'var(--gold-light)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.02em' }}>
                {formatDate(ev.event_date, ev.date_label)}
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {[ev.time_label, ev.venue].filter(Boolean).join(' · ')}
              </div>
              <div className="serif" style={{ fontSize: '1.4rem', color: 'var(--ivory)', marginBottom: 12, lineHeight: 1.25 }}>
                {ev.title}
              </div>
              <p style={{ fontFamily: 'Outfit', fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                {ev.description}
              </p>
            </div>
          </div>
        </div>
      ))}
      {preview && (
        <div role="dialog" aria-modal="true" aria-label={`${preview.title} flyer preview`} onClick={() => setPreview(null)} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.86)', display: 'grid', placeItems: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 'min(900px, 100%)', maxHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button type="button" onClick={() => setPreview(null)} aria-label="Close flyer preview" style={{ position: 'absolute', top: -8, right: -8, zIndex: 2, width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,.25)', background: '#111', color: '#fff', fontSize: 22, cursor: 'pointer' }}>×</button>
            <img src={preview.image_url || ''} alt={`${preview.title} flyer`} style={{ maxWidth: '100%', maxHeight: '78vh', objectFit: 'contain', display: 'block' }} />
            <div style={{ width: '100%', background: '#0f0f18', padding: '16px 18px', color: '#fff' }}>
              <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--gold-light)', fontWeight: 700 }}>{formatDate(preview.event_date, preview.date_label)}</div>
              <div className="serif" style={{ fontSize: '1.35rem', marginTop: 4 }}>{preview.title}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
