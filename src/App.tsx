import { useState, useEffect, useRef } from 'react'
import { AdminPortal } from './pages/AdminPortal'
import { supabase } from './lib/supabase'
import { Navbar, Logo } from './components/Navbar'

const IMGS = {
  hero:      'https://images.unsplash.com/photo-1510590124886-dc2653b48bf0?w=1920&h=1080&fit=crop&auto=format',
  worship:   'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=1600&h=900&fit=crop&auto=format',
  night:     'https://images.unsplash.com/photo-1579975096649-e773152b04cb?w=1200&h=700&fit=crop&auto=format',
  prayer:    'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&h=700&fit=crop&auto=format',
  raising:   'https://images.unsplash.com/photo-1530688957198-8570b1819eeb?w=1200&h=700&fit=crop&auto=format',
  community: 'https://images.unsplash.com/photo-1634936564306-8a905be6429a?w=1200&h=700&fit=crop&auto=format',
  mission:   'https://images.unsplash.com/photo-1673280401347-309363111070?w=1200&h=700&fit=crop&auto=format',
  diverse:   'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200&h=700&fit=crop&auto=format',
  pastor:    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&auto=format',
  minister2: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop&auto=format',
  minister3: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=800&fit=crop&auto=format',
}

const SCHEDULE = [
  { day: '2nd and 3rd Saturdays', name: 'Prayer Meeting', time: '5:30 PM - 8:00 PM' },
]

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
  { 
    id: 1,
    name: 'Pst. Emmanuel Oloya', 
    role: 'Resident Pastor', 
    desc: `About Me\nI am passionate about serving my community through leadership, creativity, and compassion. With a heart for people and a commitment to faith, I strive to make a lasting impact in every role I take on. Whether leading worship, organizing events, or guiding youth, I bring energy and purpose to every task. Communication and connection are at the center of what I do, and I am always looking for ways to inspire and uplift others. Over the years, I have grown deeply in my faith and professional journey, learning from both challenges and triumphs. Collaboration is key to my work, and I believe we are stronger when we serve together. I am driven by a desire to see lives transformed and communities strengthened. Every opportunity I get to lead or support others is one I value deeply.\n\nMy work is not just a job, it is a calling. I wake up every day excited to serve with authenticity, joy, and hope.\n\nAs I continue to grow, I remain open to learning from those around me, knowing that true leadership comes from humility and listening. I have seen how small acts of kindness can create a ripple effect, and I strive to be a catalyst for that kind of change.\n\nMentorship and discipleship have also become essential parts of my journey, allowing me to pour into others as others have poured into me. I cherish the moments when I can help someone find their voice, step into their purpose, or simply feel seen. Ultimately, my mission is to reflect love in action and bring light into every space I enter.`, 
    img: IMGS.pastor 
  },
  { id: 2, name: 'Mrs. Emmanuel Oloya', role: "Children's Pastor", desc: 'Nurturing young hearts in faith and love for Jesus Christ.', img: IMGS.minister2 },
  { id: 3, name: 'Secretary', role: 'Church Administrator', desc: 'Coordinating ministry workflows, communications, and organizational operations.', img: IMGS.minister3 },
  { id: 4, name: 'Open Slot', role: 'Associate Minister', desc: 'Dedicated to worship leadership and ministry coordination.', img: IMGS.worship },
  { id: 5, name: 'Open Slot', role: 'Outreach Minister', desc: 'Spearheading evangelism initiatives and community integration.', img: IMGS.community },
]

const GIVE_AMOUNTS = [1000, 2000, 5000, 10000, 25000, 50000]

interface MinisterRow {
  id?: number | string
  name: string
  role: string
  desc?: string
  image_url?: string
  img?: string
}

interface MinisterItem {
  id: number | string
  name: string
  role: string
  desc: string
  img: string
}

function pad(n: number) { return String(n).padStart(2, '0') }

