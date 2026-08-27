/// <reference types="node" />
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  const auth = req.headers.authorization
  const secret = process.env.CRON_SECRET
  if (!secret || auth !== `Bearer ${secret}`) return res.status(401).json({ ok: false, error: 'Unauthorized' })

  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return res.status(500).json({ ok: false, error: 'Supabase environment variables are missing' })

  try {
    const response = await fetch(`${url}/rest/v1/ministers?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    })

    if (!response.ok) {
      const detail = await response.text()
      return res.status(502).json({ ok: false, error: `Supabase request failed: ${response.status}`, detail })
    }

    return res.status(200).json({ ok: true, service: 'supabase-heartbeat', timestamp: new Date().toISOString() })
  } catch (error) {
    return res.status(502).json({ ok: false, error: error instanceof Error ? error.message : 'Supabase request failed' })
  }
}
