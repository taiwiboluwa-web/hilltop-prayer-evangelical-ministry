import { useState, useEffect } from 'react'

const NAV_LINKS = ['Home', 'About', 'Sermons', 'Events', 'Ministers', 'Become a Member', 'Give']

function useScrolled(px = 60) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const fn = () => setOn(window.scrollY > px)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [px])
  return on
}

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 28 : 34
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={s} height={s} viewBox="0 0 34 34" fill="none">
        <polygon points="17,2 32,31 2,31" stroke="#c9a84c" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
        <line x1="17" y1="2" x2="17" y2="31" stroke="#c9a84c" strokeWidth="1" opacity="0.35"/>
        <circle cx="17" cy="18" r="2.5" fill="#c9a84c" opacity="0.7"/>
      </svg>
      <div>
        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: size === 'sm' ? '0.8rem' : '0.9rem', letterSpacing: '0.15em', background: 'linear-gradient(135deg,#c9a84c,#e4c76b,#c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>HILLTOP</div>
        <div style={{ fontFamily: 'Outfit', fontSize: '0.55rem', letterSpacing: '0.18em', color: 'rgba(201,168,76,0.5)', marginTop: '-1px' }}>MINISTRY</div>
      </div>
    </div>
  )
}

export function Navbar({ activePage, setActivePage }: { activePage: string; setActivePage: (page: string) => void }) {
  const scrolled = useScrolled()
  const [open, setOpen] = useState(false)

  const handleNavClick = (l: string) => {
    setActivePage(l)
    setOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', padding: '18px 20px' }}>
      <nav
        className="glass"
        style={{
          width: '100%', maxWidth: 1020,
          borderRadius: 100,
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: 8,
          background: scrolled ? 'rgba(10,10,18,0.9)' : 'rgba(15,15,24,0.55)',
          transition: 'background 0.4s ease',
        }}
      >
        <button onClick={() => handleNavClick('Home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Logo size="sm" />
        </button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }} className="nav-links">
          {NAV_LINKS.map(l => (
            <button key={l} onClick={() => handleNavClick(l)}
              style={{
                fontFamily: 'Outfit', fontSize: '0.78rem', fontWeight: 500,
                color: activePage === l ? '#c9a84c' : 'rgba(242,237,228,0.65)',
                padding: '6px 12px', borderRadius: 100, border: 'none', background: activePage === l ? 'rgba(201,168,76,0.12)' : 'transparent',
                cursor: 'pointer', letterSpacing: '0.02em', transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { if (activePage !== l) { (e.currentTarget as HTMLElement).style.color = '#f2ede4'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' } }}
              onMouseLeave={e => { if (activePage !== l) { (e.currentTarget as HTMLElement).style.color = 'rgba(242,237,228,0.65)'; (e.currentTarget as HTMLElement).style.background = 'transparent' } }}
            >{l}</button>
          ))}
        </div>
        <button onClick={() => handleNavClick('Give')} className="btn btn-gold" style={{ padding: '9px 20px', fontSize: '0.68rem', border: 'none', cursor: 'pointer' }}>Give</button>
        <button onClick={() => setOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', color: '#f2ede4', cursor: 'pointer', padding: 6 }} className="mob-menu-btn" aria-label="Menu">
          <svg width="22" height="16" viewBox="0 0 22 16" fill="currentColor">
            {open
              ? <><line x1="1" y1="1" x2="21" y2="15" stroke="currentColor" strokeWidth="2"/><line x1="21" y1="1" x2="1" y2="15" stroke="currentColor" strokeWidth="2"/></>
              : <><rect width="22" height="2" rx="1"/><rect y="7" width="16" height="2" rx="1"/><rect y="14" width="22" height="2" rx="1"/></>}
          </svg>
        </button>
      </nav>
      {open && (
        <div className="glass-hi" style={{ position: 'absolute', top: 76, left: 20, right: 20, borderRadius: 20, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {NAV_LINKS.map(l => (
            <button key={l} onClick={() => handleNavClick(l)}
              style={{ fontFamily: 'Outfit', fontSize: '0.9rem', color: activePage === l ? '#c9a84c' : 'rgba(242,237,228,0.7)', padding: '10px 4px', textDecoration: 'none', border: 'none', background: 'transparent', textAlign: 'left', borderBottom: '1px solid rgba(201,168,76,0.08)', cursor: 'pointer' }}>{l}</button>
          ))}
          <button onClick={() => handleNavClick('Give')} className="btn btn-gold" style={{ padding: '12px 24px', justifyContent: 'center', marginTop: 8, width: '100%', border: 'none', cursor: 'pointer' }}>Give Now</button>
        </div>
      )}
    </header>
  )
}
