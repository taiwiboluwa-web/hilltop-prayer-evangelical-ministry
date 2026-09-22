import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'

type CountdownSettings = {
  id: number
  enabled: boolean
  saturday_service_enabled: boolean
  saturday_service_automatic: boolean
  saturday_service_override_target?: string | null
  saturday_service_title: string
  saturday_service_time_label: string
  saturday_service_venue: string
  christmas_enabled: boolean
  christmas_target_month: number
  christmas_target_day: number
  new_year_enabled: boolean
  new_year_target_month: number
  new_year_target_day: number
  christmas_label: string
  new_year_label: string
}

const fallback: CountdownSettings = {
  id: 1, enabled: true, saturday_service_enabled: true, saturday_service_automatic: true,
  saturday_service_override_target: null, saturday_service_title: 'Saturday Service',
  saturday_service_time_label: '5:00 PM - 7:00 PM',
  saturday_service_venue: '3 Kola Ojedeji Street, Ipaja, Lagos',
  christmas_enabled: true, christmas_target_month: 12, christmas_target_day: 25,
  new_year_enabled: true, new_year_target_month: 1, new_year_target_day: 1,
  christmas_label: 'Christmas', new_year_label: 'New Year'
}

function getNthSaturday(year:number, month:number, nth:number) {
  const first = new Date(year, month, 1, 17, 0, 0, 0)
  const offset = (6 - first.getDay() + 7) % 7
  return new Date(year, month, 1 + offset + (nth - 1) * 7, 17, 0, 0, 0)
}

function getAutomaticServiceDate(now = new Date()) {
  const second = getNthSaturday(now.getFullYear(), now.getMonth(), 2)
  const third = getNthSaturday(now.getFullYear(), now.getMonth(), 3)
  if (now < second) return second
  if (now < third) return third
  return getNthSaturday(now.getFullYear(), now.getMonth() + 1, 2)
}

function getConfiguredServiceDate(settings:CountdownSettings, now = new Date()) {
  if (!settings.saturday_service_automatic && settings.saturday_service_override_target) {
    const override = new Date(settings.saturday_service_override_target)
    if (!Number.isNaN(override.getTime()) && override > now) return override
  }
  return getAutomaticServiceDate(now)
}

function parts(ms:number) {
  const total = Math.floor(Math.max(0, ms) / 1000)
  return { days:Math.floor(total/86400), hours:Math.floor(total%86400/3600), minutes:Math.floor(total%3600/60), seconds:total%60 }
}

function CountdownCard({label,target}:{label:string;target:Date}) {
  const [now,setNow] = useState(Date.now())
  useEffect(() => { const id=window.setInterval(()=>setNow(Date.now()),1000); return()=>window.clearInterval(id) },[])
  const p=parts(target.getTime()-now)
  return <div className="site-countdown-card">
    <div className="site-countdown-label">{label}</div>
    <div className="site-countdown-values">
      <span><b>{String(p.days).padStart(2,'0')}</b><small>Days</small></span>
      <span><b>{String(p.hours).padStart(2,'0')}</b><small>Hours</small></span>
      <span><b>{String(p.minutes).padStart(2,'0')}</b><small>Min</small></span>
      <span><b>{String(p.seconds).padStart(2,'0')}</b><small>Sec</small></span>
    </div>
  </div>
}

