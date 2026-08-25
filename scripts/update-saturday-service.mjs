import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
let source = await readFile(path, 'utf8')

// About section — always show the requested Saturday Service details.
const schedule = "const SCHEDULE = [{ day: 'Saturday, 12 September 2026', name: 'Saturday Service', time: '5:00 PM - 7:00 PM', venue: '3 Kola Ojedeji Street, Ipaja, Lagos' }]"
source = source.replace(/const SCHEDULE\s*=\s*\[[\s\S]*?\]\s*\n/, `${schedule}\n`)

// Remove every remaining old 5:30 PM display value.
source = source.replace(/5:30 PM\s*-\s*8:00 PM/g, '5:00 PM - 7:00 PM')
source = source.replace(/5:30 PM/g, '5:00 PM')

// Replace the entire countdown calculation, regardless of its previous formatting.
const countdown = `function getNextServiceDate(now: Date = new Date()): Date {
  // Saturday, 12 September 2026 at exactly 5:00 PM local Lagos time.
  return new Date(2026, 8, 12, 17, 0, 0, 0)
}
`
source = source.replace(/function getNextServiceDate\([\s\S]*?\n\}\n\nfunction useCountdown/, `${countdown}\nfunction useCountdown`)

await writeFile(path, source, 'utf8')
console.log('Saturday Service display and countdown permanently synchronized to 5:00 PM')
