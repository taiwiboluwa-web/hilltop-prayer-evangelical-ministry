import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
const source = await readFile(path, 'utf8')

const replacements = [
  ['Hilltop Prayer & Evangelical Ministry', 'HILLTOP PRAYER & EVANGELICAL MINISTRY'],
  ['HILLTOP PRAYER & EVANGELICAL MINISTRY', 'HILLTOP PRAYER & EVANGELICAL MINISTRY'],
  ['3012 345 678', '1229905996'],
  ['5074529651', '1229905996'],
  ['First Bank of Nigeria', 'ZENITH BANK'],
]

let updated = source
for (const [from, to] of replacements) updated = updated.split(from).join(to)

// Ensure the payment details shown on the public site use the current
// ministry account information supplied by the ministry.
updated = updated.replace(/Account\s*(?:No\.?|Number)\s*[:\-]?\s*(?:1229905996|5074529651|3012\s*345\s*678)/gi, 'Account No.: 1229905996')

if (updated === source) {
  console.log('Hilltop bank transfer details already up to date')
} else {
  await writeFile(path, updated, 'utf8')
  console.log('Hilltop bank transfer details updated')
}
