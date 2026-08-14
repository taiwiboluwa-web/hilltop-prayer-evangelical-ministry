import { useEffect } from 'react'

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined
const GOOGLE_VERIFICATION = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION as string | undefined
const BING_VERIFICATION = import.meta.env.VITE_BING_SITE_VERIFICATION as string | undefined

export function Analytics() {
  useEffect(() => {
    if (GOOGLE_VERIFICATION) {
      const meta = document.createElement('meta')
      meta.name = 'google-site-verification'
      meta.content = GOOGLE_VERIFICATION
      document.head.appendChild(meta)
    }

    if (BING_VERIFICATION) {
      const meta = document.createElement('meta')
      meta.name = 'msvalidate.01'
      meta.content = BING_VERIFICATION
      document.head.appendChild(meta)
    }

    if (!GA_ID || document.querySelector(`script[data-ga-id="${GA_ID}"]`)) return

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    script.dataset.gaId = GA_ID
    document.head.appendChild(script)

    const inline = document.createElement('script')
    inline.text = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_ID}', { anonymize_ip: true });`
    document.head.appendChild(inline)
  }, [])

  return null
}
