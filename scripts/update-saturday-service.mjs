import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
let source = await readFile(path, 'utf8')

// Keep the public About schedule informational. Countdown controls remain in Admin.
const schedule = "const SCHEDULE = [{ day: '2nd and 3rd Saturdays', name: 'Saturday Service', time: '5:00 PM - 7:00 PM', venue: '3 Kola Ojedeji Street, Ipaja, Lagos' }]"

// Replace the canonical schedule block without depending on its formatting.
source = source.replace(
  /const SCHEDULE\s*=\s*\[[\s\S]*?\]\s*\n/,
  `${schedule}\n`
)

// Normalize any legacy service-time copy.
source = source.replace(/5:30 PM\s*-\s*8:00 PM/g, '5:00 PM - 7:00 PM')
source = source.replace(/5:30 PM/g, '5:00 PM')

await writeFile(path, source, 'utf8')
console.log('Saturday Service schedule normalized to 5:00 PM - 7:00 PM')
