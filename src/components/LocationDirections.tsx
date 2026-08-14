import React, { useEffect, useState } from 'react'

const DESTINATION = '3 Kola Ojedeji Street, Ipaja, Lagos State, Nigeria'

const mapsUrl = (origin?: string) => {
  const params = new URLSearchParams({
    api: '1',
    destination: DESTINATION,
  })
  if (origin) params.set('origin', origin)
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function LocationDirections() {
  const [isHome, setIsHome] = useState(false)

  useEffect(() => {
    const syncVisibility = () => {
      setIsHome(Boolean(document.getElementById('home')))
    }

    syncVisibility()

    const observer = new MutationObserver(syncVisibility)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  if (!isHome) return null

  return (
    <section id="location" style={{ background: '#08080e', color: '#fff', padding: '96px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="label" style={{ marginBottom: 14 }}>LOCATION & DIRECTIONS</div>
          <h2 className="display" style={{ fontSize: 'clamp(2rem,5vw,4rem)', marginBottom: 16 }}>Find Us in Ipaja</h2>
          <p style={{ color: 'var(--muted)', maxWidth: 680, margin: '0 auto', lineHeight: 1.8, fontFamily: 'Outfit' }}>
            Join us at <strong style={{ color: '#fff' }}>{DESTINATION}</strong>. Use the route buttons below to open turn-by-turn directions in Google Maps.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
          <a href={mapsUrl('Abule Egba, Lagos, Nigeria')} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ height: '100%', padding: 28, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, background: 'rgba(255,255,255,0.035)' }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>📍</div>
              <h3 style={{ margin: '0 0 8px', fontFamily: 'Outfit', fontSize: '1.1rem' }}>From Abule Egba</h3>
              <p style={{ margin: '0 0 20px', color: 'var(--muted)', lineHeight: 1.7, fontFamily: 'Outfit', fontSize: '.9rem' }}>Abule Egba → Iyana Ipaja → Ipaja → Kola Ojedeji Street</p>
              <span className="btn btn-gold" style={{ display: 'inline-block' }}>Get Directions</span>
            </div>
          </a>

          <a href={mapsUrl('Oshodi, Lagos, Nigeria')} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ height: '100%', padding: 28, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, background: 'rgba(255,255,255,0.035)' }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>🧭</div>
              <h3 style={{ margin: '0 0 8px', fontFamily: 'Outfit', fontSize: '1.1rem' }}>From Oshodi</h3>
              <p style={{ margin: '0 0 20px', color: 'var(--muted)', lineHeight: 1.7, fontFamily: 'Outfit', fontSize: '.9rem' }}>Oshodi → Ikeja → Egbeda → Iyana Ipaja → Ipaja → Kola Ojedeji Street</p>
              <span className="btn btn-gold" style={{ display: 'inline-block' }}>Get Directions</span>
            </div>
          </a>

          <a href={mapsUrl()} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ height: '100%', padding: 28, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, background: 'rgba(140,109,38,0.08)' }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>🗺️</div>
              <h3 style={{ margin: '0 0 8px', fontFamily: 'Outfit', fontSize: '1.1rem' }}>Open Location</h3>
              <p style={{ margin: '0 0 20px', color: 'var(--muted)', lineHeight: 1.7, fontFamily: 'Outfit', fontSize: '.9rem' }}>Open the destination directly in Google Maps and choose your own starting point.</p>
              <span className="btn btn-gold" style={{ display: 'inline-block' }}>Open Google Maps</span>
            </div>
          </a>
        </div>

        <div style={{ marginTop: 32, padding: 22, borderRadius: 14, background: 'rgba(255,255,255,0.025)', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--muted)', fontFamily: 'Outfit', fontSize: '.88rem' }}>
            <strong style={{ color: '#fff' }}>Address:</strong> {DESTINATION}
          </p>
        </div>
      </div>
    </section>
  )
}
