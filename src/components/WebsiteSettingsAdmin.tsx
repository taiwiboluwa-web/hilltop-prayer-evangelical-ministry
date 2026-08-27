import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

type ThemeMode = 'automatic' | 'default' | 'christmas' | 'new_year';

export function WebsiteSettingsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState<any>({ enabled: true, mode: 'automatic', christmas_start_month: 12, christmas_start_day: 1, christmas_end_month: 12, christmas_end_day: 31, new_year_start_month: 1, new_year_start_day: 1, new_year_end_month: 1, new_year_end_day: 7, christmas_animations_enabled: true, christmas_message: 'Merry Christmas from Hilltop Prayer & Evangelical Ministry', new_year_message: 'Happy New Year from Hilltop Prayer & Evangelical Ministry' });
  const [countdown, setCountdown] = useState<any>({ enabled: true, saturday_service_enabled: false, saturday_service_target: '', christmas_enabled: true, christmas_target_month: 12, christmas_target_day: 25, new_year_enabled: true, new_year_target_month: 1, new_year_target_day: 1, christmas_label: 'Christmas', new_year_label: 'New Year' });

  useEffect(() => {
    (async () => {
      try {
        const [{ data: t }, { data: c }] = await Promise.all([
          supabase.from('site_theme_settings').select('*').limit(1).maybeSingle(),
          supabase.from('countdown_settings').select('*').eq('id', 1).maybeSingle(),
        ]);
        if (t) setTheme((x:any) => ({ ...x, ...t }));
        if (c) setCountdown((x:any) => ({ ...x, ...c }));
      } finally { setLoading(false); }
    })();
  }, []);

  const save = async () => {
    setSaving(true); setMessage('');
    const { error: themeError } = await supabase.from('site_theme_settings').upsert({ id: 1, ...theme, updated_at: new Date().toISOString() });
    const { error: countdownError } = await supabase.from('countdown_settings').upsert({ id: 1, ...countdown, saturday_service_enabled: false, updated_at: new Date().toISOString() });
    setSaving(false);
    setMessage(themeError?.message || countdownError?.message || 'Website settings published successfully.');
  };

  const Toggle = ({ label, checked, onChange }: { label:string; checked:boolean; onChange:(v:boolean)=>void }) => <label className="admin-switch"><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/><i/>{label}</label>;
  if (loading) return <div className="admin-panel"><div className="admin-panel-body">Loading website settings…</div></div>;

  return <div>
    <div className="admin-heading-row"><div className="admin-heading"><h1>Website Settings</h1><p>Control the public site's seasonal themes, Christmas story and countdown timers.</p></div></div>
    {message && <div className="admin-panel" style={{padding:14,marginBottom:16,color:message.includes('successfully')?'#75c69c':'#db9999'}}>{message}</div>}
    <div className="admin-grid">
      <section className="admin-panel"><div className="admin-panel-head"><div><h2>🎄 Seasonal Themes</h2><span>Public website appearance</span></div></div><div className="admin-panel-body">
        <div className="admin-field"><label>Theme mode</label><select className="admin-select" value={theme.mode} onChange={e=>setTheme({...theme,mode:e.target.value as ThemeMode})}><option value="automatic">Automatic by date</option><option value="default">Default Hilltop</option><option value="christmas">Christmas</option><option value="new_year">New Year</option></select></div>
        <div style={{display:'grid',gap:12,marginBottom:16}}><Toggle label="Seasonal themes enabled" checked={!!theme.enabled} onChange={v=>setTheme({...theme,enabled:v})}/><Toggle label="Christmas story animations" checked={!!theme.christmas_animations_enabled} onChange={v=>setTheme({...theme,christmas_animations_enabled:v})}/></div>
        <div className="admin-form-grid">
          <div><div className="admin-field"><label>Christmas starts</label><input className="admin-input" type="date" value={`2026-${String(theme.christmas_start_month).padStart(2,'0')}-${String(theme.christmas_start_day).padStart(2,'0')}`} onChange={e=>{const d=new Date(e.target.value+'T00:00:00');setTheme({...theme,christmas_start_month:d.getMonth()+1,christmas_start_day:d.getDate()})}}/></div><div className="admin-field"><label>Christmas ends</label><input className="admin-input" type="date" value={`2026-${String(theme.christmas_end_month).padStart(2,'0')}-${String(theme.christmas_end_day).padStart(2,'0')}`} onChange={e=>{const d=new Date(e.target.value+'T00:00:00');setTheme({...theme,christmas_end_month:d.getMonth()+1,christmas_end_day:d.getDate()})}}/></div></div>
          <div><div className="admin-field"><label>New Year starts</label><input className="admin-input" type="date" value={`2026-${String(theme.new_year_start_month).padStart(2,'0')}-${String(theme.new_year_start_day).padStart(2,'0')}`} onChange={e=>{const d=new Date(e.target.value+'T00:00:00');setTheme({...theme,new_year_start_month:d.getMonth()+1,new_year_start_day:d.getDate()})}}/></div><div className="admin-field"><label>New Year ends</label><input className="admin-input" type="date" value={`2026-${String(theme.new_year_end_month).padStart(2,'0')}-${String(theme.new_year_end_day).padStart(2,'0')}`} onChange={e=>{const d=new Date(e.target.value+'T00:00:00');setTheme({...theme,new_year_end_month:d.getMonth()+1,new_year_end_day:d.getDate()})}}/></div></div>
        </div>
        <div className="admin-field"><label>Christmas message</label><input className="admin-input" value={theme.christmas_message||''} onChange={e=>setTheme({...theme,christmas_message:e.target.value})}/></div>
        <div className="admin-field"><label>New Year message</label><input className="admin-input" value={theme.new_year_message||''} onChange={e=>setTheme({...theme,new_year_message:e.target.value})}/></div>
        <p className="admin-helper">Christmas uses the white, green and red visual system. Automatic mode changes the public appearance without you having to remember the dates.</p>
      </div></section>
      <section className="admin-panel"><div className="admin-panel-head"><div><h2>⏱ Countdown Timers</h2><span>Control what appears publicly</span></div></div><div className="admin-panel-body">
        <Toggle label="Countdown system enabled" checked={!!countdown.enabled} onChange={v=>setCountdown({...countdown,enabled:v})}/><div style={{height:14}}/>
        <Toggle label="Christmas countdown" checked={!!countdown.christmas_enabled} onChange={v=>setCountdown({...countdown,christmas_enabled:v})}/><div className="admin-field" style={{marginTop:10}}><label>Christmas target</label><input className="admin-input" type="date" value={`2026-${String(countdown.christmas_target_month).padStart(2,'0')}-${String(countdown.christmas_target_day).padStart(2,'0')}`} onChange={e=>{const d=new Date(e.target.value+'T00:00:00');setCountdown({...countdown,christmas_target_month:d.getMonth()+1,christmas_target_day:d.getDate()})}}/></div>
        <Toggle label="New Year countdown" checked={!!countdown.new_year_enabled} onChange={v=>setCountdown({...countdown,new_year_enabled:v})}/><div className="admin-field" style={{marginTop:10}}><label>New Year target</label><input className="admin-input" type="date" value={`2026-${String(countdown.new_year_target_month).padStart(2,'0')}-${String(countdown.new_year_target_day).padStart(2,'0')}`} onChange={e=>{const d=new Date(e.target.value+'T00:00:00');setCountdown({...countdown,new_year_target_month:d.getMonth()+1,new_year_target_day:d.getDate()})}}/></div>
        <div style={{padding:12,background:'#171811',border:'1px solid rgba(217,173,76,.14)',marginTop:12}}><strong style={{fontSize:11,color:'#f0ca70'}}>Saturday Service countdown</strong><p className="admin-helper" style={{margin:'6px 0 0'}}>Kept disabled on the public website. You can still retain the setting for future use.</p></div>
        <div className="admin-field" style={{marginTop:14}}><label>Christmas label</label><input className="admin-input" value={countdown.christmas_label||''} onChange={e=>setCountdown({...countdown,christmas_label:e.target.value})}/></div><div className="admin-field"><label>New Year label</label><input className="admin-input" value={countdown.new_year_label||''} onChange={e=>setCountdown({...countdown,new_year_label:e.target.value})}/></div>
      </div></section>
    </div>
    <div className="admin-form-actions" style={{marginTop:18}}><button className="admin-btn gold" onClick={save} disabled={saving}>{saving?'Saving…':'Save & Publish Website Settings'}</button></div>
  </div>;
}
