/// <reference types="node" />
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, phone } = req.body || {}
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' })

  const sheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (!sheetsWebhook) {
    return res.status(503).json({ error: 'Google Sheets notification service is not configured' })
  }

  try {
    const sheetsResponse = await fetch(sheetsWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: String(name).trim(),
        email: String(email).trim(),
        phone: String(phone || '').trim(),
        status: 'New',
      }),
    })

    if (!sheetsResponse.ok) {
      const details = await sheetsResponse.text().catch(() => '')
      console.error('Google Sheets member application failed', sheetsResponse.status, details)
      return res.status(502).json({ error: 'Unable to save the member application to Google Sheets' })
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM_EMAIL
    const to = 'hilltopprayerministry@gmail.com'
    if (!apiKey || !from) return res.status(503).json({ error: 'Email notification service is not configured' })

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New Become a Member application — ${name}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>New Become a Member application</h2><p>Someone has just expressed an intention to join Hilltop Prayer & Evangelical Ministry.</p><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p><p>Please open the Hilltop admin dashboard to review and follow up.</p></div>`,
        reply_to: email,
      }),
    })

    if (!response.ok) return res.status(502).json({ error: 'Unable to send notification email' })
    return res.status(200).json({ ok: true, sheets: true, email: true })
  } catch (error) {
    console.error('Member application notification failed', error)
    return res.status(502).json({ error: 'Unable to process the member application notification' })
  }
}

function escapeHtml(value: string) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char] || char))
}
