import { useEffect } from 'react'

type IconType = 'target' | 'sparkles' | 'mountain'

const ICONS: Record<string, IconType> = {
  '🎯': 'target',
  '✨': 'sparkles',
  '⛰️': 'mountain',
}

function iconSvg(type: IconType, size = 24) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '1.6')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')

  const paths: Record<IconType, string> = {
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.64 5.64l2.83 2.83M15.53 15.53l2.83 2.83M18.36 5.64l-2.83 2.83M8.47 15.53l-2.83 2.83"/><circle cx="12" cy="12" r="2.2"/>',
    mountain: '<path d="m3 18 6.5-9 3.2 4.2 2-2.7L21 18H3Z"/><path d="m13.7 12.8 1-1.3 1.3 1.7"/>',
  }

  svg.innerHTML = paths[type]
  return svg
}

function createIcon(type: IconType) {
  const holder = document.createElement('span')
  holder.setAttribute('aria-hidden', 'true')
  holder.style.display = 'inline-flex'
  holder.style.width = '30px'
  holder.style.height = '30px'
  holder.style.minWidth = '30px'
  holder.style.alignItems = 'center'
  holder.style.justifyContent = 'center'
  holder.style.verticalAlign = 'middle'
  holder.style.lineHeight = '1'
  holder.style.borderRadius = '50%'
  holder.style.background = 'rgba(17,17,22,0.9)'
  holder.style.border = '1px solid rgba(201,168,76,0.28)'
  holder.style.color = 'currentColor'
  holder.style.boxSizing = 'border-box'
  holder.appendChild(iconSvg(type, 17))
  return holder
}

function replaceEmojiText(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let node: Node | null

  while ((node = walker.nextNode())) {
    const text = node.textContent || ''
    if ([...Object.keys(ICONS)].some(icon => text.includes(icon))) nodes.push(node as Text)
  }

  nodes.forEach(textNode => {
    const text = textNode.textContent || ''
    const parts = text.split(/(🎯|✨|⛰️)/g)
    if (parts.length === 1) return

    const fragment = document.createDocumentFragment()
    parts.forEach(part => {
      const type = ICONS[part]
      if (type) {
        fragment.appendChild(createIcon(type))
      } else if (part) {
        fragment.appendChild(document.createTextNode(part))
      }
    })

    textNode.parentNode?.replaceChild(fragment, textNode)
  })
}

export function EmojiIconReplacer() {
  useEffect(() => {
    const run = () => replaceEmojiText(document.body)
    run()

    const observer = new MutationObserver(() => run())
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
