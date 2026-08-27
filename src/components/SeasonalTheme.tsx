import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'automatic' | 'default' | 'christmas' | 'new_year'
type ThemeRow = {
  id: number
  enabled: boolean
  mode: Mode
  christmas_start_month: number
  christmas_start_day: number
  christmas_end_month: number
  christmas_end_day: number
  new_year_start_month: number
  new_year_start_day: number
  new_year_end_month: number
  new_year_end_day: number
  christmas_message: string
  new_year_message: string
}

const fallback: ThemeRow = {
  id: 1, enabled: true, mode: 'automatic',
  christmas_start_month: 12, christmas_start_day: 1, christmas_end_month: 12, christmas_end_day: 31,
  new_year_start_month: 1, new_year_start_day: 1, new_year_end_month: 1, new_year_end_day: 7,
  christmas_message: 'Merry Christmas from Hilltop Prayer & Evangelical Ministry',
  new_year_message: 'Happy New Year from Hilltop Prayer & Evangelical Ministry',
}

function dayOfYear(date: Date) { const start = new Date(date.getFullYear(), 0, 0); return Math.floor((date.getTime() - start.getTime()) / 86400000) }
function range(startMonth:number,startDay:number,endMonth:number,endDay:number,year:number) {
  const start = new Date(year,startMonth-1,startDay); const end = new Date(year,endMonth-1,endDay)
  return dayOfYear(new Date(year, new Date().getMonth(), new Date().getDate())) >= dayOfYear(start) && dayOfYear(new Date(year,new Date().getMonth(),new Date().getDate())) <= dayOfYear(end)
}
function activeTheme(row:ThemeRow) {
  if (!row.enabled || row.mode === 'default') return 'default'
  if (row.mode === 'christmas') return 'christmas'
  if (row.mode === 'new_year') return 'new_year'
  const now = new Date(), y = now.getFullYear()
  if (range(row.christmas_start_month,row.christmas_start_day,row.christmas_end_month,row.christmas_end_day,y)) return 'christmas'
  if (range(row.new_year_start_month,row.new_year_start_day,row.new_year_end_month,row.new_year_end_day,y)) return 'new_year'
  return 'default'
}

const festiveCss = `
html[data-season="christmas"] body{background:#07130e!important}html[data-season="christmas"] .btn-gold{background:linear-gradient(135deg,#d7ad43,#f0d17a)!important}html[data-season="christmas"] .gold-text,html[data-season="christmas"] .label{color:#e7c66d!important}html[data-season="christmas"] .overlay{background:linear-gradient(180deg,rgba(4,31,18,.18),rgba(4,18,11,.72))!important}
html[data-season="new_year"] body{background:#090909!important}html[data-season="new_year"] .btn-gold{background:linear-gradient(135deg,#f3d36b,#fff0a8)!important}html[data-season="new_year"] .gold-text,html[data-season="new_year"] .label{color:#f1cf6c!important}
.seasonal-banner{position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:9999;padding:8px 18px;border-radius:0 0 14px 14px;background:rgba(9,10,8,.94);border:1px solid rgba(217,173,76,.35);color:#f2d47d;font:600 10px Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;box-shadow:0 8px 30px rgba(0,0,0,.22);pointer-events:none}
.seasonal-snow{position:fixed;inset:0;z-index:9997;pointer-events:none;overflow:hidden}.seasonal-snow i{position:absolute;top:-20px;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.82);animation:seasonal-fall linear infinite}.seasonal-snow i:nth-child(1){left:8%;animation-duration:8s;animation-delay:-2s}.seasonal-snow i:nth-child(2){left:21%;animation-duration:11s;animation-delay:-7s}.seasonal-snow i:nth-child(3){left:37%;animation-duration:9s;animation-delay:-4s}.seasonal-snow i:nth-child(4){left:54%;animation-duration:13s;animation-delay:-9s}.seasonal-snow i:nth-child(5){left:72%;animation-duration:10s;animation-delay:-5s}.seasonal-snow i:nth-child(6){left:89%;animation-duration:12s;animation-delay:-8s}@keyframes seasonal-fall{to{transform:translate3d(45px,110vh,0) rotate(240deg)}}
.seasonal-admin{position:fixed;right:22px;bottom:22px;z-index:10000;width:min(390px,calc(100vw - 32px));background:#0d0e0b;color:#eee9de;border:1px solid rgba(217,173,76,.28);box-shadow:0 20px 60px rgba(0,0,0,.4);padding:20px}.seasonal-admin h3{margin:0 0 5px;font:500 20px Georgia,serif}.seasonal-admin p{margin:0 0 15px;color:#777970;font:11px Inter,system-ui,sans-serif}.seasonal-admin select,.seasonal-admin input{width:100%;height:38px;background:#11120f;color:#eee;border:1px solid rgba(255,255,255,.1);padding:0 10px;margin:5px 0 10px}.seasonal-admin label{display:block;color:#85877c;font:9px Inter,sans-serif;letter-spacing:.1em;text-transform:uppercase}.seasonal-admin button{height:38px;padding:0 13px;border:1px solid rgba(217,173,76,.3);background:#171811;color:#f0cd73;text-transform:uppercase;font:600 9px Inter,sans-serif;letter-spacing:.1em;margin-right:7px}.seasonal-admin .primary{background:#d9ad4c;color:#15120b}.seasonal-admin .close{float:right;margin:0;background:transparent;border:0;color:#888}
`

