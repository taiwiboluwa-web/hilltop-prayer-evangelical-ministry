import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
let source = await readFile(path, 'utf8')

// About section — always show the requested Saturday Service details.
const schedule = "const SCHEDULE = [{ day: '2nd and 3rd Saturdays', name: 'Saturday Service', time: '5:00 PM - 7:00 PM', venue: '3 Kola Ojedeji Street, Ipaja, Lagos' }]"
source = source.replace(/const SCHEDULE\s*=\s*\[[\s\S]*?\]\s*\n/, `${schedule}\n`)

// Remove every remaining old 5:30 PM display value.
source = source.replace(/5:30 PM\s*-\s*8:00 PM/g, '5:00 PM - 7:00 PM')
source = source.replace(/5:30 PM/g, '5:00 PM')

// Replace the entire countdown calculation, regardless of its previous formatting.
const countdown = `function getNextServiceDate(now: Date = new Date()): Date {
  // Hilltop services hold on the 2nd and 3rd Saturdays of every month at 5:00 PM.
  // The next occurrence is calculated at runtime, so the countdown never expires.
  const getNthSaturday = (year: number, month: number, nth: number): Date => {
    const first = new Date(year, month, 1, 17, 0, 0, 0)
    const offset = (6 - first.getDay() + 7) % 7
    return new Date(year, month, 1 + offset + (nth - 1) * 7, 17, 0, 0, 0)
  }

  const year = now.getFullYear()
  const month = now.getMonth()
  const second = getNthSaturday(year, month, 2)
  const third = getNthSaturday(year, month, 3)

  if (now < second) return second
  if (now < third) return third
  return getNthSaturday(year, month + 1, 2)
}
`
source = source.replace(/function getNextServiceDate\([\s\S]*?\n\}\n\nfunction useCountdown/, `${countdown}\nfunction useCountdown`)

await writeFile(path, source, 'utf8')
console.log('Saturday Service display and countdown permanently synchronized to 5:00 PM')
