import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'

const defaults = {
  id: 1, enabled: true, saturday_service_enabled: true, saturday_service_automatic: true,
  saturday_service_override_target: null, saturday_service_title: 'Saturday Service',
  saturday_service_time_label: '5:00 PM - 7:00 PM',
  saturday_service_venue: '3 Kola Ojedeji Street, Ipaja, Lagos',
  christmas_enabled: true, christmas_target_month: 12, christmas_target_day: 25,
  new_year_enabled: true, new_year_target_month: 1, new_year_target_day: 1,
  christmas_label: 'Christmas', new_year_label: 'New Year'
}

function sqlClient() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('Neon DATABASE_URL is not configured')
  return neon(url)
}

async function ensureTable() {
  const sql=sqlClient()
  await sql`CREATE TABLE IF NOT EXISTS countdown_settings (
    id integer PRIMARY KEY,
    enabled boolean NOT NULL DEFAULT true,
    saturday_service_enabled boolean NOT NULL DEFAULT true,
    saturday_service_automatic boolean NOT NULL DEFAULT true,
    saturday_service_override_target timestamptz NULL,
    saturday_service_title text NOT NULL DEFAULT 'Saturday Service',
    saturday_service_time_label text NOT NULL DEFAULT '5:00 PM - 7:00 PM',
    saturday_service_venue text NOT NULL DEFAULT '3 Kola Ojedeji Street, Ipaja, Lagos',
    christmas_enabled boolean NOT NULL DEFAULT true,
    christmas_target_month integer NOT NULL DEFAULT 12,
    christmas_target_day integer NOT NULL DEFAULT 25,
    new_year_enabled boolean NOT NULL DEFAULT true,
    new_year_target_month integer NOT NULL DEFAULT 1,
    new_year_target_day integer NOT NULL DEFAULT 1,
    christmas_label text NOT NULL DEFAULT 'Christmas',
    new_year_label text NOT NULL DEFAULT 'New Year',
    updated_at timestamptz NOT NULL DEFAULT now()
  )`
  await sql`INSERT INTO countdown_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`
  return sql
}

export default async function handler(req:VercelRequest,res:VercelResponse){
  if(req.method!=='GET'&&req.method!=='PUT') return res.status(405).json({error:'Method not allowed'})
  try{
    const sql=await ensureTable()
    if(req.method==='GET'){
      const rows=await sql`SELECT * FROM countdown_settings WHERE id=1 LIMIT 1`
      return res.status(200).setHeader('Cache-Control','no-store').json(rows[0]||defaults)
    }
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
    if(allowed.saturday_service_override_target && Number.isNaN(Date.parse(allowed.saturday_service_override_target))) return res.status(400).json({error:'Invalid manual override date'})
    const rows=await sql`UPDATE countdown_settings SET
      enabled=${allowed.enabled}, saturday_service_enabled=${allowed.saturday_service_enabled},
      saturday_service_automatic=${allowed.saturday_service_automatic},
      saturday_service_override_target=${allowed.saturday_service_override_target},
      saturday_service_title=${allowed.saturday_service_title}, saturday_service_time_label=${allowed.saturday_service_time_label},
      saturday_service_venue=${allowed.saturday_service_venue}, christmas_enabled=${allowed.christmas_enabled},
      christmas_target_month=${allowed.christmas_target_month}, christmas_target_day=${allowed.christmas_target_day},
      new_year_enabled=${allowed.new_year_enabled}, new_year_target_month=${allowed.new_year_target_month},
      new_year_target_day=${allowed.new_year_target_day}, christmas_label=${allowed.christmas_label},
      new_year_label=${allowed.new_year_label}, updated_at=now() WHERE id=1 RETURNING *`
    return res.status(200).setHeader('Cache-Control','no-store').json(rows[0]||defaults)
  }catch(error:any){ return res.status(500).json({error:error?.message||'Countdown service unavailable'}) }
}