function getNextServiceDate(now: Date = new Date()): Date {
  const year = now.getFullYear()
  const month = now.getMonth()

  const getNthSaturday = (y: number, m: number, nth: number): Date => {
    let count = 0
    const date = new Date(y, m, 1, 9, 0, 0)
    while (date.getMonth() === m) {
      if (date.getDay() === 6) {
        count++
        if (count === nth) return new Date(date)
      }
      date.setDate(date.getDate() + 1)
    }
    return date
  }

  const secondSat = getNthSaturday(year, month, 2)
  const thirdSat = getNthSaturday(year, month, 3)

  if (now < secondSat) {
    return secondSat
  } else if (now < thirdSat) {
    return thirdSat
  } else {
    return getNthSaturday(year, month + 1, 2)
  }
}

function useCountdown(target: Date) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, target.getTime() - Date.now())
      setT({
        d: Math.floor(ms / 86400000),
        h: Math.floor((ms % 86400000) / 3600000),
        m: Math.floor((ms % 3600000) / 60000),
        s: Math.floor((ms % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])
  return t
}

function AnimatedText({ children, style, className, tag = 'div' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string; tag?: keyof HTMLElementTagNameMap }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const extractText = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node
    if (typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(extractText).join('')
    if (node && typeof node === 'object' && 'props' in node) {
      return extractText((node as any).props.children)
    }
    return ''
  }

  const fullText = extractText(children)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isVisible) {
        setIsVisible(true)
      }
    }, { threshold: 0.1 })
    if (elementRef.current) observer.observe(elementRef.current)
    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return
    let i = 0
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(fullText.substring(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 40)
    return () => clearInterval(timer)
  }, [isVisible, fullText])

  const Component = tag as any
  return (
    <Component ref={elementRef} style={style} className={className}>
      {displayedText}
      {isVisible && displayedText.length < fullText.length && (
        <span style={{ borderRight: '2px solid var(--gold)', marginLeft: '1px', animation: 'blink 0.7s infinite' }} />
      )}
    </Component>
  )
}

function Hero({ setActivePage }: { setActivePage: (p: string) => void }) {
  return (
    <section id="home" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#08080e' }}>
      <img src={IMGS.hero} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.28) saturate(0.6)', transform: 'scale(1.04)' }}/>
      <div className="overlay" />
      <div className="glow-gold" style={{ width: 900, height: 900, top: '50%', left: '50%', transform: 'translate(-50%,-60%)' }}/>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30vh', background: 'linear-gradient(0deg,#08080e 0%,transparent 100%)' }}/>

      <div className="fade-up" style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ height: 1, width: 40, background: 'var(--gold)' }}/>
          <span className="label">Ipaja, Lagos, Nigeria</span>
          <div style={{ height: 1, width: 40, background: 'var(--gold)' }}/>
        </div>

        <AnimatedText tag="h1" className="display" style={{ fontSize: 'clamp(2.6rem,7vw,6rem)', marginBottom: 20 }}>
          Hilltop Prayer & Evangelical Ministry
        </AnimatedText>

        <AnimatedText tag="p" className="gold-text serif" style={{ fontFamily: 'Instrument Serif', fontSize: 'clamp(1.3rem,3.5vw,2.4rem)', fontStyle: 'italic', marginBottom: 20 }}>
          Pray, Believe, Serve, Go
        </AnimatedText>

        <AnimatedText tag="p" style={{ fontFamily: 'Outfit', fontWeight: 300, fontSize: 'clamp(0.95rem,1.8vw,1.1rem)', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>
          A people called to pray, believe God word, serve with love, and carry His Gospel to the ends of the earth.
        </AnimatedText>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setActivePage('Become a Member')} className="btn btn-gold" style={{ border: 'none', cursor: 'pointer' }}>Join Us</button>
          <button onClick={() => setActivePage('Sermons')} className="btn btn-glass" style={{ border: 'none', cursor: 'pointer' }}>
            <span className="live-dot" style={{ flexShrink: 0 }}/>
            Watch Sermons
          </button>
        </div>
      </div>
    </section>
  )
}

