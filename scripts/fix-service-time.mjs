import { readFileSync, writeFileSync } from 'node:fs'

const path = 'src/App.tsx'
const source = readFileSync(path, 'utf8')

const updated = source
  .replace("const date = new Date(y, m, 1, 9, 0, 0)", "const date = new Date(y, m, 1, 17, 30, 0)")
  .replace("9:00 AM, 3 Kola Ojedeji Street, Ipaja, Lagos", "5:30 PM, 3 Kola Ojedeji Street, Ipaja, Lagos")

if (updated !== source) {
  writeFileSync(path, updated)
}
