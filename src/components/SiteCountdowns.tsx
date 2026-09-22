import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type CountdownSettings = {
  id: number
  enabled: boolean
  saturday_service_enabled: boolean
  saturday_service_target: string
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
  id: 1, enabled: true, saturday_service_enabled: true,
  saturday_service_target: '', saturday_service_automatic: true,
  saturday_service_override_target: null,
  saturday_service_title: 'Saturday Service',
  saturday_service_time_label: '5:00 PM - 7:00 PM',
  saturday_service_venue: '3 Kola Ojedeji Street, Ipaja, Lagos',
  christmas_enabled: true, christmas_target_month: 12, christmas_target_day: 25,
  new_year_enabled: true, new_year_target_month: 1, new_year_target_day: 1,
  christmas_label: 'Christmas', new_year_label: 'New Year'
}

function nthSaturdayLagos(year:number, month:number, nth:number) {
  const first = new Date(Date.UTC(year, month, 1, 16, 0, 0, 0)) // 17:00 Africa/Lagos (UTC+1)
  const offset = (6 - first.getUTCDay() + 7) % 7
  return new Date(Date.UTC(year, month, 1 + offset + (nth - 1) * 7, 16, 0, 0, 0))
}

function getAutomaticServiceDate(now = new Date()) {
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const second = nthSaturdayLagos(year, month, 2)
  const third = nthSaturdayLagos(year, month, 3)
  if (now < second) return second
  if (now < third) return third
  return nthSaturdayLagos(year, month + 1, 2)
}

function getNextServiceDate(settings: CountdownSettings, now = new Date()) {
  if (!settings.saturday_service_automatic && settings.saturday_service_override_target) {
    const override = new Date(settings.saturday_service_override_target)
    if (!Number.isNaN(override.getTime()) && override.getTime() > now.getTime()) return override
  }
  return getAutomaticServiceDate(now)
}

function targetDate(month:number, day:number) {
  const now = new Date()
  let year = now.getFullYear()
  let target = new Date(year, month - 1, day, 0, 0, 0)
  if (target.getTime() <= now.getTime()) target = new Date(year + 1, month - 1, day, 0, 0, 0)
  return target
}

function parts(ms:number) {
  const total = Math.floor(Math.max(0, ms) / 1000)
  return { days: Math.floor(total/86400), hours: Math.floor(total%86400/3600), minutes: Math.floor(total%3600/60), seconds: total%60 }
}

function CountdownCard({label,target}:{label:string;target:Date}) {
  const [now,setNow] = useState(Date.now())
  useEffect(() => { const id=window.setInterval(() => setNow(Date.now()),1000); return () => window.clearInterval(id) }, [])
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

export function SiteCountdowns() {
  const [settings,setSettings] = useState<CountdownSettings>(fallback)
  const [now,setNow] = useState(() => new Date())

  useEffect(() => {
    const load = async () => {
      const {data} = await supabase.from('countdown_settings').select('*').eq('id',1).maybeSingle()
      if (data) setSettings(data as CountdownSettings)
    }
    load()
    const refresh = window.setInterval(load, 30000)
    const tick = window.setInterval(() => setNow(new Date()),1000)
    return () => { window.clearInterval(refresh); window.clearInterval(tick) }
  }, [])

  const serviceTarget = useMemo(() => getNextServiceDate(settings, now), [settings, now])
  const serviceLabel = serviceTarget.toLocaleDateString('en-NG',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Africa/Lagos'})
  const seasonal = useMemo(() => {
    const local = new Date()
    return {
      christmas: local.getMonth()===11 && settings.christmas_enabled,
      newYear: local.getMonth()===0 && local.getDate()<=7 && settings.new_year_enabled
    }
  }, [settings])

  if (!settings.enabled) return null

  return <>
    {settings.saturday_service_enabled && <div className="site-service-countdown" aria-label="Next Hilltop Saturday Service">
      <div className="site-service-countdown-kicker">Gather With Us</div>
      <h2>Next Live Service</h2>
      <div className="site-service-countdown-card">
        <div>
          <span className="site-countdown-badge">{settings.saturday_service_title}</span>
          <h3>{settings.saturday_service_title}</h3>
          <strong>{serviceLabel}</strong>
          <p>{settings.saturday_service_time_label} · {settings.saturday_service_venue}</p>
        </div>
        <CountdownCard label="Starts In" target={serviceTarget} />
      </div>
    </div>}
    <div className="site-countdowns" aria-label="Hilltop seasonal countdowns">
      {seasonal.christmas && <CountdownCard label={`Countdown to ${settings.christmas_label}`} target={targetDate(12,settings.christmas_target_day)}/>}
      {seasonal.newYear && <CountdownCard label={`Countdown to ${settings.new_year_label}`} target={targetDate(1,settings.new_year_target_day)}/>}
    </div>
    <style>{`
      .site-service-countdown{max-width:980px;margin:0 auto;padding:48px 20px;text-align:center;color:var(--ivory,#f5f0e6)}
      .site-service-countdown-kicker{font:700 11px Inter,system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#d9ad4c;margin-bottom:12px}
      .site-service-countdown h2{font:500 clamp(2.2rem,6vw,3.5rem) Georgia,serif;margin:0 0 34px}
      .site-service-countdown-card{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:center;text-align:left;padding:44px;border:1px solid rgba(217,173,76,.25);border-radius:26px;background:linear-gradient(135deg,#171611,#0d0e13);box-shadow:0 24px 70px rgba(0,0,0,.24)}
      .site-service-countdown-card h3{font:500 clamp(2rem,5vw,3rem) Georgia,serif;margin:20px 0 12px}
      .site-service-countdown-card strong{display:block;color:#d9ad4c;font:700 16px Inter,system-ui,sans-serif}
      .site-service-countdown-card p{color:#8f8c84;font:14px Inter,system-ui,sans-serif;line-height:1.6;margin:12px 0 0}
      .site-countdown-badge{display:inline-flex;padding:9px 14px;border:1px solid rgba(217,173,76,.25);border-radius:999px;color:#d9ad4c;background:rgba(217,173,76,.06);font:700 11px Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase}
      .site-countdown-card{min-width:0;padding:18px;background:rgba(255,255,255,.025);border:1px solid rgba(217,173,76,.16);border-radius:18px}
      .site-countdown-label{font:700 10px Inter,system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#d9ad4c;margin-bottom:12px}
      .site-countdown-values{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
      .site-countdown-values span{text-align:center;background:rgba(217,173,76,.07);border:1px solid rgba(217,173,76,.12);border-radius:12px;padding:10px 4px}
      .site-countdown-values b{display:block;font:500 27px Georgia,serif;color:#f0ca70}
      .site-countdown-values small{font:8px Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#777970}
      .site-countdowns{position:fixed;right:18px;bottom:18px;z-index:9980;display:flex;gap:10px;flex-wrap:wrap;max-width:min(650px,calc(100vw - 36px));justify-content:flex-end;pointer-events:none}
      .site-countdowns>.site-countdown-card{pointer-events:auto;min-width:235px}
      @media(max-width:700px){.site-service-countdown{padding:34px 14px}.site-service-countdown-card{grid-template-columns:1fr;padding:28px 20px;border-radius:20px}.site-service-countdown-card h3{font-size:2.2rem}.site-countdown-values b{font-size:23px}}
    `}</style>
  </>
}
