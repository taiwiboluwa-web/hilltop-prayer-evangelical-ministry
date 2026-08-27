import React, { useLayoutEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { createPortal } from 'react-dom'
import './index.css'
import './admin.css'
import './admin-login.css'
import App from './App'
import { Analytics } from './components/Analytics'
import { LocationDirections } from './components/LocationDirections'
import { AdminSecurity } from './components/AdminSecurity'
import { AdminPortal } from './pages/AdminPortal'
import { EmojiIconReplacer } from './components/EmojiIconReplacer'
import { GalleryMomentsEnhancer } from './components/GalleryMomentsEnhancer'
import { SeasonalTheme } from './components/SeasonalTheme'
import { ChristmasStoryLayer } from './components/ChristmasStoryLayer'

const PUBLIC_ROUTES: Record<string, string> = {
  '/': 'Home', '/Home': 'Home', '/About': 'About', '/Sermons': 'Sermons', '/Events': 'Events',
  '/Ministers': 'Ministers', '/Become%20a%20Member': 'Become a Member', '/Become%20a%20Member/': 'Become a Member', '/Give': 'Give',
}

function routeToPage(pathname: string) {
  const normalized = pathname.replace(/\/$/, '') || '/'
  return PUBLIC_ROUTES[normalized] || PUBLIC_ROUTES[decodeURI(normalized)] || 'Home'
}

function Site() {
  const [locationHost, setLocationHost] = useState<HTMLElement | null>(null)
  const [path, setPath] = useState(() => window.location.pathname)
  const normalizedPath = path.replace(/\/+$/, '') || '/'
  const isAdminRoute = /^(?:\/admin(?:\/.*)?|\/adminaccess|\/adminpanel|\/adminportal|\/admindashboard)$/i.test(normalizedPath)
  const publicPage = routeToPage(path)

  useLayoutEffect(() => { const onPopState = () => setPath(window.location.pathname); window.addEventListener('popstate', onPopState); return () => window.removeEventListener('popstate', onPopState) }, [])
  useLayoutEffect(() => { if (isAdminRoute) return; const timer = window.setTimeout(() => { const buttons = Array.from(document.querySelectorAll('button')); const target = buttons.find(button => button.textContent?.trim() === publicPage); if (target) target.click(); window.scrollTo({ top: 0, behavior: 'auto' }) }, 0); return () => window.clearTimeout(timer) }, [isAdminRoute, publicPage])
  useLayoutEffect(() => { if (isAdminRoute) return; const handleClick = (event: MouseEvent) => { const target = event.target as HTMLElement | null; const button = target?.closest('button'); const label = button?.textContent?.trim(); if (!label || !Object.values(PUBLIC_ROUTES).includes(label)) return; const route = label === 'Home' ? '/' : Object.entries(PUBLIC_ROUTES).find(([, page]) => page === label)?.[0]; if (route && window.location.pathname !== route) { window.history.pushState({}, '', route); setPath(route) } }; document.addEventListener('click', handleClick); return () => document.removeEventListener('click', handleClick) }, [isAdminRoute])
  useLayoutEffect(() => { if (isAdminRoute) { setLocationHost(null); return }; const footer = document.querySelector('footer'); if (!footer?.parentNode) return; const host = document.createElement('div'); host.id = 'location-host'; footer.parentNode.insertBefore(host, footer); setLocationHost(host); return () => { host.remove(); setLocationHost(null) } }, [isAdminRoute, path])
  const goHome = () => { window.history.pushState({}, '', '/'); setPath('/') }
  return <>
    <Analytics />
    <AdminSecurity />
    <SeasonalTheme admin={isAdminRoute} />
    <ChristmasStoryLayer admin={isAdminRoute} />
    {!isAdminRoute && <EmojiIconReplacer />}
    {isAdminRoute ? <><AdminPortal onBack={goHome} /><GalleryMomentsEnhancer /></> : <><App />{locationHost && createPortal(<LocationDirections />, locationHost)}{publicPage === 'Events' && <GalleryMomentsEnhancer publicEvents />}</>}
  </>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Site /></React.StrictMode>)
