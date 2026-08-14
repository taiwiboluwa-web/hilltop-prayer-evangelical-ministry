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

function Site() {
  const [locationHost, setLocationHost] = useState<HTMLElement | null>(null)
  const [path, setPath] = useState(() => window.location.pathname)

  useLayoutEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const isAdminRoute = path === '/admin' || path === '/admin/login' || path.startsWith('/admin/')

  useLayoutEffect(() => {
    if (isAdminRoute) {
      setLocationHost(null)
      return
    }

    const footer = document.querySelector('footer')
    if (!footer?.parentNode) return

    const host = document.createElement('div')
    host.id = 'location-host'
    footer.parentNode.insertBefore(host, footer)
    setLocationHost(host)

    return () => {
      host.remove()
      setLocationHost(null)
    }
  }, [isAdminRoute, path])

  const goHome = () => {
    window.history.pushState({}, '', '/')
    setPath('/')
  }

  return (
    <>
      <Analytics />
      <AdminSecurity />
      {isAdminRoute ? (
        <AdminPortal onBack={goHome} />
      ) : (
        <>
          <App />
          {locationHost && createPortal(<LocationDirections />, locationHost)}
        </>
      )}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Site />
  </React.StrictMode>,
)
