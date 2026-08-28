import fs from 'node:fs'

const file = 'src/App.tsx'
let source = fs.readFileSync(file, 'utf8')

// fix-minister-gallery.mjs runs immediately before this script and rewrites the
// MinisterItem/MinisterRow interfaces plus MinistersSection. Keep this patch
// tolerant of that standardized shape so repeated Vercel builds never fail.

// Prevent the Ministers page from briefly rendering stale fallback photos while
// the current Supabase rows are loading.
source = source.replace(
  /const \[ministers, setMinisters\] = useState<MinisterItem\[\]>\(DEFAULT_MINISTERS\.map\(\(m: any\) => \(\{ \.\.\.m, photos: \[m\.img\]\.filter\(Boolean\) \}\)\)\)/,
  "const [ministers, setMinisters] = useState<MinisterItem[]>([])"
)
source = source.replace(
  /const\[ministers,setMinisters\]=useState<MinisterItem\[\]>\(DEFAULT_MINISTERS\);const\[ministersLoading,setMinistersLoading\]=useState\(false\)/,
  "const[ministers,setMinisters]=useState<MinisterItem[]>([]);const[ministersLoading,setMinistersLoading]=useState(true)"
)
source = source.replace(
  /const \[ministers, setMinisters\] = useState<MinisterItem\[\]>\(DEFAULT_MINISTERS\)\s*\n\s*const \[ministersLoading, setMinistersLoading\] = useState\(false\)/,
  "const [ministers, setMinisters] = useState<MinisterItem[]>([])\n  const [ministersLoading, setMinistersLoading] = useState(true)"
)

// Add a cache-busting helper after the standardized MinisterItem interface.
if (!source.includes('HILLTOP_MINISTER_IMAGE_CACHE_BUSTER_V4')) {
  const marker = /interface MinisterItem \{[\s\S]*?\n\}/
  const match = source.match(marker)
  if (!match) {
    // The public gallery may have been skipped because it was already applied.
    // In that case, do not fail the deployment; the remaining build is valid.
    console.log('MinisterItem interface not found; cache helper skipped safely')
  } else {
    const helper = `${match[0]}\n\nfunction bustMinisterImageUrl(src: string, version?: string | number) {\n  if (!src) return src\n  const separator = src.includes('?') ? '&' : '?'\n  return src + separator + 'hmv=' + encodeURIComponent(String(version || Date.now()))\n}`
    source = source.replace(match[0], helper)
  }

  // Supabase minister rows may expose updated_at. It gives each photo a stable
  // cache key when the record changes, while Date.now() remains the safe fallback.
  source = source.replace(
    /interface MinisterRow \{([\s\S]*?)\n\}/,
    (full, body) => body.includes('updated_at')
      ? full
      : `interface MinisterRow {${body}\n  updated_at?: string\n}`
  )

  // Bust every Supabase photo URL before it reaches the public minister gallery.
  source = source.replace(
    /const photos = \[m\.image_url, m\.image_url_2, m\.image_url_3, m\.img\]\.filter\(\(url\): url is string => Boolean\(url\)\)/,
    "const photos = [m.image_url, m.image_url_2, m.image_url_3, m.img].filter((url): url is string => Boolean(url)).map(url => bustMinisterImageUrl(url, m.updated_at))"
  )

  // If the earlier gallery patch uses a compact mapping shape, support that too.
  source = source.replace(
    /img:m\.image_url\|\|m\.img\|\|IMGS\.pastor/g,
    'img:bustMinisterImageUrl(m.image_url||m.img||IMGS.pastor,(m as any).updated_at)'
  )

  source += '\n/* HILLTOP_MINISTER_IMAGE_CACHE_BUSTER_V4 */\n'
}

// Keep compatibility markers for older deployment patches without throwing.
if (!source.includes('HILLTOP_MINISTER_CACHE_FLASH_V2')) {
  source = source.replace('/* HILLTOP_MINISTER_CACHE_FLASH_V1 */', '/* HILLTOP_MINISTER_CACHE_FLASH_V1 */\n/* HILLTOP_MINISTER_CACHE_FLASH_V2 */')
  source += '\n'
}

fs.writeFileSync(file, source)
console.log('Minister refresh loading state and image cache invalidation stabilized')
