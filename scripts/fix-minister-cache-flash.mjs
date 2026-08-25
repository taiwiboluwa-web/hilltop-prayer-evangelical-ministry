import fs from 'node:fs'

const file = 'src/App.tsx'
let source = fs.readFileSync(file, 'utf8')

// The minister loading state must exist before rendering. Keep this patch
// idempotent and support both formatted and compact App.tsx versions.
source = source.replace(
  /const\[ministers,setMinisters\]=useState<MinisterItem\[\]>\(DEFAULT_MINISTERS\);const\[ministersLoading,setMinistersLoading\]=useState\(false\)/,
  "const[ministers,setMinisters]=useState<MinisterItem[]>([]);const[ministersLoading,setMinistersLoading]=useState(true)"
)
source = source.replace(
  /const \[ministers, setMinisters\] = useState<MinisterItem\[\]>\(DEFAULT_MINISTERS\)\s*\n\s*const \[ministersLoading, setMinistersLoading\] = useState\(false\)/,
  "const [ministers, setMinisters] = useState<MinisterItem[]>([])\n  const [ministersLoading, setMinistersLoading] = useState(true)"
)

// If the database is empty or unavailable, the fallback is assigned only
// after the request completes, never during the initial render.
if (!source.includes('HILLTOP_MINISTER_CACHE_FLASH_V2')) {
  source = source.replace('/* HILLTOP_MINISTER_CACHE_FLASH_V1 */', '/* HILLTOP_MINISTER_CACHE_FLASH_V1 */\n/* HILLTOP_MINISTER_CACHE_FLASH_V2 */')
  source += '\n'
}

fs.writeFileSync(file, source)
console.log('Minister refresh loading state stabilized')
