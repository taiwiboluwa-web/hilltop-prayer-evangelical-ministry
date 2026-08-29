import fs from 'node:fs/promises'
import path from 'node:path'

// Canonical Hilltop logo: public/Hilltop Prayer (11).png
const replacements = [
  { encoded: 'Hilltop%20Prayer%20(3).png', decoded: 'Hilltop Prayer (3).png' },
  { encoded: 'Hilltop%20Prayer%20(4).png', decoded: 'Hilltop Prayer (4).png' },
  { encoded: 'Hilltop%20Prayer%20(10).png', decoded: 'Hilltop Prayer (10).png' },
  { encoded: 'Hilltop Prayer (3).png', decoded: 'Hilltop Prayer (3).png' },
  { encoded: 'Hilltop Prayer (4).png', decoded: 'Hilltop Prayer (4).png' },
  { encoded: 'Hilltop Prayer (10).png', decoded: 'Hilltop Prayer (10).png' },
]

const canonicalEncoded = 'Hilltop%20Prayer%20(11).png'
const canonicalDecoded = 'Hilltop Prayer (11).png'
const githubBase = 'https://github.com/taiwiboluwa-web/hilltop-prayer-evangelical-ministry/blob/main/public/'
const siteBase = 'https://hilltopministries.org/'

const textExtensions = new Set(['.ts','.tsx','.js','.mjs','.jsx','.css','.html','.json','.md','.txt','.svg','.xml'])
const skip = new Set(['node_modules','.git','dist'])
let changed = 0

async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(full)
    else if (textExtensions.has(path.extname(entry.name).toLowerCase())) {
      const before = await fs.readFile(full, 'utf8')
      let after = before

      for (const { encoded, decoded } of replacements) {
        const oldGithub = `${githubBase}${encoded}`
        const newGithub = `${githubBase}${canonicalEncoded}`
        const oldSite = `${siteBase}${encoded}`
        const newSite = `${siteBase}${canonicalEncoded}`

        after = after
          .replaceAll(oldGithub, newGithub)
          .replaceAll(oldSite, newSite)
          .replaceAll(`/${encoded}`, `/${canonicalEncoded}`)
          .replaceAll(encoded, canonicalEncoded)
          .replaceAll(decoded, canonicalDecoded)
      }

      if (after !== before) {
        await fs.writeFile(full, after, 'utf8')
        changed++
      }
    }
  }
}

await walk('.')
console.log(`Hilltop logo references normalized to ${canonicalDecoded}; changed ${changed} text file(s)`)
