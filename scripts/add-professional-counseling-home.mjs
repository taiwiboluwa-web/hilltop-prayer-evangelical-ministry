import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
let source = await readFile(path, 'utf8')
const importLine = "import { ProfessionalCounseling } from './components/ProfessionalCounseling'"

// Keep the counseling import stable and avoid duplicate imports.
source = source.replace(/\n?import \{ ProfessionalCounseling \} from '\.\/components\/ProfessionalCounseling'\n?/g, '\n')
source = source.replace("import { Navbar, Logo } from './components/Navbar'", "import { Navbar, Logo } from './components/Navbar'\n" + importLine)

// Render Home content as one explicit JSX parent. This prevents TS2657 when
// the build runs repeatedly and a previous generated insertion is present.
const homePattern = /\{activePage === 'Home' && \(<Hero setActivePage=\{setActivePage\} \/>\)\}/g
source = source.replace(homePattern, "{activePage === 'Home' && (\n        <>\n          <Hero setActivePage={setActivePage} />\n          <ProfessionalCounseling />\n        </>\n      )}")

// Remove any legacy standalone generated counseling line left by an older build patch.
source = source.replace(/\n\s*<ProfessionalCounseling \/>\n/g, '\n')

// Re-add the stable Home fragment if it was removed by the cleanup above.
if (!source.includes('<ProfessionalCounseling />')) {
  source = source.replace(homePattern, "{activePage === 'Home' && (\n        <>\n          <Hero setActivePage={setActivePage} />\n          <ProfessionalCounseling />\n        </>\n      )}")
}

// Add the requested recurring/ministry events once. These are displayed under Events.
const eventEntries = [
  "  { date: 'EVERY JULY', title: 'Annual Prayer Conference', desc: 'Our annual prayer gathering every July for focused prayer, worship, teaching, and spiritual renewal.', time: 'Every July', venue: 'Hilltop Prayer & Evangelical Ministry', img: IMGS.prayer },",
  "  { date: 'TBA', title: 'Men Alone with God', desc: 'A dedicated time for men to seek God, pray, reflect, and grow in faith and purpose.', time: 'Date to be announced', venue: 'Hilltop Prayer & Evangelical Ministry', img: IMGS.raising },",
  "  { date: 'TBA', title: 'Women Alone with God', desc: 'A focused gathering for women to seek God, receive strength, and grow in faith and purpose.', time: 'Date to be announced', venue: 'Hilltop Prayer & Evangelical Ministry', img: IMGS.worship },",
  "  { date: 'TBA', title: 'Singles & Youth Alone with God', desc: 'A focused time for singles and young people to seek God, build faith, and discover purpose.', time: 'Date to be announced', venue: 'Hilltop Prayer & Evangelical Ministry', img: IMGS.raising },",
  "  { date: 'TBA', title: 'Unveiling My Times & Seasons', desc: 'A prophetic and prayer-focused gathering centered on understanding God’s timing, seasons, and purpose.', time: 'Date to be announced', venue: 'Hilltop Prayer & Evangelical Ministry', img: IMGS.night },",
  "  { date: 'TBA', title: 'My Gates Are Open', desc: 'A prayer and faith gathering focused on open doors, divine access, breakthrough, and answered prayer.', time: 'Date to be announced', venue: 'Hilltop Prayer & Evangelical Ministry', img: IMGS.mission },",
]

const eventsMarker = 'const EVENTS = ['
const eventsStart = source.indexOf(eventsMarker)
if (eventsStart !== -1) {
  const eventsEnd = source.indexOf(']\n\nconst DEFAULT_MINISTERS', eventsStart)
  if (eventsEnd !== -1) {
    const block = source.slice(eventsStart, eventsEnd)
    const titles = ['Annual Prayer Conference', 'Men Alone with God', 'Women Alone with God', 'Singles & Youth Alone with God', 'Unveiling My Times & Seasons', 'My Gates Are Open']
    const missing = eventEntries.filter((entry, i) => !block.includes(`title: '${titles[i]}'`))
    if (missing.length) {
      source = source.slice(0, eventsEnd) + '\n' + missing.join('\n') + '\n' + source.slice(eventsEnd)
      console.log('Hilltop ministry events added')
    } else {
      console.log('Hilltop ministry events already present')
    }
  }
}

await writeFile(path, source, 'utf8')
console.log('Professional counseling Home integration stabilized')
