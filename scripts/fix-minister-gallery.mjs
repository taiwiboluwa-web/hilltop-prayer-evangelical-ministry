import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/App.tsx')
let source = fs.readFileSync(file, 'utf8')

if (source.includes('MINISTER_GALLERY_V1')) process.exit(0)

source = source.replace(
  /interface MinisterRow \{[\s\S]*?\n\}\n\ninterface MinisterItem \{[\s\S]*?\n\}/,
  `interface MinisterRow {
  id?: number | string
  name: string
  role: string
  desc?: string
  desc_text?: string
  image_url?: string
  img?: string
  image_url_2?: string
  image_url_3?: string
}

interface MinisterItem {
  id: number | string
  name: string
  role: string
  desc: string
  img: string
  photos: string[]
}`
)

const start = source.indexOf('function MinistersSection() {')
const end = source.indexOf('\nfunction Giving() {', start)
if (start < 0 || end < 0) throw new Error('MinistersSection block not found')

const block = String.raw`function MinistersSection() {
  const [ministers, setMinisters] = useState<MinisterItem[]>(DEFAULT_MINISTERS.map((m: any) => ({ ...m, photos: [m.img].filter(Boolean) })))
  const [selectedMinister, setSelectedMinister] = useState<MinisterItem | null>(null)
  const [photoIndex, setPhotoIndex] = useState<Record<string, number>>({})
  const [modalPhotoIndex, setModalPhotoIndex] = useState(0)

  useEffect(() => {
    supabase.from('ministers').select('*').order('display_order', { ascending: true }).order('id', { ascending: true }).then(({ data }) => {
      if (data && data.length > 0) {
        setMinisters(data.map((m: MinisterRow) => {
          const photos = [m.image_url, m.image_url_2, m.image_url_3, m.img].filter((url): url is string => Boolean(url))
          const uniquePhotos = [...new Set(photos)]
          return {
            id: m.id ?? 1,
            name: m.name,
            role: m.role,
            desc: m.desc_text || m.desc || '',
            img: uniquePhotos[0] || IMGS.pastor,
            photos: uniquePhotos.length ? uniquePhotos : [IMGS.pastor],
          }
        }))
      }
    })
  }, [])

  const openMinister = (minister: MinisterItem) => {
    setSelectedMinister(minister)
    setModalPhotoIndex(photoIndex[String(minister.id)] || 0)
  }

  const changeCardPhoto = (e: React.MouseEvent, minister: MinisterItem, direction: number) => {
    e.stopPropagation()
    const key = String(minister.id)
    const current = photoIndex[key] || 0
    const next = (current + direction + minister.photos.length) % minister.photos.length
    setPhotoIndex(prev => ({ ...prev, [key]: next }))
  }

  const changeModalPhoto = (direction: number) => {
    if (!selectedMinister) return
    setModalPhotoIndex(current => (current + direction + selectedMinister.photos.length) % selectedMinister.photos.length)
  }

  return (
    <section id="ministers" style={{ padding: '140px 24px 100px', background: 'var(--bg2)', position: 'relative', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="label" style={{ marginBottom: 16 }}>Leadership</div>
          <AnimatedText tag="h2" className="display" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', marginBottom: 16 }}>
            Meet Our Ministers
          </AnimatedText>
          <p style={{ fontFamily: 'Outfit', color: 'var(--muted)', fontSize: '1rem', maxWidth: 550, margin: '0 auto' }}>
            Dedicated servants called to lead, teach, and nurture the Hilltop family in faith and love.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 30 }}>
          {ministers.map(m => {
            const currentPhoto = photoIndex[String(m.id)] || 0
            const photo = m.photos[currentPhoto] || m.img
            return (
              <div key={m.id} className="card" onClick={() => openMinister(m)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s ease, border-color 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ height: 300, position: 'relative', background: '#0f0f18', overflow: 'hidden' }}>
                  <img src={photo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85) saturate(0.85)', transition: 'opacity .25s ease, transform .45s ease' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(8,8,14,0.9) 100%)' }} />
                  {m.photos.length > 1 && <>
                    <button type="button" aria-label="Previous minister photo" onClick={e => changeCardPhoto(e, m, -1)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(8,8,14,.68)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>‹</button>
                    <button type="button" aria-label="Next minister photo" onClick={e => changeCardPhoto(e, m, 1)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(8,8,14,.68)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>›</button>
                    <div style={{ position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', display: 'flex', gap: 6, padding: '5px 8px', borderRadius: 999, background: 'rgba(8,8,14,.58)', backdropFilter: 'blur(8px)' }}>
                      {m.photos.map((_, index) => <span key={index} style={{ width: index === currentPhoto ? 18 : 6, height: 6, borderRadius: 999, background: index === currentPhoto ? 'var(--gold-light)' : 'rgba(255,255,255,.42)', transition: 'all .2s ease' }} />)}
                    </div>
                    <div style={{ position: 'absolute', top: 14, right: 14, padding: '5px 9px', borderRadius: 999, background: 'rgba(8,8,14,.62)', color: 'var(--ivory)', fontFamily: 'Outfit', fontSize: '.65rem' }}>{currentPhoto + 1} / {m.photos.length}</div>
                  </>}
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', background: 'var(--bg3)' }}>
                  <div>
                    <div style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: 'var(--gold-light)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{m.role}</div>
                    <div className="serif" style={{ fontSize: '1.5rem', color: 'var(--ivory)', marginBottom: 10 }}>{m.name}</div>
                    <p style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.desc}</p>
                  </div>
                  <div style={{ marginTop: 20, fontFamily: 'Outfit', fontSize: '0.78rem', color: 'var(--gold-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>Read Bio <span style={{ opacity: .5 }}>·</span> {m.photos.length} {m.photos.length === 1 ? 'photo' : 'photos'} →</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedMinister && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(8,8,14,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setSelectedMinister(null)}>
          <div style={{ background: '#12121c', border: '1px solid var(--border-hi)', borderRadius: 24, width: '100%', maxWidth: 820, maxHeight: '88vh', overflowY: 'auto', padding: '32px', position: 'relative', boxShadow: '0 25px 70px rgba(0,0,0,0.65)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedMinister(null)} aria-label="Close minister details" style={{ position: 'absolute', top: 18, right: 18, zIndex: 5, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>✕</button>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, .9fr) minmax(0, 1.1fr)', gap: 30, alignItems: 'start' }}>
              <div>
                <div style={{ position: 'relative', height: 360, borderRadius: 18, overflow: 'hidden', background: '#0f0f18' }}>
                  <img src={selectedMinister.photos[modalPhotoIndex] || selectedMinister.img} alt={selectedMinister.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {selectedMinister.photos.length > 1 && <>
                    <button type="button" aria-label="Previous minister photo" onClick={() => changeModalPhoto(-1)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(8,8,14,.7)', color: '#fff', cursor: 'pointer', fontSize: 24 }}>‹</button>
                    <button type="button" aria-label="Next minister photo" onClick={() => changeModalPhoto(1)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(8,8,14,.7)', color: '#fff', cursor: 'pointer', fontSize: 24 }}>›</button>
                  </>}
                </div>
                {selectedMinister.photos.length > 1 && <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {selectedMinister.photos.map((photo, index) => <button key={photo + index} type="button" onClick={() => setModalPhotoIndex(index)} aria-label={'View minister photo ' + (index + 1)} style={{ width: 62, height: 62, padding: 0, borderRadius: 10, overflow: 'hidden', border: index === modalPhotoIndex ? '2px solid var(--gold)' : '1px solid var(--border)', background: '#0f0f18', cursor: 'pointer', opacity: index === modalPhotoIndex ? 1 : .65 }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></button>)}
                </div>}
              </div>
              <div style={{ paddingTop: 10 }}>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.72rem', color: 'var(--gold-light)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{selectedMinister.role}</div>
                <h3 className="serif" style={{ fontSize: 'clamp(2rem,4vw,2.7rem)', color: 'var(--ivory)', margin: '0 0 24px' }}>{selectedMinister.name}</h3>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.92rem', color: 'var(--muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{selectedMinister.desc}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/* MINISTER_GALLERY_V1 */`

source = source.slice(0, start) + block + source.slice(end)
fs.writeFileSync(file, source)
console.log('Public minister three-photo gallery applied')
