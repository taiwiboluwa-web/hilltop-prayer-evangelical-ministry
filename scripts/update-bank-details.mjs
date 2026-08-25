import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
const source = await readFile(path, 'utf8')

const startMarker = 'Account Name</div>'
const endMarker = '3012 345 678'
const start = source.indexOf(startMarker)
const end = source.indexOf(endMarker, start)

if (start === -1 || end === -1) {
  throw new Error('Bank transfer details block not found in src/App.tsx')
}

const blockEnd = end + endMarker.length
const block = source.slice(start, blockEnd)
const updatedBlock = block
  .replace('Hilltop Prayer & Evangelical Ministry', 'HILLTOP PRAYER & EVANGELICAL MINISTRY')
  .replace('First Bank of Nigeria', 'ZENITH BANK')
  .replace('3012 345 678', '1229905996')

if (updatedBlock === block) {
  console.log('Bank details already up to date')
} else {
  const updated = source.slice(0, start) + updatedBlock + source.slice(blockEnd)
  await writeFile(path, updated, 'utf8')
  console.log('Hilltop bank transfer details updated')
}
