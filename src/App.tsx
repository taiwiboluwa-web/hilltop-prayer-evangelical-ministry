import React, { useState } from 'react'
import { AdminPortal } from './pages/AdminPortal'

const ACCOUNTS = {
  naira: { currency: '₦ NAIRA ACCOUNT', accountName: 'HILLTOP PRAYER & EVANGELICAL MINISTRY', bank: 'ZENITH BANK', accountNumber: '1229905996' },
  usd: { currency: '$ USD / DOLLAR ACCOUNT', accountName: 'HILLTOP PRAYER & EVANGELICAL MINISTRY', bank: 'ZENITH BANK', accountNumber: '5074529651' },
}

function Give() {
  const [amount, setAmount] = useState(5000)
  return <main style={{ minHeight: '100vh', background: '#08080e', color: '#f5f0e6', padding: '110px 24px 70px', fontFamily: 'Arial, sans-serif' }}>
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 45 }}>
        <p style={{ color: '#d9ad4c', letterSpacing: '.18em', textTransform: 'uppercase', fontSize: 12 }}>Give</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.4rem,6vw,4.8rem)', margin: '12px 0' }}>Honor God With Your Substance</h1>
        <p style={{ color: '#c9c2b5', lineHeight: 1.7 }}>Bring ye all the tithes into the storehouse, and prove me now herewith, saith the Lord. (Malachi 3:10)</p>
      </div>

      <section style={{ background: '#111117', border: '1px solid rgba(217,173,76,.25)', padding: 28, borderRadius: 18, marginBottom: 25 }}>
        <h2 style={{ fontFamily: 'Georgia, serif' }}>Give Online</h2>
        <p style={{ color: '#aaa5a0' }}>Select Amount</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{[1000,2000,5000,10000,25000,50000].map(value => <button key={value} onClick={() => setAmount(value)} style={{ padding: '10px 15px', borderRadius: 8, border: '1px solid #555', background: value === amount ? '#d9ad4c' : 'transparent', color: value === amount ? '#111' : '#fff', cursor: 'pointer' }}>₦{value.toLocaleString()}</button>)}</div>
        <button style={{ marginTop: 18, padding: '13px 20px', border: 0, borderRadius: 8, background: '#d9ad4c', color: '#111', fontWeight: 700 }}>Give ₦{amount.toLocaleString()} Now</button>
      </section>

      <section style={{ background: '#f5f0e6', color: '#171510', padding: 28, borderRadius: 18 }}>
        <h2 style={{ fontFamily: 'Georgia, serif', marginTop: 0 }}>ONLINE BANK TRANSFER</h2>
        <AccountCard account={ACCOUNTS.naira} />
        <AccountCard account={ACCOUNTS.usd} usd />
      </section>
    </div>
  </main>
}

function AccountCard({ account, usd = false }: { account: typeof ACCOUNTS.naira, usd?: boolean }) {
  return <div style={{ marginTop: 20, padding: 22, borderRadius: 14, background: usd ? '#fffaf0' : '#fff', border: usd ? '2px solid #d9ad4c' : '1px solid #ddd' }}>
    <div style={{ display: 'inline-block', padding: '7px 11px', borderRadius: 20, background: usd ? '#d9ad4c' : '#eee', color: '#111', fontSize: 12, fontWeight: 800, letterSpacing: '.08em', marginBottom: 15 }}>{account.currency}</div>
    <p><b>Account Name</b><br />{account.accountName}</p>
    <p><b>Bank</b><br />{account.bank}</p>
    <p><b>Account No.</b><br /><strong style={{ fontSize: 20 }}>{account.accountNumber}</strong></p>
  </div>
}

export default function App() {
  const [admin, setAdmin] = useState(window.location.pathname.toLowerCase() === '/admin')
  const path = window.location.pathname.toLowerCase()
  if (admin) return <AdminPortal onBack={() => { window.history.pushState({}, '', '/'); setAdmin(false) }} />
  if (path === '/give') return <Give />
  return <div style={{ minHeight: '100vh', background: '#08080e', color: '#f5f0e6', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 30 }}><div><h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.5rem,7vw,5rem)' }}>Hilltop Prayer & Evangelical Ministry</h1><p>Pray, Believe, Serve, Go</p><a href="/Give" style={{ color: '#d9ad4c' }}>Give</a></div></div>
}
