import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'

interface Application { id:string; name:string; email:string; phone:string|null; status:'new'|'contacted'|'joined'|'archived'; created_at:string }

export function AdminMemberApplications() {
  const [open, setOpen] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('member_applications').select('*').order('created_at', { ascending:false })
    setApplications((data || []) as Application[])
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(Boolean(data.session)))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(Boolean(s)))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => { if (open && session) load() }, [open, session])

  const updateStatus = async (id:string, status:Application['status']) => {
    await supabase.from('member_applications').update({ status }).eq('id', id)
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  if (!session) return null
  const newCount = applications.filter(a => a.status === 'new').length

  return <>
    <button onClick={() => setOpen(true)} aria-label="Open member applications" style={{position:'fixed',right:24,bottom:24,zIndex:80,height:46,padding:'0 16px',border:'1px solid rgba(217,173,76,.45)',background:'#11120f',color:'#f0ca70',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',boxShadow:'0 14px 35px rgba(0,0,0,.35)'}}>
      Member Applications {newCount > 0 && <span style={{display:'inline-grid',placeItems:'center',minWidth:20,height:20,marginLeft:8,borderRadius:99,background:'#d9ad4c',color:'#111',fontSize:10,fontWeight:800}}>{newCount}</span>}
    </button>
    {open && <div style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,.68)',display:'flex',justifyContent:'flex-end'}} onClick={e => { if(e.target===e.currentTarget)setOpen(false) }}>
      <aside style={{width:'min(760px,96vw)',height:'100%',overflowY:'auto',background:'#0b0c0a',borderLeft:'1px solid rgba(217,173,76,.2)',padding:28,color:'#eee8dc',fontFamily:'Inter,system-ui,sans-serif'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,borderBottom:'1px solid rgba(255,255,255,.08)',paddingBottom:18,marginBottom:18}}>
          <div><div style={{fontSize:9,letterSpacing:'.18em',textTransform:'uppercase',color:'#d9ad4c'}}>Hilltop Family</div><h2 style={{font:'500 27px Georgia,serif',margin:'6px 0'}}>Become a Member</h2><p style={{margin:0,color:'#777970',fontSize:11}}>People who have expressed an intention to join the ministry.</p></div>
          <button onClick={() => setOpen(false)} style={{background:'transparent',border:'1px solid rgba(255,255,255,.1)',color:'#aaa',width:38,height:38,cursor:'pointer'}}>×</button>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,color:'#777970',fontSize:10}}><span>{applications.length} application{applications.length===1?'':'s'}</span><button onClick={load} style={{background:'#151610',border:'1px solid rgba(217,173,76,.2)',color:'#d9ad4c',padding:'8px 11px',fontSize:9,textTransform:'uppercase'}}>Refresh</button></div>
        {loading ? <div style={{padding:40,textAlign:'center',color:'#777970'}}>Loading applications…</div> : applications.length===0 ? <div style={{padding:50,textAlign:'center',border:'1px dashed rgba(255,255,255,.1)',color:'#66685f'}}>No member applications yet.</div> : <div style={{display:'grid',gap:10}}>{applications.map(a => <div key={a.id} style={{padding:16,border:'1px solid rgba(255,255,255,.07)',background:'#10110e'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}><div><strong style={{fontSize:14,color:'#eee9de'}}>{a.name}</strong><div style={{fontSize:10,color:'#777970',marginTop:5}}>{new Date(a.created_at).toLocaleString('en-NG')}</div></div><select value={a.status} onChange={e => updateStatus(a.id,e.target.value as Application['status'])} style={{background:'#151610',border:'1px solid rgba(217,173,76,.2)',color:'#d9ad4c',padding:'7px 9px',fontSize:9}}><option value="new">New</option><option value="contacted">Contacted</option><option value="joined">Joined</option><option value="archived">Archived</option></select></div>
          <div style={{display:'grid',gap:7,marginTop:13,fontSize:11}}><a href={`mailto:${a.email}`} style={{color:'#d9ad4c'}}>{a.email}</a>{a.phone && <a href={`tel:${a.phone}`} style={{color:'#c8c4b9'}}>{a.phone}</a>}</div>
        </div>)}</div>}
      </aside>
    </div>}
  </>
}
