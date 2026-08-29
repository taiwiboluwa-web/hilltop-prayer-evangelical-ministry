import fs from 'node:fs'
import path from 'node:path'

const adminCss = path.resolve('src/admin.css')
let css = fs.readFileSync(adminCss, 'utf8')

// Keep the existing sidebar compatibility patch idempotent.
const compatibility = `
/* Sidebar width compatibility: support both arbitrary and standard Tailwind width classes. */
body:has(aside.w-16) aside,body:has(aside.w-16) aside[class*="w-16"]{width:68px!important;min-width:68px!important;flex-basis:68px!important}
body:has(aside.w-16) aside .p-3>span,body:has(aside.w-16) aside .p-3 button>span,body:has(aside.w-16) aside>div:last-child span{width:0!important;opacity:0!important;margin:0!important;padding:0!important}
body:has(aside.w-16) aside .p-3 button{justify-content:center!important;padding:6px!important;gap:0!important}
body:has(aside.w-16) aside .p-3 button>div{width:40px!important;min-width:40px!important}
body:has(aside.w-16) aside>div:last-child{padding:14px 8px!important}
body:has(aside.w-64) aside,body:has(aside.w-64) aside[class*="w-64"]{width:248px!important;min-width:248px!important;flex-basis:248px!important}
body:has(aside.w-64) aside .p-3>span,body:has(aside.w-64) aside .p-3 button>span,body:has(aside.w-64) aside>div:last-child span{width:auto!important;opacity:1!important}
body:has(aside.w-64) aside .p-3 button{justify-content:flex-start!important;padding:6px 10px!important;gap:11px!important}
`
if (!css.includes('Sidebar width compatibility: support both')) fs.writeFileSync(adminCss, css + compatibility)

const appFile = path.resolve('src/App.tsx')
let app = fs.readFileSync(appFile, 'utf8')

// Keep the public fallback aligned with the current three minister slots.
const open4 = /,\s*\{ id: 4, name: 'Open Slot', role: 'Associate Minister',[\s\S]*?img: IMGS\.worship \}/
const open5 = /,\s*\{ id: 5, name: 'Open Slot', role: 'Outreach Minister',[\s\S]*?img: IMGS\.community \}/
app = app.replace(open4, '').replace(open5, '')
fs.writeFileSync(appFile, app)

// AdminPortal is now maintained canonically by restore-admin-portal-source.mjs.
// Do NOT mutate its React state here. The old implementation inserted mImage2
// and mImage3 into an already-upgraded declaration on every build, which caused
// TypeScript TS2451 duplicate block-scoped-variable failures.
console.log('AdminPortal source left untouched; canonical restore step owns minister editor state.')