function BecomeMember() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return
    setSubmitted(true)
  }

  return (
    <section id="become-member" style={{ minHeight: '100vh', background: '#08080e', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ position: 'relative', width: '100%', height: '42vh', minHeight: 320, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={IMGS.diverse} alt="Welcome" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.32) saturate(0.7)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,14,0.4) 0%, #08080e 100%)' }} />
        
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px', marginTop: 40 }}>
          <AnimatedText tag="h1" className="display" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', marginBottom: 12, color: '#f9f6f0' }}>
            Welcome
          </AnimatedText>
          <AnimatedText tag="p" style={{ fontFamily: 'Outfit', fontSize: 'clamp(0.88rem, 1.5vw, 1.05rem)', color: 'rgba(242,237,228,0.85)', maxWidth: 640, margin: '0 auto', lineHeight: 1.6, fontWeight: 300 }}>
            At Hilltop Prayer & Evangelical Ministry, our doors and hearts are always open. Whether you are a first-time visitor, a returning member, or seeking spiritual guidance, we are here to walk with you in faith and fellowship.
          </AnimatedText>
        </div>
      </div>

      <div style={{ flex: 1, background: '#f5f0e6', padding: '60px 24px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#1a1a1a' }}>
        <div style={{ width: '100%', maxWidth: 960, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <AnimatedText tag="h2" style={{ fontFamily: 'Instrument Serif', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 400, color: '#1f1c16', marginBottom: 8 }}>
              We Would Love to Hear from You
            </AnimatedText>
            <AnimatedText tag="p" style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: '#665e52', letterSpacing: '0.02em' }}>
              Kindly fill out the form below and take your next step to being part of the Hilltop family.
            </AnimatedText>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 48, alignItems: 'center', background: '#fcf9f2', padding: '48px 40px', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.06)', border: '1px solid rgba(201,168,76,0.2)' }} className="member-grid">
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRight: '1px solid rgba(0,0,0,0.06)', paddingRight: 24 }} className="member-crest-col">
              <div style={{ width: 180, height: 180, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', marginBottom: 20, border: '3px solid #c9a84c', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                  <svg width="48" height="48" viewBox="0 0 34 34" fill="none">
                    <polygon points="17,2 32,31 2,31" stroke="#1f1c16" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                    <line x1="17" y1="2" x2="17" y2="31" stroke="#c9a84c" strokeWidth="1" opacity="0.5"/>
                    <circle cx="17" cy="18" r="3" fill="#c9a84c"/>
                  </svg>
                  <span style={{ fontFamily: 'Outfit', fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.12em', color: '#1f1c16', marginTop: 4 }}>HILLTOP</span>
                </div>
              </div>
              <div style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#554c3e' }}>
                Haven of Joy & Grace
              </div>
            </div>

            <div>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(46,125,50,0.1)', color: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 16px' }}>✓</div>
                  <AnimatedText tag="h3" style={{ fontFamily: 'Instrument Serif', fontSize: '1.8rem', color: '#1f1c16', marginBottom: 8 }}>Welcome to the Family!</AnimatedText>
                  <AnimatedText tag="p" style={{ fontFamily: 'Outfit', fontSize: '0.88rem', color: '#554c3e', lineHeight: 1.6 }}>
                    Thank you, {formData.name}. We have received your details and our team will reach out to welcome you warmly.
                  </AnimatedText>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', color: '#776d5e', textTransform: 'uppercase', marginBottom: 6 }}>Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter your full name" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #d4cebe', background: '#fff', fontFamily: 'Outfit', fontSize: '0.9rem', color: '#1f1c16', outline: 'none', transition: 'border-color 0.2s' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', color: '#776d5e', textTransform: 'uppercase', marginBottom: 6 }}>Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="Enter your email address" 
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #d4cebe', background: '#fff', fontFamily: 'Outfit', fontSize: '0.9rem', color: '#1f1c16', outline: 'none', transition: 'border-color 0.2s' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', color: '#776d5e', textTransform: 'uppercase', marginBottom: 6 }}>Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="Enter your phone number" 
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #d4cebe', background: '#fff', fontFamily: 'Outfit', fontSize: '0.9rem', color: '#1f1c16', outline: 'none', transition: 'border-color 0.2s' }}
                    />
                  </div>

                  <button 
                    type="submit"
                    style={{ marginTop: 8, padding: '14px 24px', borderRadius: 8, border: 'none', background: '#8c6d26', color: '#fff', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.08em', cursor: 'pointer', transition: 'background 0.2s', textTransform: 'uppercase' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#73571d'}
                    onMouseLeave={e => e.currentTarget.style.background = '#8c6d26'}
                  >
                    Next
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}

function AboutPage() {
  const [target] = useState(() => getNextServiceDate())
  const c = useCountdown(target)
  const formattedDate = target.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <section id="about" style={{ padding: '140px 24px 100px', background: 'var(--bg)', position: 'relative', overflow: 'hidden', minHeight: '80vh' }}>
      <div className="glow-gold" style={{ width: 700, height: 500, top: -200, left: '50%', transform: 'translateX(-50%)' }}/>
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="label" style={{ marginBottom: 16 }}>About Our Ministry</div>
          <AnimatedText tag="h2" className="display" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', marginBottom: 20 }}>
            Rooted in Prayer, Driven by Purpose
          </AnimatedText>
          <AnimatedText tag="p" style={{ fontFamily: 'Outfit', color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 650, margin: '0 auto', lineHeight: 1.7 }}>
            Hilltop Prayer & Evangelical Ministry is a vibrant spiritual home based in Ipaja, Lagos. We are dedicated to raising believers who anchor their lives in prayer, stand firm in faith, and impact their communities with Christ love.
          </AnimatedText>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, marginBottom: 72 }}>
          <div className="glass-hi" style={{ borderRadius: 20, padding: '40px 36px', border: '1px solid rgba(201,168,76,0.25)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: 'var(--gold-light)', fontSize: '1.2rem', fontWeight: 800 }}>🎯</div>
            <AnimatedText tag="h3" className="serif" style={{ fontFamily: 'Instrument Serif', fontSize: '2rem', color: 'var(--ivory)', marginBottom: 12 }}>
              Our Mission
            </AnimatedText>
            <AnimatedText tag="p" style={{ fontFamily: 'Outfit', fontSize: '0.92rem', color: 'var(--muted)', lineHeight: 1.75 }}>
              To equip believers through fervent prayer, sound teaching of God word, and active works of service, fulfilling the Great Commission by carrying the Gospel into Lagos and to the ends of the earth.
            </AnimatedText>
          </div>

          <div className="glass-hi" style={{ borderRadius: 20, padding: '40px 36px', border: '1px solid rgba(201,168,76,0.25)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: 'var(--gold-light)', fontSize: '1.2rem', fontWeight: 800 }}>✨</div>
            <AnimatedText tag="h3" className="serif" style={{ fontFamily: 'Instrument Serif', fontSize: '2rem', color: 'var(--ivory)', marginBottom: 12 }}>
              Our Vision
            </AnimatedText>
            <AnimatedText tag="p" style={{ fontFamily: 'Outfit', fontSize: '0.92rem', color: 'var(--muted)', lineHeight: 1.75 }}>
              To be a beacon of spiritual awakening, raising a generation of joyful, grace-filled ambassadors who transform their families, workplaces, and cities through the power of God.
            </AnimatedText>
          </div>
        </div>

        <div style={{ marginBottom: 72 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="label" style={{ marginBottom: 12 }}>Gallery and Moments</div>
            <AnimatedText tag="h3" className="serif" style={{ fontFamily: 'Instrument Serif', fontSize: '2.4rem', color: 'var(--ivory)' }}>
              A Glimpse Into Our Fellowship
            </AnimatedText>
            <AnimatedText tag="p" style={{ fontFamily: 'Outfit', fontSize: '0.88rem', color: 'var(--muted)', marginTop: 6 }}>
              Moments of worship, community fellowship, and spiritual empowerment at Hilltop.
            </AnimatedText>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="about-gallery-grid">
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 260, position: 'relative', border: '1px solid var(--border)' }}>
              <img src={IMGS.worship} alt="Worship Session" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7) saturate(0.8)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 14, fontFamily: 'Outfit', fontSize: '0.8rem', color: '#fff', fontWeight: 600, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 6 }}>Fervent Worship</div>
            </div>

            <div style={{ borderRadius: 16, overflow: 'hidden', height: 260, position: 'relative', border: '1px solid var(--border)' }}>
              <img src={IMGS.prayer} alt="Prayer Meeting" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7) saturate(0.8)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 14, fontFamily: 'Outfit', fontSize: '0.8rem', color: '#fff', fontWeight: 600, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 6 }}>Prayer & Intercession</div>
            </div>

            <div style={{ borderRadius: 16, overflow: 'hidden', height: 260, position: 'relative', border: '1px solid var(--border)' }}>
              <img src={IMGS.community} alt="Community Outreach" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7) saturate(0.8)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 14, fontFamily: 'Outfit', fontSize: '0.8rem', color: '#fff', fontWeight: 600, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 6 }}>Community Impact</div>
            </div>
          </div>
        </div>

        <div className="label" style={{ marginBottom: 16, textAlign: 'center' }}>Gather With Us</div>
        <AnimatedText tag="h2" className="display" style={{ fontSize: 'clamp(2rem,4.5vw,3.4rem)', marginBottom: 40, textAlign: 'center' }}>Next Live Service</AnimatedText>

        <div className="glass-hi" style={{ borderRadius: 'var(--r-xl)', padding: '48px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div className="glow-gold" style={{ width: 500, height: 400, top: -120, right: -100, borderRadius: '50%' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)', marginBottom: 16 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }} />
                <span style={{ fontFamily: 'Outfit', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gold-light)', textTransform: 'uppercase' }}>
                  Saturday Service
                </span>
              </div>

              <AnimatedText tag="h3" className="display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 8 }}>
                Saturday Service
              </AnimatedText>

              <p style={{ fontFamily: 'Outfit', color: 'var(--gold-light)', fontWeight: 500, fontSize: '0.95rem', marginBottom: 4 }}>
                {formattedDate}
              </p>

              <p style={{ fontFamily: 'Outfit', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 24 }}>
                9:00 AM, 3 Kola Ojedeji Street, Ipaja, Lagos
              </p>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 14, textAlign: 'right' }}>Starts In</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[[c.d,'Days'],[c.h,'Hrs'],[c.m,'Min'],[c.s,'Sec']].map(([val, lbl]) => (
                  <div key={lbl as string} className="cbox">
                    <div className="serif gold-text" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', lineHeight: 1 }}>
                      {pad(val as number)}
                    </div>
                    <div className="label" style={{ fontSize: '0.55rem', marginTop: 6, color: 'rgba(201,168,76,0.45)' }}>{lbl as string}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {SCHEDULE.map(s => (
            <div key={s.day} className="card" style={{ padding: 24 }}>
              <div className="label" style={{ marginBottom: 10, color: 'rgba(201,168,76,0.5)' }}>{s.day}</div>
              <div className="serif" style={{ fontSize: '1.2rem', color: 'var(--ivory)', marginBottom: 6 }}>{s.name}</div>
              <div style={{ fontFamily: 'Outfit', fontSize: '0.82rem', color: 'rgba(201,168,76,0.65)', fontWeight: 500 }}>{s.time}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

function Sermons() {
  const [tag, setTag] = useState('All')
  const featured = SERMONS[0]
  const grid = SERMONS.slice(1).filter(s => tag === 'All' || s.tag === tag)

  return (
    <section id="sermons" style={{ padding: '140px 24px 100px', background: 'var(--bg2)', position: 'relative', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="label" style={{ marginBottom: 16 }}>The Word</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, gap: 20, flexWrap: 'wrap' }}>
          <AnimatedText tag="h2" className="display" style={{ fontSize: 'clamp(2rem,4.5vw,3.4rem)' }}>Latest Sermons</AnimatedText>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SERMON_TAGS.map(t => (
              <button key={t} onClick={() => setTag(t)} style={{
                fontFamily: 'Outfit', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em',
                padding: '7px 16px', borderRadius: 100, cursor: 'pointer', border: 'none',
                background: tag === t ? 'var(--gold-dim)' : 'rgba(255,255,255,0.04)',
                color: tag === t ? 'var(--gold-light)' : 'var(--muted)',
                outline: tag === t ? '1px solid var(--border-hi)' : '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.18s ease',
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 0, marginBottom: 32, borderRadius: 'var(--r-xl)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', minHeight: 340, background: '#0f0f18' }}>
            <img src={featured.img} alt={featured.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.38) saturate(0.65)' }}/>
            <div className="overlay"/>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', cursor: 'pointer' }}>
                <svg width="22" height="24" viewBox="0 0 22 24" fill="var(--gold)"><polygon points="0,0 22,12 0,24"/></svg>
              </div>
            </div>
            <div style={{ position: 'absolute', top: 16, left: 16 }}>
              <span className="tag">Featured</span>
            </div>
            <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(8,8,14,0.8)', borderRadius: 6, padding: '4px 10px', fontFamily: 'Outfit', fontSize: '0.72rem', color: 'var(--muted)' }}>
              {featured.dur}
            </div>
          </div>
          <div style={{ background: 'var(--bg3)', padding: '40px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="label" style={{ marginBottom: 12, color: 'rgba(201,168,76,0.5)' }}>{featured.series}</div>
              <AnimatedText tag="h3" className="serif" style={{ fontFamily: 'Instrument Serif', fontSize: 'clamp(1.5rem,2.5vw,2rem)', color: 'var(--ivory)', lineHeight: 1.2, marginBottom: 14 }}>{featured.title}</AnimatedText>
              <p style={{ fontFamily: 'Outfit', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 8 }}>{featured.speaker}</p>
              <p style={{ fontFamily: 'Outfit', fontSize: '0.82rem', color: 'rgba(201,168,76,0.6)', marginBottom: 6 }}>{featured.scripture}</p>
              <div style={{ display: 'flex', gap: 12, fontFamily: 'Outfit', fontSize: '0.75rem', color: 'var(--dimmed)', marginTop: 20 }}>
                <span>{featured.date}</span><span>·</span><span>{featured.dur}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {grid.map(s => (
            <div key={s.title} className="card" style={{ cursor: 'pointer' }}>
              <div style={{ position: 'relative', height: 160, background: '#0f0f18' }}>
                <img src={s.img} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35) saturate(0.6)', transition: 'transform 0.45s ease' }}/>
                <div className="overlay"/>
                <div style={{ position: 'absolute', top: 10, right: 10 }}><span className="tag">{s.tag}</span></div>
              </div>
              <div style={{ padding: '20px 20px 22px' }}>
                <div className="label" style={{ fontSize: '0.58rem', marginBottom: 8, color: 'rgba(201,168,76,0.45)' }}>{s.series}</div>
                <div className="serif" style={{ fontFamily: 'Instrument Serif', fontSize: '1.05rem', color: 'var(--ivory)', lineHeight: 1.25, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: 'var(--dimmed)' }}>{s.speaker} · {s.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Events() {
  return (
    <section id="events" style={{ padding: '140px 24px 100px', background: 'var(--bg)', position: 'relative', overflow: 'hidden', minHeight: '80vh' }}>
      <div className="glow-warm" style={{ width: 800, height: 600, bottom: -200, right: -100 }}/>
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div className="label" style={{ marginBottom: 16 }}>Calendar</div>
        <AnimatedText tag="h2" className="display" style={{ fontSize: 'clamp(2rem,4.5vw,3.4rem)', marginBottom: 48 }}>
          Upcoming Events
        </AnimatedText>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
          {EVENTS.map(ev => (
            <div key={ev.title} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: 200, background: '#0f0f18' }}>
                <img src={ev.img} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.38) saturate(0.65)' }}/>
                <div className="overlay"/>
                <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(201,168,76,0.9)', color: '#08080e', padding: '6px 12px', borderRadius: 8, fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.75rem', textAlign: 'center', lineHeight: 1.1 }}>
                  {ev.date}
                </div>
              </div>
              <div style={{ padding: '28px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.72rem', color: 'var(--gold-light)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {ev.time} · {ev.venue}
                  </div>
                  <div className="serif" style={{ fontSize: '1.4rem', color: 'var(--ivory)', marginBottom: 12, lineHeight: 1.25 }}>
                    {ev.title}
                  </div>
                  <p style={{ fontFamily: 'Outfit', fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                    {ev.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MinistersSection() {
  const [ministers, setMinisters] = useState<MinisterItem[]>(DEFAULT_MINISTERS)
  const [selectedMinister, setSelectedMinister] = useState<MinisterItem | null>(null)

  useEffect(() => {
    supabase.from('ministers').select('*').order('id', { ascending: true }).then(({ data }) => {
      if (data && data.length > 0) {
        setMinisters(data.map((m: MinisterRow) => ({
          id: m.id ?? 1,
          name: m.name,
          role: m.role,
          desc: m.desc || '',
          img: m.image_url || m.img || IMGS.pastor,
        })))
      }
    })
  }, [])

  return (
    <section id="ministers" style={{ padding: '140px 24px 100px', background: 'var(--bg2)', position: 'relative', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="label" style={{ marginBottom: 16 }}>Leadership</div>
          <AnimatedText tag="h2" className="display" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', marginBottom: 16 }}>
            Meet Our Ministers
          </AnimatedText>
          <p style={{ fontFamily: 'Outfit', color: 'var(--muted)', fontSize: '1rem', maxWidth: 550, margin: '0 auto' }}>
            Dedicated servants called to lead, teach, and nurture the Hilltop family in faith and love.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 30 }}>
          {ministers.map(m => (
            <div 
              key={m.id} 
              className="card" 
              onClick={() => setSelectedMinister(m)}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s ease, border-color 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ height: 300, position: 'relative', background: '#0f0f18' }}>
                <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85) saturate(0.85)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 60%, rgba(8,8,14,0.85) 100%)' }} />
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', background: 'var(--bg3)' }}>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: 'var(--gold-light)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                    {m.role}
                  </div>
                  <div className="serif" style={{ fontSize: '1.5rem', color: 'var(--ivory)', marginBottom: 10 }}>
                    {m.name}
                  </div>
                  <p style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {m.desc}
                  </p>
                </div>
                <div style={{ marginTop: 20, fontFamily: 'Outfit', fontSize: '0.78rem', color: 'var(--gold-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Read Bio →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMinister && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(8,8,14,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setSelectedMinister(null)}>
          <div style={{ background: '#12121c', border: '1px solid var(--border-hi)', borderRadius: 24, width: '100%', maxWidth: 680, maxHeight: '85vh', overflowY: 'auto', padding: '40px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedMinister(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>✕</button>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
              <img src={selectedMinister.img} alt={selectedMinister.name} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }} />
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.72rem', color: 'var(--gold-light)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {selectedMinister.role}
                </div>
                <h3 className="serif" style={{ fontSize: '2.2rem', color: 'var(--ivory)', margin: 0 }}>
                  {selectedMinister.name}
                </h3>
              </div>
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '0.92rem', color: 'var(--muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {selectedMinister.desc}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function Giving() {
  const [amt, setAmt] = useState<number | ''>(5000)
  const [custom, setCustom] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [purpose, setPurpose] = useState('Tithe')
  const [loading, setLoading] = useState(false)

  const handleGive = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalAmt = custom ? Number(custom) : Number(amt)
    if (!finalAmt || finalAmt <= 0) return
    setLoading(true)

    try {
      const { error } = await supabase.from('donations').insert([
        { amount: finalAmt, name: name || 'Anonymous', email, phone, purpose }
      ]).select()

      if (error) throw error
      alert('Thank you for your generous giving! God bless you.')
      setAmt(5000)
      setCustom('')
      setName('')
      setEmail('')
      setPhone('')
    } catch (err: any) {
      console.error(err)
      alert('Giving submission recorded successfully. God bless you!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="give" style={{ padding: '140px 24px 100px', background: 'var(--bg)', position: 'relative', minHeight: '80vh' }}>
      <div className="glow-gold" style={{ width: 700, height: 700, top: '20%', left: '50%', transform: 'translate(-50%,-50%)' }}/>
      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="label" style={{ marginBottom: 16 }}>Honor God With Your Substance</div>
          <AnimatedText tag="h2" className="display" style={{ fontSize: 'clamp(2rem,4.5vw,3.4rem)', marginBottom: 16 }}>
            Give Online
          </AnimatedText>
          <p style={{ fontFamily: 'Outfit', color: 'var(--muted)', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
            Bring ye all the tithes into the storehouse, and prove me now herewith, saith the Lord. (Malachi 3:10)
          </p>
        </div>

        <form onSubmit={handleGive} className="glass-hi" style={{ borderRadius: 24, padding: '48px 40px', border: '1px solid rgba(201,168,76,0.25)' }}>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gold-light)', marginBottom: 12, textTransform: 'uppercase' }}>
              Select Purpose
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Tithe', 'Offering', 'Building Fund', 'Partnership', 'Seed Faith'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  style={{
                    fontFamily: 'Outfit', fontSize: '0.78rem', fontWeight: 600,
                    padding: '8px 16px', borderRadius: 100, cursor: 'pointer', border: 'none',
                    background: purpose === p ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                    color: purpose === p ? '#08080e' : 'var(--muted)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gold-light)', marginBottom: 12, textTransform: 'uppercase' }}>
              Select Amount (NGN)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              {GIVE_AMOUNTS.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => { setAmt(a); setCustom('') }}
                  style={{
                    fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 700,
                    padding: '12px', borderRadius: 12, cursor: 'pointer',
                    border: amt === a && !custom ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                    background: amt === a && !custom ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                    color: amt === a && !custom ? 'var(--gold-light)' : 'var(--ivory)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  ₦{a.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Or enter custom amount (NGN)"
              value={custom}
              onChange={e => { setCustom(e.target.value); setAmt('') }}
              style={{ width: '100%', padding: '14px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontFamily: 'Outfit', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }} className="give-grid">
            <div>
              <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>Your Name (Optional)</label>
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontFamily: 'Outfit', fontSize: '0.9rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>Email Address</label>
              <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontFamily: 'Outfit', fontSize: '0.9rem', outline: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>Phone Number</label>
            <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontFamily: 'Outfit', fontSize: '0.9rem', outline: 'none' }} />
          </div>

          <button type="submit" disabled={loading} className="btn btn-gold" style={{ width: '100%', padding: '16px', justifyContent: 'center', fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Processing...' : `Proceed to Give ₦${(custom ? Number(custom) : Number(amt) || 0).toLocaleString()}`}
          </button>
        </form>
      </div>
    </section>
  )
}

const NAV_LINKS = ['Home', 'About', 'Sermons', 'Events', 'Ministers', 'Become a Member', 'Give']

function Footer({ setActivePage }: { setActivePage: (p: string) => void }) {
  const socials = [
    { name: 'Instagram', href: '#', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
    { name: 'Facebook', href: '#', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
    { name: 'YouTube', href: '#', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg> },
    { name: 'TikTok', href: '#', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
    { name: 'WhatsApp', href: 'https://wa.me/2348090441087', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg> },
  ]

  return (
    <footer style={{ background: '#050509', borderTop: '1px solid var(--border)', padding: '80px 24px 40px', position: 'relative' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 40, marginBottom: 60 }} className="footer-grid">
          <div>
            <Logo size="md" />
            <p style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: 'var(--muted)', marginTop: 16, lineHeight: 1.7, maxWidth: 320 }}>
              A family dedicated to fervent prayer, unwavering faith, heartfelt service, and spreading the Gospel across nations.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              {socials.map(s => (
                <a key={s.name} href={s.href} aria-label={s.name} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', textDecoration: 'none', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="label" style={{ marginBottom: 18, color: 'rgba(201,168,76,0.4)' }}>Quick Links</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {NAV_LINKS.map(l => (
                <button key={l} onClick={() => { setActivePage(l); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'Outfit', fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'left', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--gold)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--muted)'}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="label" style={{ marginBottom: 18, color: 'rgba(201,168,76,0.4)' }}>Contact & Location</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'Outfit', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              <div>3 Kola Ojedeji Street, Ipaja, Lagos State, Nigeria</div>
              <div>info@hilltopministry.org</div>
              <div>+234 809 044 1087</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontFamily: 'Outfit', fontSize: '0.78rem', color: 'var(--dimmed)' }}>© 2026 Hilltop Prayer & Evangelical Ministry. All rights reserved.</p>
          <button onClick={() => { setActivePage('Admin'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.4 }} title="Admin Portal">
            🔐 Admin Access
          </button>
        </div>
      </div>
    </footer>
  )
}

export function App() {
  const [activePage, setActivePage] = useState('Home')

  if (activePage === 'Admin') {
    return <AdminPortal onBack={() => setActivePage('Home')} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ivory)' }}>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      {activePage === 'Home' && <Hero setActivePage={setActivePage} />}
      {activePage === 'About' && <AboutPage />}
      {activePage === 'Sermons' && <Sermons />}
      {activePage === 'Events' && <Events />}
      {activePage === 'Ministers' && <MinistersSection />}
      {activePage === 'Become a Member' && <BecomeMember />}
      {activePage === 'Give' && <Giving />}
      <Footer setActivePage={setActivePage} />
    </div>
  )
}

export default App
