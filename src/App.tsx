import { useState, useEffect, useRef } from 'react'
import { AdminPortal } from './pages/AdminPortal'
import { supabase } from './lib/supabase'
import { Navbar, Logo } from './components/Navbar'

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
const DEFAULT_MINISTERS = [
  { id: 1, name: 'Pst. Emmanuel Oloya', role: 'Resident Pastor', desc: `About Me\nI am passionate about serving my community through leadership, creativity, and compassion. With a heart for people and a commitment to faith, I strive to make a lasting impact in every role I take on. Whether leading worship, organizing events, or guiding youth, I bring energy and purpose to every task I take on.`, img: IMGS.pastor },
  { id: 2, name: 'Mrs. Emmanuel Oloya', role: "Children's Pastor", desc: 'Nurturing young hearts in faith and love for Jesus Christ.', img: IMGS.minister2 },
  { id: 3, name: 'Secretary', role: 'Church Administrator', desc: 'Coordinating ministry workflows, communications, and organizational operations.', img: IMGS.minister3 },
  { id: 4, name: 'Open Slot', role: 'Associate Minister', desc: 'Dedicated to worship leadership and ministry coordination.', img: IMGS.worship },
  { id: 5, name: 'Open Slot', role: 'Outreach Minister', desc: 'Spearheading evangelism initiatives and community integration.', img: IMGS.community },
]

function App(){
  const [activePage,setActivePage]=useState('Home')
  const [admin,setAdmin]=useState(false)
  useEffect(()=>{const path=window.location.pathname.toLowerCase();if(path==='/admin')setAdmin(true)},[])
  if(admin)return <AdminPortal onBack={()=>{setAdmin(false);window.history.pushState({},'', '/')}} />
  return <><Navbar activePage={activePage} setActivePage={setActivePage}/><main><section style={{minHeight:'100vh',background:'#08080e',display:'grid',placeItems:'center',padding:'120px 24px',textAlign:'center'}}><div><p style={{color:'var(--gold)',letterSpacing:'.2em',textTransform:'uppercase',fontSize:10}}>Ipaja, Lagos, Nigeria</p><h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(2.8rem,7vw,6rem)',color:'#f5f0e6',maxWidth:900}}>Hilltop Prayer & Evangelical Ministry</h1><p style={{color:'#c9c2b5',fontSize:18}}>Pray, Believe, Serve, Go</p></div></section></main></>
}

export default App
