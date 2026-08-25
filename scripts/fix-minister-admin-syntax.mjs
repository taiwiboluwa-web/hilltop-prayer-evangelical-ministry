import fs from 'node:fs'

const file = 'src/pages/AdminMinisterManager.tsx'
if (!fs.existsSync(file)) process.exit(0)

const source = fs.readFileSync(file, 'utf8')
const broken = "const update=(k:string,v:any)=>setForm((x:any)=>({...x,[k]:v})"
const fixed = "const update=(k:string,v:any)=>setForm((x:any)=>({...x,[k]:v}))"

if (source.includes(broken)) {
  fs.writeFileSync(file, source.replace(broken, fixed))
  console.log('Minister admin TypeScript syntax fixed')
} else {
  console.log('Minister admin syntax already correct')
}
