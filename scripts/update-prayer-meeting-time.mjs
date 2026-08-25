import fs from 'node:fs'
const file = 'src/App.tsx'
let source = fs.readFileSync(file, 'utf8')
const oldValue = "const SCHEDULE = [{ day: '2nd and 3rd Saturdays', name: 'Prayer Meeting', time: '5:30 PM - 8:00 PM' }]"
const newValue = "const SCHEDULE = [{ day: '2nd and 3rd Saturdays', name: 'Prayer Meeting', time: '5:00 PM - 7:00 PM' }]"
if (source.includes(oldValue)) {
  source = source.replace(oldValue, newValue)
  fs.writeFileSync(file, source)
  console.log('Prayer meeting schedule updated to 5:00 PM - 7:00 PM')
} else if (source.includes(newValue)) {
  console.log('Prayer meeting schedule already up to date')
} else {
  console.warn('Prayer meeting schedule pattern not found')
}
