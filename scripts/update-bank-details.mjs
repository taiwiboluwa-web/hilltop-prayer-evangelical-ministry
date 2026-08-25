import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
const source = await readFile(path, 'utf8')

const replacements = [
  ['Hilltop Prayer & Evangelical Ministry', 'HILLTOP PRAYER & EVANGELICAL MINISTRY'],
  ['3012 345 678', '1229905996'],
  ['First Bank of Nigeria', 'ZENITH BANK'],
]

let updated = source
for (const [from, to] of replacements) {
  updated = updated.split(from).join(to)
}

// Vercel can invoke the build command more than once. If the first build
// already applied these values, every later run must be a successful no-op.
if (updated === source) {
  console.log('Hilltop bank transfer details already up to date')
} else {
  await writeFile(path, updated, 'utf8')
  console.log('Hilltop bank transfer details updated')
}
