import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/pages/AdminPortal.tsx')
const source = fs.readFileSync(file, 'utf8')

// AdminPortal now contains its own production-ready minister manager.
// The older build-time JSX replacement expected the previous dashboard markup
// and could corrupt/fail the build after the redesign.
if (source.includes('HILLTOP_ADMIN_DASHBOARD_V1')) {
  console.log('Modern Hilltop admin dashboard detected; skipping legacy minister JSX patch.')
  process.exit(0)
}

console.log('Legacy minister admin patch skipped; dashboard owns its minister UI.')
