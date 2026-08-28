import fs from 'node:fs'

const file = 'src/App.tsx'
let source = fs.readFileSync(file, 'utf8')

// Prevent the Ministers page from briefly rendering the old fallback list.
// This is intentionally idempotent because Vercel runs the build patch more than once.
source = source.replace(
  /const\[ministers,setMinisters\]=useState<MinisterItem\[\]>\(DEFAULT_MINISTERS\);const\[ministersLoading,setMinistersLoading\]=useState\(false\)/,
  "const[ministers,setMinisters]=useState<MinisterItem[]>([]);const[ministersLoading,setMinistersLoading]=useState(true)"
)
source = source.replace(
  /const \[ministers, setMinisters\] = useState<MinisterItem\[\]>\(DEFAULT_MINISTERS\)\s*\n\s*const \[ministersLoading, setMinistersLoading\] = useState\(false\)/,
  "const [ministers, setMinisters] = useState<MinisterItem[]>([])\n  const [ministersLoading, setMinistersLoading] = useState(true)"
)

// Never reuse a previous browser/CDN image response for a minister photo.
// Supabase rows commonly expose updated_at; when they do, that value gives a
// stable cache key. Date.now() is used as a safe fallback for older rows.
if (!source.includes('HILLTOP_MINISTER_IMAGE_CACHE_BUSTER_V3')) {
  const marker = 'interface MinisterItem { id: number|string; name: string; role: string; desc: string; img: string }'
  const helper = `${marker}\nfunction bustMinisterImageUrl(src:string, version?:string|number){if(!src)return src;const separator=src.includes('?')?'&':'?';return src+separator+'hmv='+encodeURIComponent(String(version||Date.now()))}`
  if (source.includes(marker)) source = source.replace(marker, helper)
  else throw new Error('MinisterItem interface marker not found in src/App.tsx')
  source = source.replace(/img:m\.image_url\|\|m\.img\|\|IMGS\.pastor/g, 'img:bustMinisterImageUrl(m.image_url||m.img||IMGS.pastor,(m as any).updated_at)')
  source = source.replace(/interface MinisterRow \{ id\?: number\|string; name: string; role: string; desc\?: string; image_url\?: string; img\?: string \}/, 'interface MinisterRow { id?: number|string; name: string; role: string; desc?: string; image_url?: string; img?: string; updated_at?: string }')
  source += '\n/* HILLTOP_MINISTER_IMAGE_CACHE_BUSTER_V3 */\n'
}

// Keep the marker used by previous deployments so this script remains compatible.
if (!source.includes('HILLTOP_MINISTER_CACHE_FLASH_V2')) {
  source = source.replace('/* HILLTOP_MINISTER_CACHE_FLASH_V1 */', '/* HILLTOP_MINISTER_CACHE_FLASH_V1 */\n/* HILLTOP_MINISTER_CACHE_FLASH_V2 */')
  source += '\n'
}

fs.writeFileSync(file, source)
console.log('Minister refresh loading state and image cache invalidation stabilized')
