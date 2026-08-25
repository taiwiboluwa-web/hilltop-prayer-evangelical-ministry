import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
let source = await readFile(path, 'utf8')

source = source.replace(
  /const SCHEDULE = \[\{ day: '[^']*', name: '[^']*', time: '[^']*' \}\]/,
  "const SCHEDULE = [{ day: 'Saturday, 12 September 2026', name: 'Saturday Service', time: '5:00 PM - 7:00 PM', venue: '3 Kola Ojedeji Street, Ipaja, Lagos' }]"
)

const oldCountdown = "function getNextServiceDate(now:Date=new Date()):Date{const y=now.getFullYear(),m=now.getMonth();const nth=(yy:number,mm:number,n:number)=>{let c=0;const d=new Date(yy,mm,1,17,30);while(d.getMonth()===mm){if(d.getDay()===6&&++c===n)return new Date(d);d.setDate(d.getDate()+1)}return d};const a=nth(y,m,2),b=nth(y,m,3);return now<a?a:now<b?b:nth(y,m+1,2)}"
const newCountdown = "function getNextServiceDate(now:Date=new Date()):Date{const target=new Date(2026,8,12,17,0,0,0);return target}"
source = source.replace(oldCountdown, newCountdown)

await writeFile(path, source, 'utf8')
console.log('Saturday Service date, time, venue and countdown updated')
