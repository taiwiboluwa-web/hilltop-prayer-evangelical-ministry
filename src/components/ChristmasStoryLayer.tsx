import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ChristmasStoryAnimations } from './ChristmasStoryAnimations'

export function ChristmasStoryLayer({ admin = false }: { admin?: boolean }) {
  const [enabled, setEnabled] = useState(true)
  const [season, setSeason] = useState('default')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('site_theme_settings').select('enabled, mode, christmas_animations_enabled').eq('id', 1).maybeSingle()
    if (!data) return
    setEnabled(data.christmas_animations_enabled !== false)
    if (!data.enabled || data.mode === 'default') setSeason('default')
    else if (data.mode === 'christmas') setSeason('christmas')
    else if (data.mode === 'new_year') setSeason('new_year')
    else {
      const now = new Date()
      const month = now.getMonth() + 1
      const day = now.getDate()
      setSeason(month === 12 ? 'christmas' : month === 1 && day <= 7 ? 'new_year' : 'default')
    }
  }

  useEffect(() => {
    load()
    const id = window.setInterval(load, 60000)
    return () => window.clearInterval(id)
  }, [])

  const toggle = async () => {
    setSaving(true)
    const next = !enabled
    const { error } = await supabase.from('site_theme_settings').update({ christmas_animations_enabled: next }).eq('id', 1)
    if (!error) setEnabled(next)
    else window.alert(`Could not update Christmas animations: ${error.message}`)
    setSaving(false)
  }

  return <>
    {!admin && season === 'christmas' && enabled && <ChristmasStoryAnimations />}
    {admin && <div className="christmas-animation-admin" style={{position:'fixed',right:22,bottom:86,zIndex:10001,width:'min(390px,calc(100vw - 32px))',background:'#fff',color:'#173f28',border:'1px solid rgba(183,35,45,.22)',boxShadow:'0 14px 45px rgba(0,0,0,.16)',padding:'14px 16px',borderRadius:14,fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{fontWeight:800,fontSize:13}}>Christmas Story Animations</div>
      <div style={{fontSize:10,lineHeight:1.45,opacity:.72,margin:'4px 0 10px'}}>Show the animated Nativity story across the public website during the Christmas season.</div>
      <button onClick={toggle} disabled={saving} style={{border:0,borderRadius:9,padding:'9px 12px',background:enabled?'#17633a':'#9f2633',color:'#fff',fontWeight:700,fontSize:10,cursor:'pointer'}}>{saving ? 'Saving…' : enabled ? 'ON — Turn animations OFF' : 'OFF — Turn animations ON'}</button>
    </div>}
  </>
}
