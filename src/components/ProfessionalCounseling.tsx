import type { CSSProperties } from 'react'

const services = [
  ['Pre-Marital & Marital Counseling', 'Guidance for couples preparing for marriage and support for married couples seeking healthier, stronger relationships.'],
  ['Career', 'Guidance to help you identify your strengths, explore opportunities, and make informed professional decisions.'],
  ['Education', 'Support with educational choices, academic direction, and planning for your future.'],
  ['Spiritual', 'Faith-based guidance for personal growth, spiritual development, and navigating life\'s challenges.'],
  ['Mentorship', 'Personal guidance and accountability to help you grow in character, purpose, leadership, and life skills.'],
  ['Discipleship', 'Christ-centered teaching and spiritual formation for growing deeper in faith and following Christ.'],
  ['Relocation — Within Nigeria & Abroad', 'Practical and spiritual guidance for individuals and families considering local or international relocation.'],
  ['Choice of Where to Worship', 'Guidance for individuals and families seeking a church community where they can grow, serve, and worship meaningfully.'],
  ['Deliverance Prayer', 'Prayer and spiritual support for those seeking freedom, restoration, and spiritual breakthrough.'],
  ['Family & Community Deliverance', 'Prayer and spiritual support focused on healing, restoration, unity, and freedom for families and communities.'],
]

const serviceCard: CSSProperties = {
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(201,168,76,0.16)',
  borderRadius: 18,
  padding: '20px 18px',
  transition: 'transform .25s ease, border-color .25s ease, background .25s ease',
}

export function ProfessionalCounseling() {
  return (
    <section id="professional-counseling" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg,#08080e 0%,#0f0f18 48%,#08080e 100%)', padding: '110px 24px' }}>
      <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,.14),transparent 68%)', top: -180, right: -140, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,.08),transparent 70%)', bottom: -180, left: -140, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,.75fr) minmax(0,1.5fr)', gap: 54, alignItems: 'start' }}>
          <div style={{ position: 'sticky', top: 120 }}>
            <div className="label" style={{ marginBottom: 16 }}>Care • Guidance • Prayer</div>
            <h2 className="display" style={{ fontSize: 'clamp(2.5rem,5vw,4.7rem)', marginBottom: 20 }}>Professional Counseling</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '1rem', maxWidth: 430 }}>
              Faith-based guidance for individuals, couples, families, and communities as you navigate important decisions, relationships, spiritual growth, and life transitions.
            </p>
            <div style={{ marginTop: 28, padding: 20, borderRadius: 18, border: '1px solid var(--border-hi)', background: 'var(--gold-dim)' }}>
              <div style={{ color: 'var(--gold-light)', fontFamily: 'Instrument Serif', fontSize: '1.45rem', fontStyle: 'italic' }}>You don't have to walk through it alone.</div>
              <div style={{ color: 'var(--muted)', marginTop: 8, lineHeight: 1.6, fontSize: '.86rem' }}>Connect with Hilltop for prayer, counsel, mentorship, and practical direction.</div>
            </div>
          </div>

          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14 }}>
              {services.map(([title, description], index) => (
                <article key={title} style={serviceCard} onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor='rgba(201,168,76,.38)'; e.currentTarget.style.background='rgba(201,168,76,.06)' }} onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(201,168,76,.16)'; e.currentTarget.style.background='rgba(255,255,255,.035)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <span style={{ width:28, height:28, borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', background:'var(--gold-dim)', border:'1px solid var(--border-hi)', color:'var(--gold-light)', fontSize:'.7rem', fontWeight:700 }}>{String(index+1).padStart(2,'0')}</span>
                    <h3 style={{ color:'var(--ivory)', fontSize:'1rem', lineHeight:1.3, fontWeight:600 }}>{title}</h3>
                  </div>
                  <p style={{ color:'var(--muted)', lineHeight:1.65, fontSize:'.82rem', paddingLeft:38 }}>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){#professional-counseling{padding:78px 16px!important}#professional-counseling>div>div{grid-template-columns:1fr!important;gap:34px!important}#professional-counseling [style*="position: sticky"]{position:relative!important;top:auto!important}#professional-counseling [style*="repeat(2"]{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}
