import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
let source = await readFile(path, 'utf8')

// About section — keep the displayed service card and countdown synchronized.
const schedule = "const SCHEDULE = [{ day: 'Saturday, 12 September 2026', name: 'Saturday Service', time: '5:00 PM - 7:00 PM', venue: '3 Kola Ojedeji Street, Ipaja, Lagos' }]"
source = source.replace(
  /const SCHEDULE = \[\{[^\]]*\}\]/,
  schedule
)

// Countdown target: Saturday, 12 September 2026 at 5:00 PM (Lagos time).
const oldCountdown = /function getNextServiceDate\(now:Date=new Date\(\):Date\)\{.*?\}\n?function useCountdown/s
const newCountdown = "function getNextServiceDate(now:Date=new Date()):Date{const target=new Date(2026,8,12,17,0,0,0);return target}\nfunction useCountdown"
if (oldCountdown.test(source)) source = source.replace(oldCountdown, newCountdown)

// If the source already has the service function in the compact format, replace it directly.
source = source.replace(
  /function getNextServiceDate\(now:Date=new Date\(\):Date\)\{[^\n]*\}/,
  'function getNextServiceDate(now:Date=new Date()):Date{const target=new Date(2026,8,12,17,0,0,0);return target}'
)

await writeFile(path, source, 'utf8')
console.log('About Saturday Service updated: 12 September 2026, 5:00 PM, 3 Kola Ojedeji Street, Ipaja, Lagos; countdown synchronized')
