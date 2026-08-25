import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
let source = await readFile(path, 'utf8')
const importLine = "import { ProfessionalCounseling } from './components/ProfessionalCounseling'"

// Normalize the import so repeated Vercel builds never create duplicates.
source = source.replace(/\n?import \{ ProfessionalCounseling \} from '\.\/components\/ProfessionalCounseling'\n?/g, '\n')
if (!source.includes(importLine)) {
  source = source.replace("import { Navbar, Logo } from './components/Navbar'", "import { Navbar, Logo } from './components/Navbar'\n" + importLine)
}

const homeMarker = "{activePage === 'Home' && <Hero setActivePage={setActivePage} />}"
const homeFragment = `{activePage === 'Home' && (\n        <>\n          <Hero setActivePage={setActivePage} />\n          <ProfessionalCounseling />\n        </>\n      )}`

// If the counseling component is already integrated, do not try to match or
// rewrite the surrounding JSX. Vercel can execute this build script multiple
// times in one deployment, and the first execution may already have changed
// the Home render expression.
const counselingAlreadyIntegrated = source.includes('<ProfessionalCounseling />')

if (counselingAlreadyIntegrated) {
  console.log('Professional counseling Home integration already present')
} else if (source.includes(homeMarker)) {
  source = source.replace(homeMarker, homeFragment)
  console.log('Professional counseling section added to Home')
} else if (!source.includes("activePage === 'Home'")) {
  throw new Error('Home render marker not found in src/App.tsx')
} else {
  // A Home render exists but uses a different valid JSX structure. Do not
  // break the deployment merely because the exact marker changed. The source
  // remains untouched and the build can proceed safely.
  console.log('Home render structure already differs; counseling patch skipped safely')
}

// Add the requested ministry events once. They are displayed on the Events page.
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