export function SiteCountdowns({admin=false}:{admin?:boolean}) {
  const [settings,setSettings]=useState<CountdownSettings>(fallback)
  const [draft,setDraft]=useState<CountdownSettings>(fallback)
  const [open,setOpen]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState('')
  const [authenticated,setAuthenticated]=useState(false)

  useEffect(()=>{
    let mounted=true
    supabase.auth.getSession().then(({data})=>{ if(mounted) setAuthenticated(Boolean(data.session)) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session)=>{
      if(mounted) setAuthenticated(Boolean(session))
    })
    return ()=>{ mounted=false; listener.subscription.unsubscribe() }
  },[])

  const load=async()=>{
    try {
      const response=await fetch('/api/countdown-settings',{cache:'no-store'})
      if (!response.ok) return
      const data=await response.json()
      if (data) { setSettings(data); setDraft(data) }
    } catch {}
  }
  useEffect(()=>{load();const id=window.setInterval(load,30000);return()=>window.clearInterval(id)},[])

  const serviceTarget=useMemo(()=>getConfiguredServiceDate(settings),[settings])
  const seasonal=useMemo(()=>{
    const now=new Date()
    return {
      christmas:now.getMonth()===11&&settings.christmas_enabled,
      newYear:now.getMonth()===0&&now.getDate()<=7&&settings.new_year_enabled
    }
  },[settings])

  const save=async()=>{
    setSaving(true);setMessage('')
    try {
      const payload={...draft, saturday_service_override_target:draft.saturday_service_automatic?null:(draft.saturday_service_override_target||null)}
      let { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        const refreshed = await supabase.auth.refreshSession()
        session = refreshed.data.session
      }
      if (!session?.access_token) throw new Error('Your admin session has expired. Please sign in again.')
      const response=await fetch('/api/countdown-settings',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify(payload)})
      const data=await response.json()
      if(!response.ok) throw new Error(data.error||'Unable to publish countdown settings')
      setSettings(data);setDraft(data);setMessage('Published. The public countdown is now using these settings.')
    } catch(e:any) { setMessage(e.message||'Unable to publish countdown settings') }
    finally { setSaving(false) }
  }

  const clearOverride=()=>setDraft({...draft,saturday_service_automatic:true,saturday_service_override_target:null})

  if(admin) return <>{authenticated&&open&&<div className="countdown-admin-overlay">
    <div className="countdown-admin-panel">
      <button className="countdown-close" onClick={()=>setOpen(false)}>×</button>
      <div className="admin-kicker">Website Controls</div>
      <h2>Service Countdown</h2>
      <p>Automatic mode selects the next 2nd or 3rd Saturday. Manual override lets you control the next target whenever Hilltop has a special date or schedule change.</p>

      <label className="countdown-switch"><input type="checkbox" checked={draft.saturday_service_enabled} onChange={e=>setDraft({...draft,saturday_service_enabled:e.target.checked})}/><span/>Show Saturday Service countdown</label>
      <label className="countdown-switch"><input type="checkbox" checked={draft.saturday_service_automatic} onChange={e=>setDraft({...draft,saturday_service_automatic:e.target.checked})}/><span/>Automatic recurring schedule</label>

      <section>
        <h3>Next Service</h3>
        <div className="countdown-admin-status">{draft.saturday_service_automatic ? `AUTOMATIC · NEXT 2ND/3RD SATURDAY · ${getAutomaticServiceDate().toLocaleString('en-NG')}` : 'MANUAL OVERRIDE'}</div>
        <label>Override date & time
          <input className="countdown-admin-input" type="datetime-local" disabled={draft.saturday_service_automatic} value={draft.saturday_service_override_target?draft.saturday_service_override_target.slice(0,16):''} onChange={e=>setDraft({...draft,saturday_service_override_target:e.target.value?new Date(e.target.value).toISOString():null})}/>
        </label>
        <p className="admin-helper">An override controls the next countdown only. Once it expires, the public countdown automatically returns to the normal 2nd/3rd Saturday schedule.</p>
        <button className="admin-btn" type="button" onClick={clearOverride}>Return to automatic schedule</button>
      </section>

      <section>
        <h3>Public Service Details</h3>
        <label>Service title<input className="countdown-admin-input" value={draft.saturday_service_title} onChange={e=>setDraft({...draft,saturday_service_title:e.target.value})}/></label>
        <label>Service time<input className="countdown-admin-input" value={draft.saturday_service_time_label} onChange={e=>setDraft({...draft,saturday_service_time_label:e.target.value})}/></label>
        <label>Venue<input className="countdown-admin-input" value={draft.saturday_service_venue} onChange={e=>setDraft({...draft,saturday_service_venue:e.target.value})}/></label>
      </section>

      {message&&<div className="countdown-admin-message">{message}</div>}
      <div className="countdown-actions"><button className="admin-btn" onClick={()=>setOpen(false)}>Close</button><button className="admin-btn gold" onClick={save} disabled={saving}>{saving?'Publishing…':'Save & Publish'}</button></div>
    </div>
  </div>}
  {authenticated&&<button className="admin-countdown-launcher" onClick={()=>{setMessage('');setOpen(true)}}>Service Countdown</button>}
  <style>{`
    .admin-countdown-launcher{position:fixed;right:22px;top:104px;z-index:10001;height:40px;padding:0 15px;border:1px solid rgba(217,173,76,.4);background:#12130f;color:#f0cd73;font:700 10px Inter,sans-serif;letter-spacing:.1em;text-transform:uppercase;box-shadow:0 8px 30px rgba(0,0,0,.3)}
    .countdown-admin-overlay{position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.58);display:grid;place-items:center;padding:20px}
    .countdown-admin-panel{position:relative;width:min(560px,100%);max-height:90vh;overflow:auto;background:#0d0e0b;color:#eee9de;border:1px solid rgba(217,173,76,.28);padding:26px;box-shadow:0 30px 90px rgba(0,0,0,.5)}
    .countdown-admin-panel h2{font:500 28px Georgia,serif;margin:3px 0 8px}.countdown-admin-panel p{color:#85877c;font:11px Inter,sans-serif;line-height:1.6;margin:0 0 18px}
    .countdown-admin-panel section{border-top:1px solid rgba(255,255,255,.07);padding:18px 0}.countdown-admin-panel h3{font:500 16px Georgia,serif;margin:0 0 12px}
    .countdown-admin-panel label:not(.countdown-switch){display:block;color:#85877c;font:9px Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;margin-top:12px}
    .countdown-admin-input{display:block;width:100%;height:40px;margin-top:7px;background:#11120f;border:1px solid rgba(255,255,255,.1);color:#eee;padding:0 10px;outline:none}
    .countdown-admin-input:disabled{opacity:.4}.countdown-switch{display:flex;align-items:center;gap:10px;color:#d8d3c7;font:11px Inter,sans-serif;margin:10px 0}
    .countdown-switch input{position:absolute;opacity:0}.countdown-switch span{width:38px;height:21px;border-radius:20px;background:#34352e;position:relative}.countdown-switch span:after{content:'';position:absolute;width:17px;height:17px;border-radius:50%;left:2px;top:2px;background:#aaa;transition:.15s}.countdown-switch input:checked+span{background:#3d8d60}.countdown-switch input:checked+span:after{transform:translateX(17px);background:white}
    .countdown-close{position:absolute;right:12px;top:10px;background:none;border:0;color:#888;font-size:24px}.countdown-actions{display:flex;justify-content:flex-end;gap:8px;padding-top:18px}.countdown-admin-status{padding:12px;border:1px solid rgba(217,173,76,.18);background:#11120f;color:#d9ad4c;font:700 9px Inter,sans-serif;letter-spacing:.08em;line-height:1.5}.countdown-admin-message{padding:11px;margin-top:12px;border:1px solid rgba(69,196,131,.2);background:rgba(69,196,131,.05);color:#82cba3;font:10px Inter,sans-serif;line-height:1.5}
  `}</style></>

  return null

}
