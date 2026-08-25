import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
let source = await readFile(path, 'utf8')

const marker = "const EVENTS = ["
const additions = `  { date: 'EVERY JUL', title: 'Annual Prayer Conference', desc: 'Our annual gathering for prayer, worship, teaching, and spiritual renewal.', time: 'Every July', venue: 'Hilltop Auditorium, Ipaja', img: IMGS.prayer },\n  { date: 'TBA', title: 'Men Alone with God', desc: 'A dedicated time for men to seek God, receive direction, and strengthen their walk of faith.', time: 'Date to be announced', venue: 'Hilltop Auditorium, Ipaja', img: IMGS.night },\n  { date: 'TBA', title: 'Women Alone with God', desc: 'A focused gathering for women to pray, worship, receive strength, and grow spiritually.', time: 'Date to be announced', venue: 'Hilltop Auditorium, Ipaja', img: IMGS.worship },\n  { date: 'TBA', title: 'Singles & Youth Alone with God', desc: 'A focused encounter for singles and young people seeking God for purpose, direction, and destiny.', time: 'Date to be announced', venue: 'Hilltop Auditorium, Ipaja', img: IMGS.raising },\n  { date: 'TBA', title: 'Unveiling My Times & Season', desc: 'A prophetic and prayer-focused gathering for clarity, discernment, and understanding of your season.', time: 'Date to be announced', venue: 'Hilltop Auditorium, Ipaja', img: IMGS.mission },\n  { date: 'TBA', title: 'My Gates Are Open', desc: 'A faith-filled gathering focused on prayer, open doors, breakthrough, and divine opportunities.', time: 'Date to be announced', venue: 'Hilltop Auditorium, Ipaja', img: IMGS.community },\n`

if (!source.includes("title: 'Annual Prayer Conference'")) {
  const index = source.indexOf(marker)
  if (index === -1) throw new Error('EVENTS array not found in src/App.tsx')
  const insertionPoint = index + marker.length
  source = source.slice(0, insertionPoint) + '\n' + additions + source.slice(insertionPoint)
  await writeFile(path, source, 'utf8')
  console.log('Special Hilltop events added')
} else {
  console.log('Special Hilltop events already present')
}
