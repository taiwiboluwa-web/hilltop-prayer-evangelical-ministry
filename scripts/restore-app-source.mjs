import fs from 'node:fs/promises'

const url = 'https://raw.githubusercontent.com/taiwiboluwa-web/hilltop-prayer-evangelical-ministry/fd0290cc0300db614054346dc0fe3aaea519de6e/src/App.tsx'
const response = await fetch(url)
if (!response.ok) throw new Error(`Unable to restore canonical App.tsx: ${response.status}`)
let source = await response.text()
if (!source.includes('function MinistersSection()') || !source.includes('export function App')) {
  throw new Error('Canonical App.tsx validation failed')
}

// The canonical source contains the original 5:30 PM prayer-service target.
// Normalize it immediately after restore so no later build step can resurrect
// the old time/countdown.
source = source.replace(/5:30 PM\s*-\s*8:00 PM/g, '5:00 PM - 7:00 PM')
source = source.replace(/new Date\((yy|y),\s*(mm|m),\s*1,\s*17,\s*30(?:,\s*0)?\)/g, 'new Date($1,$2,1,17,0,0)')
source = source.replace(/new Date\((yy|y),\s*(mm|m),\s*1,\s*17,\s*30,\s*0\)/g, 'new Date($1,$2,1,17,0,0)')

// The canonical source also contains demo sermon cards. The public Sermons
// page must start empty now that the sermon records have been removed from
// the content database. Keep the admin sermon tools intact so new sermons
// can still be published later.
const sermonBlock = /const SERMONS = \[[\s\S]*?\]\n\nconst SERMON_TAGS/
if (!sermonBlock.test(source)) {
  throw new Error('Canonical sermon data block not found; refusing to build with stale demo sermons')
}
source = source.replace(sermonBlock, 'const SERMONS: any[] = []\n\nconst SERMON_TAGS')

await fs.writeFile('src/App.tsx', source, 'utf8')
console.log('Canonical App.tsx restored with service-time normalization and an empty public sermon list')
