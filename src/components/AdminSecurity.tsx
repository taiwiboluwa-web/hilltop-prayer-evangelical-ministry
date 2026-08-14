import { useEffect } from 'react'
import { supabase } from '../supabase'

const INACTIVITY_LIMIT = 5 * 60 * 1000

const eyeIcon = (open: boolean) => open
  ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="17" height="17" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>'
  : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="17" height="17" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6.1 0 9.5 6 9.5 6a16.6 16.6 0 0 1-3.1 3.8M6.1 6.8C3.8 8.4 2.5 12 2.5 12s3.4 6 9.5 6a9.8 9.8 0 0 0 3.1-.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>'

export function AdminSecurity() {
  useEffect(() => {
    let timer: ReturnType<typeof window.setTimeout> | null = null
    let mounted = true

    const signOutForInactivity = async () => {
      if (!mounted) return
      await supabase.auth.signOut()
      window.location.reload()
    }

    const resetTimer = () => {
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(signOutForInactivity, INACTIVITY_LIMIT)
    }

    const handleActivity = () => resetTimer()

    const setupPasswordReveal = () => {
      const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="password"]'))

      inputs.forEach((input) => {
        if (input.dataset.passwordRevealReady === 'true') return
        input.dataset.passwordRevealReady = 'true'

        const wrapper = document.createElement('div')
        wrapper.style.cssText = 'position:relative;width:100%;'
        input.parentElement?.insertBefore(wrapper, input)
        wrapper.appendChild(input)

        const button = document.createElement('button')
        button.type = 'button'
        button.setAttribute('aria-label', 'Show password')
        button.setAttribute('title', 'Show password')
        button.innerHTML = eyeIcon(false)
        button.style.cssText = [
          'position:absolute',
          'right:8px',
          'top:50%',
          'transform:translateY(-50%)',
          'width:34px',
          'height:34px',
          'display:flex',
          'align-items:center',
          'justify-content:center',
          'border:0',
          'border-radius:8px',
          'background:transparent',
          'color:#8d897f',
          'cursor:pointer',
          'padding:0',
          'z-index:2',
        ].join(';')

        const update = () => {
          const visible = input.type === 'text'
          button.innerHTML = eyeIcon(visible)
          button.setAttribute('aria-label', visible ? 'Hide password' : 'Show password')
          button.setAttribute('title', visible ? 'Hide password' : 'Show password')
          button.style.color = visible ? '#d5aa49' : '#8d897f'
        }

        const toggle = (event: MouseEvent) => {
          event.preventDefault()
          input.type = input.type === 'password' ? 'text' : 'password'
          update()
          input.focus()
        }

        button.addEventListener('click', toggle)
        wrapper.appendChild(button)
        update()
      })
    }

    const observer = new MutationObserver(setupPasswordReveal)
    observer.observe(document.body, { childList: true, subtree: true })
    setupPasswordReveal()

    // The admin portal is the site's authenticated area. A session expires
    // after five minutes without user activity, even if the page remains open.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) resetTimer()
    })

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'] as const
    activityEvents.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }))

    return () => {
      mounted = false
      observer.disconnect()
      if (timer) window.clearTimeout(timer)
      activityEvents.forEach((event) => window.removeEventListener(event, handleActivity))
    }
  }, [])

  return null
}
