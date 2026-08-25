import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
let source = await readFile(path, 'utf8')

// Saturday Service: 12 September 2026 at 5:00 PM, 3 Kola Ojedeji Street, Ipaja, Lagos.
source = source.replace(
  /const SCHEDULE = \[\{ day: '[^']*', name: '[^']*', time: '[^']*' \}\]/,
  "const SCHEDULE = [{ day: 'Saturday, 12 September 2026', name: 'Saturday Service', time: '5:00 PM - 7:00 PM', venue: '3 Kola Ojedeji Street, Ipaja, Lagos' }]"
)

source = source.replace(
  /function getNextServiceDate\(now:Date=new Date\(\)\):Date\{[^}]*\}\nfunction useCountdown/,
  "function getNextServiceDate(now:Date=new Date()):Date {\n  const target = new Date(2026, 8, 12, 17, 0, 0, 0)\n  return target\n}\nfunction useCountdown"
)

source = source.replace(/Saturday Service/g, 'Saturday Service')
source = source.replace(/Saturday, 12 September 2026/g, 'Saturday, 12 September 2026')
source = source.replace(/5:00 PM, 3 Kola Ojedeji Street, Ipaja, Lagos/g, '5:00 PM, 3 Kola Ojedeji Street, Ipaja, Lagos')

await writeFile(path, source, 'utf8')
console.log('Saturday Service date, time, venue and countdown updated')
