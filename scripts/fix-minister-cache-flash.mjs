import fs from 'node:fs'

const file = 'src/App.tsx'
let source = fs.readFileSync(file, 'utf8')
if (source.includes('HILLTOP_MINISTER_CACHE_FLASH_V1')) process.exit(0)

source = source.replace(
  "  const [ministers, setMinisters] = useState<MinisterItem[]>(DEFAULT_MINISTERS)\n  const [selectedMinister, setSelectedMinister] = useState<MinisterItem | null>(null)",
  "  const [ministers, setMinisters] = useState<MinisterItem[]>([])\n  const [ministersLoading, setMinistersLoading] = useState(true)\n  const [selectedMinister, setSelectedMinister] = useState<MinisterItem | null>(null)"
)

source = source.replace(
  /  useEffect\(\(\) => \{\n    supabase\.from\('ministers'\)\.select\('\*'\)\.order\('id', \{ ascending: true \}\)\.then\(\(\{ data \}\) => \{\n      if \(data && data\.length > 0\) \{\n        setMinisters\(data\.map\(\(m: MinisterRow\) => \(\{[\s\S]*?\n        \}\)\)\)\n      \}\n    \}\)\n  \}, \[\]\)/,
  `  useEffect(() => {\n    let cancelled = false\n    const loadMinisters = async () => {\n      setMinistersLoading(true)\n      const { data, error } = await supabase.from('ministers').select('*').order('display_order', { ascending: true }).order('id', { ascending: true })\n      if (cancelled) return\n      if (!error && data && data.length > 0) {\n        setMinisters(data.map((m: MinisterRow) => ({\n          id: m.id ?? 1,\n          name: m.name,\n          role: m.role,\n          desc: m.desc || '',\n          img: m.image_url || m.img || IMGS.pastor,\n        })))\n      } else {\n        // Only use bundled defaults when the database genuinely has no usable data.\n        setMinisters(DEFAULT_MINISTERS)\n      }\n      setMinistersLoading(false)\n    }\n    loadMinisters()\n    return () => { cancelled = true }\n  }, [])`
)

const marker = `  return (\n    <section id="ministers"`
const replacement = `  if (ministersLoading) {\n    return (\n      <section id="ministers" style={{ padding: '140px 24px 100px', background: 'var(--bg2)', minHeight: '80vh' }}>\n        <div style={{ maxWidth: 1100, margin: '0 auto' }}>\n          <div style={{ textAlign: 'center', marginBottom: 60 }}>\n            <div className="label" style={{ marginBottom: 16 }}>Leadership</div>\n            <h2 className="display" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', marginBottom: 16 }}>Meet Our Ministers</h2>\n            <p style={{ fontFamily: 'Outfit', color: 'var(--muted)', fontSize: '1rem', maxWidth: 550, margin: '0 auto' }}>Loading our ministry leadership…</p>\n          </div>\n          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 30 }}>\n            {[1,2,3].map(i => <div key={i} className="card" style={{ minHeight: 360, opacity: .55 }} />)}\n          </div>\n        </div>\n      </section>\n    )\n  }\n\n  return (\n    <section id="ministers"`
if (!source.includes(marker)) throw new Error('MinistersSection marker not found')
source = source.replace(marker, replacement)
source = source.replace('/* MINISTER_PHOTO_POSITIONING_V1 */', '/* MINISTER_PHOTO_POSITIONING_V1 */\n/* HILLTOP_MINISTER_CACHE_FLASH_V1 */')
fs.writeFileSync(file, source)
console.log('Minister refresh flash/cache fallback fixed')
