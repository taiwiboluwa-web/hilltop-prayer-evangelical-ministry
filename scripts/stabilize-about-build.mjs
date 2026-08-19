import { readFileSync, writeFileSync } from 'node:fs'

const appPath = 'src/App.tsx'
let app = readFileSync(appPath, 'utf8')

const stableAnimatedText = `function AnimatedText({ children, style, className, tag = 'div' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string; tag?: keyof HTMLElementTagNameMap }) {
  const Component = tag as any
  return (
    <Component style={style} className={className}>
      {children}
    </Component>
  )
}
`

const animatedPattern = /function AnimatedText\(\{ children, style, className, tag = 'div' \}: \{ children: React\.ReactNode; style\?: React\.CSSProperties; className\?: string; tag\?: keyof HTMLElementTagNameMap \}\) \{[\s\S]*?\n\}\n\nfunction Hero/
if (animatedPattern.test(app)) {
  app = app.replace(animatedPattern, `${stableAnimatedText}\nfunction Hero`)
}

app = app.replaceAll('info@hilltopministry.org', 'Hilltopprayerministry@gmail.com')
writeFileSync(appPath, app)

const indexPath = 'index.html'
let html = readFileSync(indexPath, 'utf8')
const scriptStart = html.indexOf('    <script>\n      (() => {')
const scriptEnd = html.indexOf('    </script>\n  </body>', scriptStart)
if (scriptStart !== -1 && scriptEnd !== -1) {
  html = html.slice(0, scriptStart) + html.slice(scriptEnd + '    </script>\n'.length)
}
html = html.replaceAll('info@hilltopministry.org', 'Hilltopprayerministry@gmail.com')
writeFileSync(indexPath, html)

console.log('Hilltop About stability build patch applied')
