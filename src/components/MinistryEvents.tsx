import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface MinistryEvent {
  id: string
  title: string
  description: string
  date_label: string | null
  time_label: string | null
  venue: string | null
  image_url: string | null
  is_published: boolean
  sort_order: number
}

export function MinistryEvents() {
  const [events, setEvents] = useState<MinistryEvent[]>([])

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
              <img src={ev.image_url} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.38) saturate(0.65)' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(201,168,76,.22), #0f0f18 70%)' }} />
            )}
            <div className="overlay" />
            <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(201,168,76,0.9)', color: '#08080e', padding: '6px 12px', borderRadius: 8, fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.75rem', textAlign: 'center', lineHeight: 1.1 }}>
              {ev.date_label || 'UPCOMING'}
            </div>
          </div>
          <div style={{ padding: '28px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontSize: '0.72rem', color: 'var(--gold-light)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
    </div>
  )
}
