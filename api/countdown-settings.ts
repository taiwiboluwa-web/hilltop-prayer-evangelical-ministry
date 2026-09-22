import type { VercelRequest, VercelResponse } from '@vercel/node'

const defaults = {
  id: 1, enabled: true, saturday_service_enabled: true, saturday_service_automatic: true,
  saturday_service_override_target: null, saturday_service_title: 'Saturday Service',
  saturday_service_time_label: '5:00 PM - 7:00 PM',
  saturday_service_venue: '3 Kola Ojedeji Street, Ipaja, Lagos',
  christmas_enabled: true, christmas_target_month: 12, christmas_target_day: 25,
  new_year_enabled: true, new_year_target_month: 1, new_year_target_day: 1,
  christmas_label: 'Christmas', new_year_label: 'New Year'
}

function supabaseConfig(req: VercelRequest) {
  const url = (process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
  const key = process.env.VITE_SUPABASE_ANON_KEY || ''
  const authorization = req.headers.authorization || `Bearer ${key}`
  if (!url || !key) throw new Error('Supabase environment variables are not configured')
  return { url, key, authorization }
}

async function supabaseRequest(req: VercelRequest, path: string, init: RequestInit = {}) {
  const { url, key, authorization } = supabaseConfig(req)
  const headers = new Headers(init.headers)
  headers.set('apikey', key)
  headers.set('Authorization', authorization)
  headers.set('Content-Type', 'application/json')
  headers.set('Accept', 'application/json')
  return fetch(`${url}/rest/v1/${path}`, { ...init, headers, cache: 'no-store' })
}

export default async function handler(req:VercelRequest,res:VercelResponse){
  if(req.method!=='GET'&&req.method!=='PUT') return res.status(405).json({error:'Method not allowed'})

  try {
    if(req.method==='GET') {
      const response = await supabaseRequest(req, 'countdown_settings?id=eq.1&select=*')
      const data = await response.json()
      if(!response.ok) throw new Error(data?.message || data?.hint || 'Unable to load countdown settings')
      return res.status(200).setHeader('Cache-Control','no-store').json(data[0] || defaults)
    }

    const auth = req.headers.authorization
    if(!auth) return res.status(401).json({error:'Authentication required'})

    const body=req.body||{}
    const allowed={
      enabled:body.enabled!==false,
      saturday_service_enabled:body.saturday_service_enabled!==false,
      saturday_service_automatic:body.saturday_service_automatic!==false,
      saturday_service_override_target:body.saturday_service_automatic?null:(body.saturday_service_override_target||null),
      saturday_service_title:String(body.saturday_service_title||defaults.saturday_service_title).slice(0,120),
      saturday_service_time_label:String(body.saturday_service_time_label||defaults.saturday_service_time_label).slice(0,120),
      saturday_service_venue:String(body.saturday_service_venue||defaults.saturday_service_venue).slice(0,240),
      christmas_enabled:body.christmas_enabled!==false,
      christmas_target_month:Number(body.christmas_target_month)||12,
      christmas_target_day:Number(body.christmas_target_day)||25,
      new_year_enabled:body.new_year_enabled!==false,
      new_year_target_month:Number(body.new_year_target_month)||1,
      new_year_target_day:Number(body.new_year_target_day)||1,
      christmas_label:String(body.christmas_label||'Christmas').slice(0,80),
      new_year_label:String(body.new_year_label||'New Year').slice(0,80)
    }

    if(allowed.saturday_service_override_target && Number.isNaN(Date.parse(allowed.saturday_service_override_target))) {
      return res.status(400).json({error:'Invalid manual override date'})
    }

    const response = await supabaseRequest(req, 'countdown_settings?id=eq.1', {
      method:'PATCH',
      headers:{ Prefer:'return=representation' },
      body:JSON.stringify(allowed)
    })
    const data = await response.json()
    if(!response.ok) {
      const message = data?.message || data?.hint || data?.details || 'Unable to save countdown settings'
      return res.status(response.status === 401 || response.status === 403 ? response.status : 500).json({error:message})
    }

    return res.status(200).setHeader('Cache-Control','no-store').json(data[0]||defaults)
  } catch(error:any) {
    return res.status(500).json({error:error?.message||'Countdown service unavailable'})
  }
}
