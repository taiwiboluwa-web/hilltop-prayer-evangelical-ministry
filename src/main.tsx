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

function Site() {
  const [locationHost, setLocationHost] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer?.parentNode) return

    const host = document.createElement('div')
    host.id = 'location-host'
    footer.parentNode.insertBefore(host, footer)
    setLocationHost(host)

    return () => {
      host.remove()
    }
  }, [])

  return (
    <>
      <Analytics />
      <AdminSecurity />
      <App />
      {locationHost && createPortal(<LocationDirections />, locationHost)}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Site />
  </React.StrictMode>,
)
