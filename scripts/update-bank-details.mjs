import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
const source = await readFile(path, 'utf8')

const replacements = [
  ['Hilltop Prayer & Evangelical Ministry', 'HILLTOP PRAYER & EVANGELICAL MINISTRY'],
  ['First Bank of Nigeria', 'ZENITH BANK'],
  ['3012 345 678', '1229905996'],
]

let updated = source
for (const [from, to] of replacements) {
  updated = updated.split(from).join(to)
}

if (updated === source) {
  console.log('Bank details already up to date')
} else {
  await writeFile(path, updated, 'utf8')
  console.log('Hilltop bank transfer details updated')
}
