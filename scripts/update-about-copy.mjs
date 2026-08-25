import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/App.tsx')
let source = fs.readFileSync(file, 'utf8')

const oldCopy = `Hilltop Prayer & Evangelical Ministry is a vibrant spiritual home based in Ipaja, Lagos. We are dedicated to raising believers who anchor their lives in prayer, stand firm in faith, and impact their communities with Christ love.`
const newCopy = `Hilltop Prayer & Evangelical Ministry is a vibrant spiritual home based in Ipaja, Lagos. We are dedicated to raising believers who anchor their lives in prayer, stand firm in faith, and impact their communities with Christ's love.`
if (source.includes(oldCopy)) source = source.replace(oldCopy, newCopy)

// About section: Saturday Service — Saturday, 12 September 2026 at 5:00 PM.
source = source.replace(/time:\s*'5:30 PM - 8:00 PM'/g, "time: '5:00 PM - 7:00 PM'")
source = source.replace(/time:\s*'5:00 PM - 7:00 PM'/g, "time: '5:00 PM - 7:00 PM'")

// Replace the old recurring prayer-meeting countdown with the requested
// Saturday Service countdown. This targets 12 September 2026 at 5:00 PM.
source = source.replace(/function getNextServiceDate\(now:Date=new Date\(\)\):Date\{[^}]*\{[^}]*\}[^}]*\}/, `function getNextServiceDate(now:Date=new Date()):Date{const target=new Date(2026,8,12,17,0,0);return target}`)

// Keep a recognizable event label/date/address available to the About section
// when older copies of the card are present.
source = source.replace(/Saturday Service/g, 'Saturday Service')
source = source.replace(/Saturday, 12 September 2026/g, 'Saturday, 12 September 2026')
source = source.replace(/5:00 PM, 3 Kola Ojedeji Street, Ipaja, Lagos/g, '5:00 PM, 3 Kola Ojedeji Street, Ipaja, Lagos')

const anchor = `          </AnimatedText>\n        </div>\n\n        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'`
const addition = `          </AnimatedText>\n          <div style={{ maxWidth: 820, margin: '24px auto 0', padding: '24px 28px', borderLeft: '2px solid var(--gold)', background: 'rgba(201,168,76,0.05)', borderRadius: '0 14px 14px 0', textAlign: 'left' }}>\n            <p style={{ fontFamily: 'Outfit', color: 'var(--muted)', fontSize: '0.98rem', lineHeight: 1.8, margin: 0 }}>\n              Hilltop Prayer and Evangelical Ministry, a.k.a. Hilltop Christian Center, is a non-denominational prayer and evangelical organization aimed at making humanity experience God's divine power on earth through fervent prayers and intensive Bible study.\n            </p>\n            <p style={{ fontFamily: 'Instrument Serif', color: 'var(--gold-light)', fontSize: '1.35rem', fontStyle: 'italic', lineHeight: 1.5, margin: '16px 0 0' }}>\n              “The greatest tragedy is not unanswered prayers, but unoffered prayers!”\n            </p>\n          </div>\n        </div>\n\n        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'`
if (!source.includes('Hilltop Christian Center') && source.includes(anchor)) source = source.replace(anchor, addition)

fs.writeFileSync(file, source)
console.log('Hilltop About Saturday Service and countdown updated')
