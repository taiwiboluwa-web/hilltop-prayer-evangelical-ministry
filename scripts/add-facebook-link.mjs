import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/App.tsx')
let source = fs.readFileSync(file, 'utf8')
if (source.includes('HILLTOP_FACEBOOK_LINK_V1')) process.exit(0)

const facebookUrl = 'https://www.facebook.com/share/1BpqDUNJut/'

// Prefer the existing Facebook/social placeholder in the footer. If it uses a
// placeholder href, make the first footer placeholder point to the supplied page.
const footerMatch = source.match(/<footer[\s\S]*?<\/footer>/i)
if (footerMatch) {
  const footer = footerMatch[0]
  const updatedFooter = footer.replace(/href=(['"])#\1/, `href="${facebookUrl}"`)
  if (updatedFooter !== footer) {
    source = source.replace(footer, updatedFooter)
  }
}

// Also support a Facebook anchor that is labelled rather than using #.
source = source.replace(
  /(<a\b[^>]*(?:aria-label|title)=(['"])Facebook\2[^>]*href=)(['"])(?:#|javascript:void\(0\)|)(\3)/i,
  `$1"${facebookUrl}"$4`
)

// Add a reliable click delegation for an existing Facebook icon if the icon is
// rendered without a usable href but has an accessible Facebook label.
const marker = `\n  useEffect(() => {\n    const onFacebookClick = (event: MouseEvent) => {\n      const target = event.target as Element | null\n      const link = target?.closest?.('[aria-label*="facebook" i], [title*="facebook" i], [data-social="facebook"]') as HTMLAnchorElement | null\n      if (!link) return\n      if (!link.href || link.getAttribute('href') === '#' || link.getAttribute('href') === 'javascript:void(0)') {\n        event.preventDefault()\n        window.location.assign('${facebookUrl}')\n      }\n    }\n    document.addEventListener('click', onFacebookClick)\n    return () => document.removeEventListener('click', onFacebookClick)\n  }, [])\n`

const appFunction = source.indexOf('function App(')
if (appFunction >= 0 && !source.includes('HILLTOP_FACEBOOK_LINK_V1')) {
  const bodyStart = source.indexOf('{', appFunction)
  if (bodyStart >= 0) source = source.slice(0, bodyStart + 1) + marker + source.slice(bodyStart + 1)
}

source = source.replace(/(\/\*\s*)HILLTOP_FACEBOOK_LINK_V1(\s*\*\/)/g, '$1HILLTOP_FACEBOOK_LINK_V1$2')
if (!source.includes('HILLTOP_FACEBOOK_LINK_V1')) source += '\n/* HILLTOP_FACEBOOK_LINK_V1 */\n'

fs.writeFileSync(file, source)
console.log('Facebook link connected to supplied ministry page')
