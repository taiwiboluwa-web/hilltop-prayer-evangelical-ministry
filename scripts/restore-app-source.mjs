import fs from 'node:fs/promises'

const url = 'https://raw.githubusercontent.com/taiwiboluwa-web/hilltop-prayer-evangelical-ministry/fd0290cc0300db614054346dc0fe3aaea519de6e/src/App.tsx'
const response = await fetch(url)
if (!response.ok) throw new Error(`Unable to restore canonical App.tsx: ${response.status}`)
const source = await response.text()
if (!source.includes('function MinistersSection()') || !source.includes('export function App')) {
  throw new Error('Canonical App.tsx validation failed')
}
await fs.writeFile('src/App.tsx', source, 'utf8')
console.log('Canonical App.tsx restored before build patches')
