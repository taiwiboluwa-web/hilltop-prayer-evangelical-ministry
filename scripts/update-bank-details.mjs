import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
const source = await readFile(path, 'utf8')

const replacements = [
  ['3012 345 678', '1229905996'],
  ['First Bank of Nigeria', 'ZENITH BANK'],
]

let updated = source
for (const [from, to] of replacements) {
  updated = updated.split(from).join(to)
}

// The build runs this script more than once in some Vercel build configurations.
// If the new values are already present, the script must be a successful no-op.
if (updated === source) {
  console.log('Hilltop bank transfer details already up to date')
} else {
  await writeFile(path, updated, 'utf8')
  console.log('Hilltop bank transfer details updated')
}
