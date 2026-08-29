import fs from 'node:fs'
import path from 'node:path'

const appPath = path.resolve('src/App.tsx')
if (!fs.existsSync(appPath)) process.exit(0)

let source = fs.readFileSync(appPath, 'utf8')
const replacements = [
  ['w=1920&h=1080&fit=crop&auto=format', 'w=1280&h=720&fit=crop&auto=format&q=75'],
  ['w=1600&h=900&fit=crop&auto=format', 'w=960&h=540&fit=crop&auto=format&q=75'],
  ['w=1200&h=700&fit=crop&auto=format', 'w=900&h=525&fit=crop&auto=format&q=75'],
  ['w=800&h=800&fit=crop&auto=format', 'w=640&h=640&fit=crop&auto=format&q=75'],
]

for (const [from, to] of replacements) source = source.split(from).join(to)
fs.writeFileSync(appPath, source)
