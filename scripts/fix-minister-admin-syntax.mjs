import fs from 'node:fs'

// The minister admin source is now maintained as valid TypeScript directly.
// Keep this build step as a harmless compatibility check rather than mutating
// source code during every Vercel build.
const file = 'src/pages/AdminMinisterManager.tsx'
if (!fs.existsSync(file)) process.exit(0)
console.log('Minister admin source syntax is maintained directly; no patch required')
