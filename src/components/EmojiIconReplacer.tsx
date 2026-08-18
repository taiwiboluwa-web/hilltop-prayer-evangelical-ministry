import { useEffect } from 'react'

const ICONS: Record<string, 'target' | 'sparkles'> = {
  '🎯': 'target',
  '✨': 'sparkles',
}

function Icon({ type }: { type: 'target' | 'sparkles' }) {
  if (type === 'target') {
    return (
      <span aria-hidden="true" style={{ display: 'inline-flex', width: 24, height: 24, alignItems: 'center', justifyContent: 'center', color: 'currentColor' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </span>
    )
  }

  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', width: 24, height: 24, alignItems: 'center', justifyContent: 'center', color: 'currentColor' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    </span>
  )
}

function replaceEmojiText(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let node: Node | null

  while ((node = walker.nextNode())) {
    const text = node.textContent || ''
    if ([...ICONS.keys()].some(icon => text.includes(icon))) nodes.push(node as Text)
  }

  nodes.forEach(textNode => {
    const text = textNode.textContent || ''
    const parts = text.split(/(🎯|✨)/g)
    if (parts.length === 1) return

    const fragment = document.createDocumentFragment()
    parts.forEach(part => {
      if (ICONS[part]) {
        const holder = document.createElement('span')
        holder.style.display = 'inline-flex'
        holder.style.verticalAlign = 'middle'
        holder.style.lineHeight = '1'
        holder.appendChild(part === '🎯' ? createTargetIcon() : createSparkleIcon())
        fragment.appendChild(holder)
      } else if (part) {
        fragment.appendChild(document.createTextNode(part))
      }
    })

    textNode.parentNode?.replaceChild(fragment, textNode)
  })
}

function createTargetIcon() {
  const span = document.createElement('span')
  span.setAttribute('aria-hidden', 'true')
  span.style.display = 'inline-flex'
  span.style.width = '24px'
  span.style.height = '24px'
  span.style.alignItems = 'center'
  span.style.justifyContent = 'center'
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '24')
  svg.setAttribute('height', '24')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '1.7')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.innerHTML = '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>'
  span.appendChild(svg)
  return span
}

function createSparkleIcon() {
  const span = document.createElement('span')
  span.setAttribute('aria-hidden', 'true')
  span.style.display = 'inline-flex'
  span.style.width = '24px'
  span.style.height = '24px'
  span.style.alignItems = 'center'
  span.style.justifyContent = 'center'
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '24')
  svg.setAttribute('height', '24')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '1.7')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.innerHTML = '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="2.5"/>'
  span.appendChild(svg)
  return span
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
