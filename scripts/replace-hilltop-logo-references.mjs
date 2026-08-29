import fs from 'node:fs/promises'
import path from 'node:path'

const oldEncoded = ['Hilltop Prayer ', '(4.png'].join('').replace('(4.png', '(4).png')
const newEncoded = ['Hilltop Prayer ', '(10.png'].join('').replace('(10.png', '(10).png')
const oldDecoded = oldEncoded.replaceAll('%20', ' ')
const newDecoded = newEncoded.replaceAll('%20', ' ')
const oldGithub = `https://github.com/taiwiboluwa-web/hilltop-prayer-evangelical-ministry/blob/main/public/${oldEncoded}`
const newGithub = `https://github.com/taiwiboluwa-web/hilltop-prayer-evangelical-ministry/blob/main/public/${newEncoded}`
const oldSite = `https://hilltopministries.org/${oldEncoded}`
const newSite = `https://hilltopministries.org/${newEncoded}`

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
      const after = before
        .replaceAll(oldGithub, newGithub)
        .replaceAll(oldSite, newSite)
        .replaceAll(`/${oldEncoded}`, `/${newEncoded}`)
        .replaceAll(oldEncoded, newEncoded)
        .replaceAll(oldDecoded, newDecoded)
      if (after !== before) {
        await fs.writeFile(full, after, 'utf8')
        changed++
      }
    }
  }
}

await walk('.')
console.log(`Hilltop logo references normalized to ${newEncoded}; changed ${changed} text file(s)`)
