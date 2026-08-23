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
  const width = size === 'sm' ? 190 : 270
  const height = Math.round(width * 41 / 118)
  return (
    <img
      src="/Hilltop Prayer (2).png"
      alt="Hilltop Ministry"
      width={width}
      height={height}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      style={{ display: 'block', width, height, objectFit: 'contain' }}
    />
  )
}

export function Navbar({ activePage, setActivePage }: { activePage: string; setActivePage: (page: string) => void }) {
  const scrolled = useScrolled()
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768)
    checkScreen()
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  const handleNavClick = (l: string) => {
    setActivePage(l)
    setOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', padding: '18px 20px' }}>
      <nav className="glass" style={{ width: '100%', maxWidth: 1100, borderRadius: 100, padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: scrolled ? 'rgba(10,10,18,0.9)' : 'rgba(15,15,24,0.55)', transition: 'background 0.4s ease' }}>
        <button onClick={() => handleNavClick('Home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Logo size="sm" /></button>
        {!isMobile && (<div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>{NAV_LINKS.map(l => (<button key={l} onClick={() => handleNavClick(l)} style={{ fontFamily: 'Outfit', fontSize: '0.78rem', fontWeight: 500, color: activePage === l ? '#c9a84c' : 'rgba(242,237,228,0.65)', padding: '6px 12px', borderRadius: 100, border: 'none', background: activePage === l ? 'rgba(201,168,76,0.12)' : 'transparent', cursor: 'pointer', letterSpacing: '0.02em', transition: 'all 0.15s ease' }} onMouseEnter={e => { if (activePage !== l) { (e.currentTarget as HTMLElement).style.color = '#f2ede4'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' } }} onMouseLeave={e => { if (activePage !== l) { (e.currentTarget as HTMLElement).style.color = 'rgba(242,237,228,0.65)'; (e.currentTarget as HTMLElement).style.background = 'transparent' } }}>{l}</button>))}</div>)}
        {!isMobile && (<button onClick={() => handleNavClick('Give')} className="btn btn-gold" style={{ padding: '9px 20px', fontSize: '0.68rem', border: 'none', cursor: 'pointer' }}>Give</button>)}
        {isMobile && (<button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#f2ede4', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Menu"><svg width="22" height="16" viewBox="0 0 22 16" fill="currentColor">{open ? <><line x1="1" y1="1" x2="21" y2="15" stroke="currentColor" strokeWidth="2"/><line x1="21" y1="1" x2="1" y2="15" stroke="currentColor" strokeWidth="2"/></> : <><rect width="22" height="2" rx="1"/><rect y="7" width="16" height="2" rx="1"/><rect y="14" width="22" height="2" rx="1"/></>}</svg></button>)}
      </nav>
      {isMobile && open && (<div className="glass-hi" style={{ position: 'absolute', top: 76, left: 20, right: 20, borderRadius: 20, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(15,15,24,0.95)', backdropFilter: 'blur(12px)' }}>{NAV_LINKS.map(l => (<button key={l} onClick={() => handleNavClick(l)} style={{ fontFamily: 'Outfit', fontSize: '0.9rem', color: activePage === l ? '#c9a84c' : 'rgba(242,237,228,0.7)', padding: '10px 4px', textDecoration: 'none', border: 'none', background: 'transparent', textAlign: 'left', borderBottom: '1px solid rgba(201,168,76,0.08)', cursor: 'pointer' }}>{l}</button>))}<button onClick={() => handleNavClick('Give')} className="btn btn-gold" style={{ padding: '12px 24px', justifyContent: 'center', marginTop: 8, width: '100%', border: 'none', cursor: 'pointer' }}>Give Now</button></div>)}
    </header>
  )
}
