import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
let source = await readFile(path, 'utf8')
const importLine = "import { ProfessionalCounseling } from './components/ProfessionalCounseling'"
const marker = '<Hero setActivePage={setActivePage} />'

if (!source.includes(importLine)) {
  source = source.replace("import { Navbar, Logo } from './components/Navbar'", "import { Navbar, Logo } from './components/Navbar'\n" + importLine)
}

if (!source.includes('<ProfessionalCounseling />')) {
  const index = source.indexOf(marker)
  if (index === -1) throw new Error('Home Hero marker not found in src/App.tsx')
  const insertionPoint = index + marker.length
  source = source.slice(0, insertionPoint) + '\n      <ProfessionalCounseling />' + source.slice(insertionPoint)
  await writeFile(path, source, 'utf8')
  console.log('Professional counseling section added to Home')
} else {
  console.log('Professional counseling section already present')
}
