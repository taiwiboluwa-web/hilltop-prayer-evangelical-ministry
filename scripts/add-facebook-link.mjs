import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/App.tsx')
let source = fs.readFileSync(file, 'utf8')
if (source.includes('HILLTOP_FACEBOOK_LINK_V1')) process.exit(0)

const facebookUrl = 'https://www.facebook.com/share/1BpqDUNJut/'
const instagramUrl = 'https://www.instagram.com/hilltopprayerministry/'
const tiktokUrl = 'https://www.tiktok.com/@hilltopprayerministry'
const youtubeUrl = 'https://www.youtube.com/@hilltopprayerministry'

source = source.replace(/(\{\s*name:\s*'Instagram',\s*href:\s*)'#'/i, `$1'${instagramUrl}'`)
source = source.replace(/(\{\s*name:\s*'TikTok',\s*href:\s*)'#'/i, `$1'${tiktokUrl}'`)
source = source.replace(/(<a\b[^>]*(?:aria-label|title)=(['"])TikTok\2[^>]*href=)(['"])(?:#|javascript:void\(0\)|)(\3)/i, `$1"${tiktokUrl}"$4`)
source = source.replace(/(\{\s*name:\s*'YouTube',\s*href:\s*)'#'/i, `$1'${youtubeUrl}'`)
source = source.replace(/(<a\b[^>]*(?:aria-label|title)=(['"])YouTube\2[^>]*href=)(['"])(?:#|javascript:void\(0\)|)(\3)/i, `$1"${youtubeUrl}"$4`)

const footerMatch = source.match(/<footer[\s\S]*?<\/footer>/i)
if (footerMatch) {
  const footer = footerMatch[0]
  const updatedFooter = footer.replace(/href=(['"])#\1/, `href="${facebookUrl}"`)
  if (updatedFooter !== footer) source = source.replace(footer, updatedFooter)
}

source = source.replace(
  /(<a\b[^>]*(?:aria-label|title)=(['"])Facebook\2[^>]*href=)(['"])(?:#|javascript:void\(0\)|)(\3)/i,
  `$1"${facebookUrl}"$4`
)

const marker = `\n  useEffect(() => {\n    const onFacebookClick = (event: MouseEvent) => {\n      const target = event.target as Element | null\n      const link = target?.closest?.('[aria-label*="facebook" i], [title*="facebook" i], [data-social="facebook"]') as HTMLAnchorElement | null\n      if (!link) return\n      if (!link.href || link.getAttribute('href') === '#' || link.getAttribute('href') === 'javascript:void(0)') {\n        event.preventDefault()\n        window.location.assign('${facebookUrl}')\n      }\n    }\n    document.addEventListener('click', onFacebookClick)\n    return () => document.removeEventListener('click', onFacebookClick)\n  }, [])\n`

const appFunction = source.indexOf('function App(')
if (appFunction >= 0 && !source.includes('HILLTOP_FACEBOOK_LINK_V1')) {
  const bodyStart = source.indexOf('{', appFunction)
  if (bodyStart >= 0) source = source.slice(0, bodyStart + 1) + marker + source.slice(bodyStart + 1)
}

source = source.replace(/(\/\*\s*)HILLTOP_FACEBOOK_LINK_V1(\s*\*\/)/g, '$1HILLTOP_FACEBOOK_LINK_V1$2')
if (!source.includes('HILLTOP_FACEBOOK_LINK_V1')) source += '\n/* HILLTOP_FACEBOOK_LINK_V1 */\n'

fs.writeFileSync(file, source)
console.log('Social links connected')
