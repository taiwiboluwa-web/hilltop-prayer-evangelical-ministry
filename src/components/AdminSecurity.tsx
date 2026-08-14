import { useEffect } from 'react'
import { supabase } from '../supabase'

const INACTIVITY_LIMIT = 5 * 60 * 1000

export function AdminSecurity() {
  useEffect(() => {
    let timer: ReturnType<typeof window.setTimeout> | null = null
    let revealCleanup: (() => void) | null = null
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
      if (!inputs.length) return

      const cleanups: Array<() => void> = []

      inputs.forEach((input) => {
        if (input.dataset.passwordRevealReady === 'true') return
        input.dataset.passwordRevealReady = 'true'

        const wrapper = input.parentElement
        if (!wrapper) return

        wrapper.style.position = wrapper.style.position || 'relative'

        const button = document.createElement('button')
        button.type = 'button'
        button.setAttribute('aria-label', 'Show password')
        button.setAttribute('title', 'Show password')
        button.textContent = '◉'
        button.style.cssText = [
          'position:absolute',
          'right:10px',
          'top:50%',
          'transform:translateY(-50%)',
          'width:32px',
          'height:32px',
          'display:flex',
          'align-items:center',
          'justify-content:center',
          'border:0',
          'background:transparent',
          'color:#8d897f',
          'cursor:pointer',
          'font-size:13px',
          'padding:0',
          'z-index:2',
        ].join(';')

        const update = () => {
          const visible = input.type === 'text'
          button.textContent = visible ? '◉' : '◌'
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

        cleanups.push(() => {
          button.removeEventListener('click', toggle)
          button.remove()
          delete input.dataset.passwordRevealReady
        })
      })

      revealCleanup = () => {
        cleanups.forEach((cleanup) => cleanup())
        revealCleanup = null
      }
    }

    const observer = new MutationObserver(() => setupPasswordReveal())
    observer.observe(document.body, { childList: true, subtree: true })
    setupPasswordReveal()

    // Admin authentication is the only authenticated area of this site.
    // Reset the five-minute inactivity window on normal user interaction.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) resetTimer()
    })

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'] as const
    activityEvents.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }))

    return () => {
      mounted = false
      observer.disconnect()
      revealCleanup?.()
      if (timer) window.clearTimeout(timer)
      activityEvents.forEach((event) => window.removeEventListener(event, handleActivity))
    }
  }, [])

  return null
}
