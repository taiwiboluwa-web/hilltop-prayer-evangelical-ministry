import { useState, useEffect, useRef } from 'react'
import { AdminPortal } from './pages/AdminPortal'
import { supabase } from './lib/supabase'
import { Navbar, Logo } from './components/Navbar'

const DONATION_ACCOUNT = {
  currency: 'USD (US Dollar)',
  accountName: 'HILLTOP PRAYER & EVANGELICAL MINISTRY',
  bank: 'ZENITH BANK',
  accountNumber: '5074529651',
}

const IMGS = {
  hero: 'https://images.unsplash.com/photo-1510590124886-dc2653b48bf0?w=1920&h=1080&fit=crop&auto=format',
  worship: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=1600&h=900&fit=crop&auto=format',
  night: 'https://images.unsplash.com/photo-1579975096649-e773152b04cb?w=1200&h=700&fit=crop&auto=format',
  prayer: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&h=700&fit=crop&auto=format',
  raising: 'https://images.unsplash.com/photo-1530688957198-8570b1819eeb?w=1200&h=700&fit=crop&auto=format',
  community: 'https://images.unsplash.com/photo-1634936564306-8a905be6429a?w=1200&h=700&fit=crop&auto=format',
  mission: 'https://images.unsplash.com/photo-1673280401347-309363111070?w=1200&h=700&fit=crop&auto=format',
  diverse: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200&h=700&fit=crop&auto=format',
  pastor: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&auto=format',
  minister2: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop&auto=format',
  minister3: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=800&fit=crop&auto=format',
}

const SCHEDULE = [{ day: '2nd and 3rd Saturdays', name: 'Prayer Meeting', time: '5:30 PM - 8:00 PM' }]
const SERMONS = [
  { title: 'The Power of Persistent Prayer', speaker: 'Pastor Emmanuel Adeyemi', series: 'Pray Without Ceasing', scripture: 'Luke 18:1-8', date: 'Aug 11, 2026', dur: '52 min', tag: 'Prayer', img: IMGS.prayer },
  { title: 'Walking by Faith, Not by Sight', speaker: 'Pastor Emmanuel Adeyemi', series: 'Faith Foundations', scripture: '2 Corinthians 5:7', date: 'Aug 4, 2026', dur: '48 min', tag: 'Faith', img: IMGS.raising },
  { title: 'Go Into All the World', speaker: 'Evang. Grace Okafor', series: 'The Great Commission', scripture: 'Mark 16:15', date: 'Jul 28, 2026', dur: '44 min', tag: 'Evangelism', img: IMGS.mission },
  { title: 'Healing Is the Children Bread', speaker: 'Pastor Emmanuel Adeyemi', series: 'Supernatural Life', scripture: 'Matthew 15:26', date: 'Jul 21, 2026', dur: '50 min', tag: 'Healing', img: IMGS.worship },
  { title: 'Deliverance from Every Chain', speaker: 'Bro. Samuel Eze', series: 'Freedom in Christ', scripture: 'Isaiah 61:1', date: 'Jul 14, 2026', dur: '46 min', tag: 'Deliverance', img: IMGS.night },
  { title: 'The Family That Prays Together', speaker: 'Pastor Emmanuel Adeyemi', series: 'Blessed Home', scripture: 'Joshua 24:15', date: 'Jul 7, 2026', dur: '54 min', tag: 'Faith', img: IMGS.diverse },
]
const SERMON_TAGS = ['All','Faith','Prayer','Healing','Deliverance','Evangelism']
const EVENTS = [
  { date: '24 AUG', title: '21 Days of Prayer & Fasting', desc: 'Focused intercession, fasting, and seeking God together as a family.', time: '6:00 AM Daily', venue: 'Hilltop Auditorium, Ipaja', img: IMGS.prayer },
  { date: '07 SEP', title: 'Hilltop Youth Summit 2026', desc: 'A powerful gathering of young people encountering God and being sent forth.', time: '10:00 AM - 6:00 PM', venue: 'Hilltop Auditorium, Ipaja', img: IMGS.raising },
  { date: '19 SEP', title: 'Community Outreach Drive', desc: 'Taking the love of Christ into the streets and markets of Ipaja.', time: '8:00 AM - 2:00 PM', venue: 'Ipaja Community, Lagos', img: IMGS.mission },
]

function App(){
  const [admin,setAdmin]=useState(false)
  useEffect(()=>{if(window.location.pathname.toLowerCase()==='/admin')setAdmin(true)},[])
  if(admin)return <AdminPortal onBack={()=>{setAdmin(false);window.history.pushState({},'', '/')}} />
  return <><Navbar/><main><section style={{minHeight:'100vh',background:'#08080e',display:'grid',placeItems:'center',padding:'120px 24px',textAlign:'center'}}><div><p style={{color:'var(--gold)',letterSpacing:'.2em',textTransform:'uppercase',fontSize:10}}>Ipaja, Lagos, Nigeria</p><h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(2.8rem,7vw,6rem)',color:'#f5f0e6',maxWidth:900}}>Hilltop Prayer & Evangelical Ministry</h1><p style={{color:'#c9c2b5',fontSize:18}}>Pray, Believe, Serve, Go</p><div style={{marginTop:40,padding:'24px',border:'1px solid rgba(217,173,76,.35)',borderRadius:12,maxWidth:520,marginInline:'auto',textAlign:'left'}}><strong style={{display:'block',color:'var(--gold)',fontSize:14,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:16}}>USD / Dollar Account</strong><p style={{margin:'8px 0',color:'#f5f0e6'}}><b>Account Name:</b> {DONATION_ACCOUNT.accountName}</p><p style={{margin:'8px 0',color:'#f5f0e6'}}><b>Bank:</b> {DONATION_ACCOUNT.bank}</p><p style={{margin:'8px 0',color:'#f5f0e6'}}><b>Account No.:</b> {DONATION_ACCOUNT.accountNumber}</p></div></div></section></main></>
}

export default App
