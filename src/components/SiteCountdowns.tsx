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
  useEffect(() => {
    const load = async () => {
      const {data} = await supabase.from('countdown_settings').select('*').eq('id',1).maybeSingle()
      if (data) setSettings(data as CountdownSettings)
    }
    load()
    const refresh = window.setInterval(load, 30000)
    return () => window.clearInterval(refresh)
  }, [])

  const seasonal = useMemo(() => {
    const now = new Date()
    return {
      christmas: now.getMonth()===11 && settings.christmas_enabled,
      newYear: now.getMonth()===0 && now.getDate()<=7 && settings.new_year_enabled
    }
  }, [settings])

  if (!settings.enabled) return null

  return <div className="site-countdowns" aria-label="Hilltop seasonal countdowns">
    {seasonal.christmas && <CountdownCard label={`Countdown to ${settings.christmas_label}`} target={targetDate(12,settings.christmas_target_day)}/>}
    {seasonal.newYear && <CountdownCard label={`Countdown to ${settings.new_year_label}`} target={targetDate(1,settings.new_year_target_day)}/>}
    <style>{`
      .site-countdowns{position:fixed;right:18px;bottom:18px;z-index:9980;display:flex;gap:10px;flex-wrap:wrap;max-width:min(650px,calc(100vw - 36px));justify-content:flex-end;pointer-events:none}
      .site-countdowns>.site-countdown-card{pointer-events:auto;min-width:235px}
      .site-countdown-card{background:rgba(255,255,255,.96);border:1px solid rgba(217,173,76,.16);border-radius:16px;padding:12px 14px;box-shadow:0 12px 35px rgba(0,0,0,.13);color:#173c28}
      .site-countdown-label{font:700 9px Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
      .site-countdown-values{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
      .site-countdown-values span{text-align:center;background:#f5faf6;border-radius:9px;padding:6px 3px}
      .site-countdown-values b{display:block;font:700 18px Georgia,serif}
      .site-countdown-values small{font:8px Inter,sans-serif;color:#6c7e73}
    `}</style>
  </div>
}
