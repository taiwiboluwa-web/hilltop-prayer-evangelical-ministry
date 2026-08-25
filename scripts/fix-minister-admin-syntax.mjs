import fs from 'node:fs'

const file = 'src/pages/AdminMinisterManager.tsx'
if (!fs.existsSync(file)) process.exit(0)

let source = fs.readFileSync(file, 'utf8')

// Some earlier build patches have left the updater with one missing closing
// parenthesis. Repair the exact malformed form before TypeScript runs.
source = source.replace(
  /const update=\(k:string,v:any\)=>setForm\(\(x:any\)=>\(\{\.\.\.x,\[k\]:v\}\)\s*\n/,
  'const update=(k:string,v:any)=>setForm((x:any)=>({...x,[k]:v}))\n'
)

// Defensive fallback for the same expression when formatting differs.
source = source.replace(
  'const update=(k:string,v:any)=>setForm((x:any)=>({...x,[k]:v})',
  'const update=(k:string,v:any)=>setForm((x:any)=>({...x,[k]:v}))'
)

fs.writeFileSync(file, source)
console.log('Minister admin TypeScript syntax normalized')