export function SeasonalTheme({ admin = false }: { admin?: boolean }) {
  const [settings,setSettings] = useState<ThemeRow>(fallback)
  const [open,setOpen] = useState(false)
  const [loading,setLoading] = useState(false)
  const [lastTheme,setLastTheme] = useState('default')

  useEffect(() => { const load = async () => { const { data } = await supabase.from('site_theme_settings').select('*').eq('id',1).maybeSingle(); if(data) setSettings(data as ThemeRow) }; load() }, [])
  useEffect(() => { const apply = () => { const theme=activeTheme(settings); document.documentElement.dataset.season=theme; setLastTheme(theme) }; apply(); const id=window.setInterval(apply,60000); return()=>window.clearInterval(id) }, [settings])
  useEffect(() => { const style=document.createElement('style'); style.dataset.seasonalTheme='true'; style.textContent=festiveCss; document.head.appendChild(style); return()=>style.remove() }, [])

  const save = async () => { setLoading(true); const { data, error } = await supabase.from('site_theme_settings').update(settings).eq('id',1).select('*').single(); setLoading(false); if(!error && data) { setSettings(data as ThemeRow); setOpen(false) } else if(error) window.alert(`Could not save theme settings: ${error.message}`) }
  const message = lastTheme === 'christmas' ? settings.christmas_message : lastTheme === 'new_year' ? settings.new_year_message : ''

  return <>
    {lastTheme !== 'default' && <div className="seasonal-banner">{message}</div>}
    {lastTheme === 'christmas' && <div className="seasonal-snow" aria-hidden="true">{Array.from({length:6},(_,i)=><i key={i}/>)}</div>}
    {admin && <>{!open && <button className="seasonal-admin" style={{width:'auto',padding:'11px 14px'}} onClick={()=>setOpen(true)}>Seasonal Theme Settings</button>}{open && <div className="seasonal-admin"><button className="close" onClick={()=>setOpen(false)}>×</button><h3>Website Seasonal Theme</h3><p>Choose a theme manually or let Hilltop switch automatically by date.</p><label>Theme mode<select value={settings.mode} onChange={e=>setSettings({...settings,mode:e.target.value as Mode})}><option value="automatic">Automatic (recommended)</option><option value="default">Default Hilltop</option><option value="christmas">Christmas</option><option value="new_year">New Year</option></select></label><label>Christmas starts<select value={`${settings.christmas_start_month}-${settings.christmas_start_day}`} onChange={e=>{const [m,d]=e.target.value.split('-').map(Number);setSettings({...settings,christmas_start_month:m,christmas_start_day:d})}}>{Array.from({length:31},(_,i)=><option key={i+1} value={`12-${i+1}`}>December {i+1}</option>)}</select></label><label>Christmas ends<select value={`${settings.christmas_end_month}-${settings.christmas_end_day}`} onChange={e=>{const [m,d]=e.target.value.split('-').map(Number);setSettings({...settings,christmas_end_month:m,christmas_end_day:d})}}>{Array.from({length:31},(_,i)=><option key={i+1} value={`12-${i+1}`}>December {i+1}</option>)}</select></label><label>New Year starts<select value={`${settings.new_year_start_month}-${settings.new_year_start_day}`} onChange={e=>{const [m,d]=e.target.value.split('-').map(Number);setSettings({...settings,new_year_start_month:m,new_year_start_day:d})}}>{Array.from({length:31},(_,i)=><option key={i+1} value={`1-${i+1}`}>January {i+1}</option>)}</select></label><label>New Year ends<select value={`${settings.new_year_end_month}-${settings.new_year_end_day}`} onChange={e=>{const [m,d]=e.target.value.split('-').map(Number);setSettings({...settings,new_year_end_month:m,new_year_end_day:d})}}>{Array.from({length:31},(_,i)=><option key={i+1} value={`1-${i+1}`}>January {i+1}</option>)}</select></label><button onClick={()=>setSettings({...settings,enabled:!settings.enabled})}>{settings.enabled?'Disable seasonal themes':'Enable seasonal themes'}</button><button className="primary" onClick={save} disabled={loading}>{loading?'Saving…':'Save & Publish'}</button></div>}</>}</>
}
