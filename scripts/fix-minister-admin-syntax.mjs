import fs from 'node:fs'

const file = 'src/pages/AdminMinisterManager.tsx'
if (!fs.existsSync(file)) process.exit(0)

let source = fs.readFileSync(file, 'utf8')

// This file has historically been rewritten by other build patches. Always
// normalize the updater expression immediately before TypeScript runs.
source = source.replace(
  /const update=\(k:string,v:any\)=>setForm\(\(x:any\)=>\(\{\.\.\.x,\[k\]:v\}\)\)?/,
  "const update=(k:string,v:any)=>setForm((x:any)=>({...x,[k]:v}))"
)

// Also repair the exact malformed form if a previous patch omitted the final ')'.
source = source.replace(
  "const update=(k:string,v:any)=>setForm((x:any)=>({...x,[k]:v})",
  "const update=(k:string,v:any)=>setForm((x:any)=>({...x,[k]:v}))"
)

fs.writeFileSync(file, source)
console.log('Minister admin TypeScript syntax normalized')
