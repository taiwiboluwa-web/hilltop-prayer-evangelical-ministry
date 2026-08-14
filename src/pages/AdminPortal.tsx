import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface Sermon {
  id: string;
  title: string;
  speaker: string;
  scripture: string;
  category: string;
  video_url: string;
  thumbnail_url: string;
  is_featured: boolean;
  created_at: string;
}

interface AudioSermon {
  id: string;
  title: string;
  speaker: string;
  episode: string;
  duration: string;
  audio_url: string;
}

interface Minister {
  id: number;
  name: string;
  role: string;
  icon?: string;
  desc?: string;
  desc_text?: string;
  image_url: string;
  img?: string;
  display_order: number;
}

interface GalleryItem {
  id: string | number;
  title: string;
  image_url: string;
  created_at?: string;
}

interface AdminPortalProps {
  onBack: () => void;
}

export function AdminPortal({ onBack }: AdminPortalProps) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ministers' | 'gallery' | 'videos' | 'live' | 'audio'>('ministers');

  // Sidebar Collapse State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Deployment States
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Minister Form & Data States
  const [ministers, setMinisters] = useState<Minister[]>([]);
  const [selectedSlotOrder, setSelectedSlotOrder] = useState<number>(1);
  const [mName, setMName] = useState('');
  const [mRole, setMRole] = useState('');
  const [mDescText, setMDescText] = useState('');
  const [mImageUrl, setMImageUrl] = useState('');

  // Gallery Form & Data States (Dynamic List)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [gTitle, setGTitle] = useState('');
  const [gImageUrl, setGImageUrl] = useState('');

  // Video Form States
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [vTitle, setVTitle] = useState('');
  const [vSpeaker, setVSpeaker] = useState('Pastor Emmanuel Adeyemi');
  const [vScripture, setVScripture] = useState('');
  const [vCategory, setVCategory] = useState('Faith');
  const [vVideoUrl, setVVideoUrl] = useState('');
  const [vThumbnail, setVThumbnail] = useState('');
  const [vIsFeatured, setVIsFeatured] = useState(false);

  // Live Stream States
  const [liveTitle, setLiveTitle] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [isLiveActive, setIsLiveActive] = useState(false);

  // Audio Form States
  const [audioList, setAudioList] = useState<AudioSermon[]>([]);
  const [aTitle, setATitle] = useState('');
  const [aSpeaker, setASpeaker] = useState('Pastor Emmanuel Adeyemi');
  const [aEpisode, setAEpisode] = useState('Ep. 1');
  const [aDuration, setADuration] = useState('45:00');
  const [aAudioUrl, setAAudioUrl] = useState('');

  const checkUserAdminStatus = async () => {
    setLoading(true);
    setAuthError('');
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (user.email === 'taiwiboluwa@gmail.com' || profile?.role === 'admin' || user.user_metadata?.role === 'admin') {
        setIsAdmin(true);
        loadDashboardData();
      } else {
        setAuthError('Access Denied: Account is not assigned as Admin in database.');
        setIsAdmin(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred checking authentication.');
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserAdminStatus();
  }, []);

  const loadDashboardData = async () => {
    fetchMinisters();
    fetchGallery();
    fetchSermons();
    fetchLiveStream();
    fetchAudio();
  };

  const fetchMinisters = async () => {
    const { data } = await supabase.from('ministers').select('*').order('display_order', { ascending: true });
    if (data && data.length > 0) {
      setMinisters(data);
      const slotOne = data.find((m) => (m.display_order ?? m.id) === 1) || data[0];
      if (slotOne) {
        setMName(slotOne.name);
        setMRole(slotOne.role || '');
        setMDescText(slotOne.desc_text || slotOne.desc || '');
        setMImageUrl(slotOne.image_url || slotOne.img || '');
      }
    }
  };

  const fetchGallery = async () => {
    const { data } = await supabase.from('gallery_moments').select('*').order('created_at', { ascending: false });
    if (data) {
      setGalleryItems(data);
    }
  };

  const fetchSermons = async () => {
    const { data } = await supabase.from('sermons').select('*').order('created_at', { ascending: false });
    if (data) setSermons(data);
  };

  const fetchLiveStream = async () => {
    const { data } = await supabase.from('live_stream').select('*').eq('id', 1).maybeSingle();
    if (data) {
      setLiveTitle(data.title || '');
      setLiveUrl(data.stream_url || '');
      setIsLiveActive(data.is_live || false);
    }
  };

  const fetchAudio = async () => {
    const { data } = await supabase.from('audio_sermons').select('*').order('created_at', { ascending: false });
    if (data) setAudioList(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setAuthError(error.message);
      setLoading(false);
    } else {
      await checkUserAdminStatus();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucketName: string, setTargetUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress('Uploading file to cloud storage...');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      setTargetUrl(data.publicUrl);
      setUploadProgress('Upload complete!');
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (err: any) {
      alert('Upload failed: ' + err.message + '. Make sure bucket exists and is public in Supabase Storage.');
      setUploadProgress('');
    }
  };

  const handleTriggerDeploy = async () => {
    const deployHookUrl = 'https://api.vercel.com/v1/integrations/deploy/prj_Yij9Z5IGRxiUBFNiVJbzBAqpqqA2/L9JSap9y4V';

    if (!deployHookUrl) {
      alert('Deploy Hook URL missing!');
      return;
    }

    setIsDeploying(true);
    try {
      const res = await fetch(deployHookUrl, { method: 'POST' });
      if (res.ok) {
        alert('Deployment triggered successfully!');
      } else {
        alert('Failed to trigger deployment.');
      }
    } catch (err: any) {
      alert('Deployment error: ' + err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleSlotChange = (order: number) => {
    setSelectedSlotOrder(order);
    const existing = ministers.find((m) => (m.display_order ?? m.id) === order);
    if (existing) {
      setMName(existing.name);
      setMRole(existing.role || '');
      setMDescText(existing.desc_text || existing.desc || '');
      setMImageUrl(existing.image_url || existing.img || '');
    } else {
      setMName('');
      setMRole('');
      setMDescText('');
      setMImageUrl('');
    }
  };

  const handleSaveMinister = async (e: React.FormEvent) => {
    e.preventDefault();

    const existing = ministers.find((m) => (m.display_order ?? m.id) === selectedSlotOrder);

    const payload = {
      name: mName,
      role: mRole,
      desc: mDescText,
      desc_text: mDescText,
      image_url: mImageUrl,
      img: mImageUrl,
      display_order: selectedSlotOrder,
    };

    if (existing && existing.id) {
      const { error } = await supabase.from('ministers').update(payload).eq('id', existing.id);
      if (error) alert(error.message);
      else {
        alert(`Minister Slot ${selectedSlotOrder} updated successfully`);
        fetchMinisters();
      }
    } else {
      const { error } = await supabase.from('ministers').insert([payload]);
      if (error) alert(error.message);
      else {
        alert(`Minister Slot ${selectedSlotOrder} saved successfully`);
        fetchMinisters();
      }
    }
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('gallery_moments').insert([
      {
        title: gTitle,
        image_url: gImageUrl,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert('Gallery photo added successfully!');
      setGTitle('');
      setGImageUrl('');
      fetchGallery();
    }
  };

  const handleDeleteGalleryItem = async (id: string | number) => {
    if (confirm('Are you sure you want to remove this gallery photo?')) {
      const { error } = await supabase.from('gallery_moments').delete().eq('id', id);
      if (error) alert(error.message);
      else fetchGallery();
    }
  };

  const handleAddSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('sermons').insert([
      {
        title: vTitle,
        speaker: vSpeaker,
        scripture: vScripture,
        category: vCategory,
        video_url: vVideoUrl,
        thumbnail_url: vThumbnail,
        is_featured: vIsFeatured,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert('Sermon published successfully');
      setVTitle('');
      setVScripture('');
      setVVideoUrl('');
      setVThumbnail('');
      fetchSermons();
    }
  };

  const handleDeleteSermon = async (id: string) => {
    if (confirm('Are you sure you want to delete this sermon?')) {
      const { error } = await supabase.from('sermons').delete().eq('id', id);
      if (error) alert(error.message);
      else fetchSermons();
    }
  };

  const handleUpdateLive = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('live_stream').upsert({
      id: 1,
      title: liveTitle,
      stream_url: liveUrl,
      is_live: isLiveActive,
      updated_at: new Date().toISOString(),
    });

    if (error) alert(error.message);
    else alert('Live stream settings updated');
  };

  const handleAddAudio = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('audio_sermons').insert([
      {
        title: aTitle,
        speaker: aSpeaker,
        episode: aEpisode,
        duration: aDuration,
        audio_url: aAudioUrl,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert('Audio sermon added successfully');
      setATitle('');
      setAAudioUrl('');
      fetchAudio();
    }
  };

  const handleDeleteAudio = async (id: string) => {
    if (confirm('Are you sure you want to delete this audio message?')) {
      const { error } = await supabase.from('audio_sermons').delete().eq('id', id);
      if (error) alert(error.message);
      else fetchAudio();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f59e0b] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-8 h-8 border-[3px] border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm tracking-wide">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-[420px] bg-[#121212] border border-[#262626] rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-7">
            <h2 className="text-white text-center text-xl font-bold m-0 tracking-wide">Admin Portal Access</h2>
            <button onClick={onBack} className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-medium hover:bg-neutral-800 transition-all">
              ← Back
            </button>
          </div>
          
          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs mb-5 leading-relaxed">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[#f59e0b] text-[10px] font-bold mb-2 tracking-[0.1em] uppercase">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white box-border outline-none text-sm focus:border-[#f59e0b] transition-all" placeholder="admin@ministry.com" />
            </div>
            <div>
              <label className="block text-[#f59e0b] text-[10px] font-bold mb-2 tracking-[0.1em] uppercase">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white box-border outline-none text-sm focus:border-[#f59e0b] transition-all" placeholder="••••••••" />
            </div>
            <button type="submit" className="py-3.5 bg-[#f59e0b] text-[#0a0a0a] border-none rounded-xl font-bold cursor-pointer mt-2 text-sm tracking-wider shadow-lg shadow-amber-500/10 hover:bg-amber-400 transition-all">
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 15px',
    backgroundColor: '#171717',
    border: '1px solid #262626',
    borderRadius: '10px',
    color: '#f5f5f5',
    fontSize: '13px',
    boxSizing: 'border-box',
    marginBottom: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const fileInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#171717',
    border: '1px dashed #3f3f46',
    borderRadius: '10px',
    color: '#a1a1aa',
    fontSize: '12px',
    boxSizing: 'border-box',
    marginBottom: '14px',
    cursor: 'pointer',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#a1a1aa',
    fontSize: '11px',
    fontWeight: '700',
    marginBottom: '6px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans flex overflow-hidden">
      
      {/* LEFT SIDEBAR NAVIGATION (COLLAPSIBLE) */}
      <aside className={`bg-[#121212] border-r border-[#262626] flex flex-col justify-between fixed top-0 bottom-0 left-0 z-20 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div>
          {/* Logo / Header Area */}
          <div className="h-16 px-4 border-b border-[#262626] flex items-center justify-between">
            <div className={`flex items-center space-x-3 overflow-hidden ${isSidebarCollapsed ? 'hidden' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#f59e0b]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div className="truncate">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 block font-semibold">Admin Panel</span>
                <span className="text-sm font-bold text-white tracking-wide">Dashboard</span>
              </div>
            </div>
            {/* Collapse Toggle Button */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className={`w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition ${isSidebarCollapsed ? 'mx-auto' : ''}`}
            >
              <svg className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
            </button>
          </div>

          {/* Navigation Links with Circular Monochromatic Icon Containers */}
          <div className="p-3 space-y-1.5 overflow-y-auto">
            {!isSidebarCollapsed && (
              <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2 block">Views</span>
            )}
            {[
              { id: 'ministers', label: 'Ministers', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { id: 'gallery', label: 'Gallery Moments', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { id: 'videos', label: 'Video Sermons', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
              { id: 'live', label: 'Live Broadcast', icon: 'M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z' },
              { id: 'audio', label: 'Audio Messages', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  title={isSidebarCollapsed ? tab.label : undefined}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 border border-neutral-800 text-[#f59e0b] font-medium'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${isActive ? 'bg-neutral-950 border-neutral-800 text-[#f59e0b]' : 'bg-neutral-900/80 border-neutral-800/60 text-neutral-400'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}/></svg>
                  </div>
                  {!isSidebarCollapsed && <span className="truncate text-xs">{tab.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom User info & Signout */}
        <div className="p-3 border-t border-[#262626]">
          <div className={`bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 flex items-center justify-between ${isSidebarCollapsed ? 'justify-center p-2' : ''}`}>
            {!isSidebarCollapsed && (
              <div className="truncate mr-2">
                <span className="text-[11px] text-neutral-400 block truncate">{email || 'taiwiboluwa@gmail.com'}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-red-400 hover:bg-red-500/10 transition shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 flex flex-col h-screen overflow-hidden bg-[#0a0a0a] transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        
        {/* Top Navbar Header */}
        <header className="h-16 border-b border-[#262626] bg-[#121212] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-xs font-semibold text-neutral-400 hover:text-white transition flex items-center space-x-1.5 cursor-pointer bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              <span>Back to Home</span>
            </button>
            <span className="text-neutral-700">/</span>
            <h1 className="text-xs font-bold tracking-wider text-white uppercase">
              {activeTab === 'ministers' && 'Ministers Management'}
              {activeTab === 'gallery' && 'Fellowship Gallery Moments'}
              {activeTab === 'videos' && 'Video Sermons Repository'}
              {activeTab === 'live' && 'Live Broadcast Center'}
              {activeTab === 'audio' && 'Audio Messages Library'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerDeploy}
              disabled={isDeploying}
              className={`px-3.5 py-1.5 rounded-lg font-bold cursor-pointer flex items-center gap-2 text-xs transition-all border ${
                isDeploying ? 'bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{isDeploying ? 'Deploying...' : 'Deploy Live Site'}</span>
            </button>
          </div>
        </header>

        {/* Content Body Container */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {uploadProgress && (
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] p-3 rounded-xl text-xs mb-6 text-center font-medium shadow-md">
              {uploadProgress}
            </div>
          )}

          {/* TAB 1: MINISTERS MANAGEMENT */}
          {activeTab === 'ministers' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form Section */}
              <form onSubmit={handleSaveMinister} className="lg:col-span-7 bg-[#121212] border border-[#262626] p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#262626]">
                    <h2 className="text-xs font-bold text-white tracking-wide uppercase flex items-center space-x-2">
                      <span className="w-1.5 h-4 bg-[#f59e0b] rounded-full"></span>
                      <span>Edit Minister Slot #{selectedSlotOrder}</span>
                    </h2>
                  </div>

                  <label style={labelStyle}>Select Minister Slot</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={selectedSlotOrder}
                    onChange={(e) => handleSlotChange(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((slotNum) => {
                      const m = ministers.find((item) => (item.display_order ?? item.id) === slotNum);
                      return (
                        <option key={slotNum} value={slotNum} style={{ background: '#121212', color: '#fff' }}>
                          Slot {slotNum}: {m ? m.name : '(Open Slot)'}
                        </option>
                      );
                    })}
                  </select>

                  <label style={labelStyle}>Full Name</label>
                  <input
                    style={inputStyle}
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    placeholder="e.g. Pst. Emmanuel Oloya"
                    required
                  />

                  <label style={labelStyle}>Role / Title</label>
                  <input
                    style={inputStyle}
                    value={mRole}
                    onChange={(e) => setMRole(e.target.value)}
                    placeholder="e.g. Resident Pastor"
                  />

                  <label style={labelStyle}>About Me (Biography)</label>
                  <textarea
                    style={{ ...inputStyle, resize: 'none' }}
                    rows={3}
                    value={mDescText}
                    onChange={(e) => setMDescText(e.target.value)}
                    placeholder="Write full biography or brief description..."
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Upload Picture</label>
                      <input
                        type="file"
                        accept="image/*"
                        style={fileInputStyle}
                        onChange={(e) => handleFileUpload(e, 'media', setMImageUrl)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Or Picture URL</label>
                      <input
                        style={inputStyle}
                        value={mImageUrl}
                        onChange={(e) => setMImageUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#262626]">
                  <button
                    type="submit"
                    className="w-full bg-[#f59e0b] text-[#0a0a0a] font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-amber-400 transition shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    Save Changes to Slot {selectedSlotOrder}
                  </button>
                </div>
              </form>

              {/* Slots Overview List */}
              <div className="lg:col-span-5 bg-[#121212] border border-[#262626] p-6 rounded-2xl shadow-xl flex flex-col">
                <div className="pb-4 mb-4 border-b border-[#262626]">
                  <h2 className="text-xs font-bold text-white tracking-wide uppercase">Minister Slots Overview</h2>
                </div>
                <div className="space-y-3 overflow-y-auto pr-1 max-h-[500px]">
                  {[1, 2, 3, 4, 5].map((slotNum) => {
                    const m = ministers.find((item) => (item.display_order ?? item.id) === slotNum);
                    const isSelected = selectedSlotOrder === slotNum;

                    return (
                      <div
                        key={slotNum}
                        onClick={() => handleSlotChange(slotNum)}
                        className={`p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition ${
                          isSelected ? 'bg-neutral-900/90 border border-[#f59e0b]/60' : 'bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0 mr-3">
                          <div className="w-10 h-10 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                            {m?.image_url || m?.img ? (
                              <img src={m.image_url || m.img} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                            )}
                          </div>
                          <div className="truncate">
                            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isSelected ? 'text-[#f59e0b]' : 'text-neutral-500'}`}>Slot {slotNum}</span>
                            <h3 className="text-xs font-semibold text-white truncate">{m?.name || 'Open Slot'}</h3>
                            <p className="text-[11px] text-neutral-500 truncate max-w-[160px]">{m?.desc_text || m?.desc || 'No description provided.'}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition shrink-0 ${
                          isSelected ? 'bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b]' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}>
                          {isSelected ? 'Editing' : 'Select'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GALLERY & MOMENTS MANAGEMENT */}
          {activeTab === 'gallery' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form onSubmit={handleAddGalleryItem} className="lg:col-span-7 bg-[#121212] border border-[#262626] p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="pb-4 mb-6 border-b border-[#262626]">
                    <h2 className="text-xs font-bold text-white tracking-wide uppercase flex items-center space-x-2">
                      <span className="w-1.5 h-4 bg-[#f59e0b] rounded-full"></span>
                      <span>Add New Gallery Photo</span>
                    </h4>
                  </div>

                  <label style={labelStyle}>Caption / Title</label>
                  <input
                    style={inputStyle}
                    value={gTitle}
                    onChange={(e) => setGTitle(e.target.value)}
                    placeholder="e.g. Fervent Worship, Prayer & Intercession"
                    required
                  />

                  <label style={labelStyle}>Upload Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    style={fileInputStyle}
                    onChange={(e) => handleFileUpload(e, 'media', setGImageUrl)}
                  />

                  <label style={labelStyle}>Or Picture URL</label>
                  <input
                    style={inputStyle}
                    value={gImageUrl}
                    onChange={(e) => setGImageUrl(e.target.value)}
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="pt-6 mt-6 border-t border-[#262626]">
                  <button
                    type="submit"
                    className="w-full bg-[#f59e0b] text-[#0a0a0a] font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-amber-400 transition shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    Add Gallery Photo
                  </button>
                </div>
              </form>

              <div className="lg:col-span-5 bg-[#121212] border border-[#262626] p-6 rounded-2xl shadow-xl flex flex-col">
                <div className="pb-4 mb-4 border-b border-[#262626]">
                  <h2 className="text-xs font-bold text-white tracking-wide uppercase">Gallery Library ({galleryItems.length})</h2>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                  {galleryItems.length === 0 ? (
                    <p className="text-neutral-500 text-xs py-8 text-center">No gallery photos added yet.</p>
                  ) : (
                    galleryItems.map((item, index) => (
                      <div key={item.id} className="bg-neutral-900/60 border border-neutral-800/80 p-3 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <img src={item.image_url} alt="" className="w-12 h-10 rounded-lg object-cover border border-neutral-800 shrink-0" />
                          <div className="truncate">
                            <span className="text-[10px] text-neutral-500 block">#{index + 1}</span>
                            <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryItem(item.id)}
                          className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/20 transition cursor-pointer shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VIDEO SERMONS */}
          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form onSubmit={handleAddSermon} className="lg:col-span-7 bg-[#121212] border border-[#262626] p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="pb-4 mb-6 border-b border-[#262626]">
                    <h2 className="text-xs font-bold text-white tracking-wide uppercase flex items-center space-x-2">
                      <span className="w-1.5 h-4 bg-[#f59e0b] rounded-full"></span>
                      <span>Upload New Video Sermon</span>
                    </h2>
                  </div>

                  <label style={labelStyle}>Sermon Title</label>
                  <input style={inputStyle} value={vTitle} onChange={(e) => setVTitle(e.target.value)} placeholder="e.g. The Power of Persistent Prayer" required />

                  <label style={labelStyle}>Preacher / Speaker</label>
                  <input style={inputStyle} value={vSpeaker} onChange={(e) => setVSpeaker(e.target.value)} required />

                  <label style={labelStyle}>Scripture Reference</label>
                  <input style={inputStyle} value={vScripture} onChange={(e) => setVScripture(e.target.value)} placeholder="e.g. Luke 18:1-8" />

                  <label style={labelStyle}>Category</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={vCategory} onChange={(e) => setVCategory(e.target.value)}>
                    <option value="Faith" style={{ background: '#121212' }}>Faith</option>
                    <option value="Prayer" style={{ background: '#121212' }}>Prayer</option>
                    <option value="Healing" style={{ background: '#121212' }}>Healing</option>
                    <option value="Deliverance" style={{ background: '#121212' }}>Deliverance</option>
                    <option value="Evangelism" style={{ background: '#121212' }}>Evangelism</option>
                  </select>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Upload Video File</label>
                      <input type="file" accept="video/*" style={fileInputStyle} onChange={(e) => handleFileUpload(e, 'media', setVVideoUrl)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Or YouTube Embed URL</label>
                      <input style={inputStyle} value={vVideoUrl} onChange={(e) => setVVideoUrl(e.target.value)} placeholder="https://..." required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Upload Thumbnail</label>
                      <input type="file" accept="image/*" style={fileInputStyle} onChange={(e) => handleFileUpload(e, 'media', setVThumbnail)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Or Thumbnail URL</label>
                      <input style={inputStyle} value={vThumbnail} onChange={(e) => setVThumbnail(e.target.value)} placeholder="https://..." />
                    </div>
                  </div>

                  <label className="flex items-center space-x-2.5 text-neutral-300 text-xs cursor-pointer mt-2">
                    <input type="checkbox" checked={vIsFeatured} onChange={(e) => setVIsFeatured(e.target.checked)} className="w-4 h-4 accent-[#f59e0b] rounded cursor-pointer" />
                    <span>Mark as Main Featured Sermon</span>
                  </label>
                </div>

                <div className="pt-6 mt-6 border-t border-[#262626]">
                  <button type="submit" className="w-full bg-[#f59e0b] text-[#0a0a0a] font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-amber-400 transition shadow-lg shadow-amber-500/10 cursor-pointer">
                    Publish Sermon
                  </button>
                </div>
              </form>

              <div className="lg:col-span-5 bg-[#121212] border border-[#262626] p-6 rounded-2xl shadow-xl flex flex-col">
                <div className="pb-4 mb-4 border-b border-[#262626]">
                  <h2 className="text-xs font-bold text-white tracking-wide uppercase">Existing Video Sermons ({sermons.length})</h2>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                  {sermons.length === 0 ? (
                    <p className="text-neutral-500 text-xs py-8 text-center">No video sermons uploaded yet.</p>
                  ) : (
                    sermons.map((s) => (
                      <div key={s.id} className="bg-neutral-900/60 border border-neutral-800/80 p-3.5 rounded-xl flex justify-between items-center gap-3">
                        <div className="min-w-0 truncate">
                          <p className={`m-0 font-bold text-xs truncate ${s.is_featured ? 'text-[#f59e0b]' : 'text-white'}`}>
                            {s.is_featured ? '★ ' : ''}{s.title}
                          </p>
                          <p className="m-0 text-[11px] text-neutral-500 truncate mt-0.5">{s.speaker} • {s.category}</p>
                        </div>
                        <button onClick={() => handleDeleteSermon(s.id)} className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/20 transition cursor-pointer shrink-0">
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE STREAM */}
          {activeTab === 'live' && (
            <div className="max-w-xl mx-auto bg-[#121212] border border-[#262626] p-8 rounded-2xl shadow-xl">
              <div className="pb-4 mb-6 border-b border-[#262626]">
                <h2 className="text-xs font-bold text-white tracking-wide uppercase flex items-center space-x-2">
                  <span className="w-1.5 h-4 bg-[#f59e0b] rounded-full"></span>
                  <span>Configure Live Broadcast</span>
                </h2>
              </div>
              <form onSubmit={handleUpdateLive}>
                <label style={labelStyle}>Live Event Title</label>
                <input style={inputStyle} value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} required />

                <label style={labelStyle}>YouTube Live Stream Embed URL</label>
                <input style={inputStyle} value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." required />

                <label className="flex items-center space-x-2.5 text-neutral-300 text-xs mb-6 cursor-pointer">
                  <input type="checkbox" checked={isLiveActive} onChange={(e) => setIsLiveActive(e.target.checked)} className="w-4 h-4 accent-emerald-500 rounded cursor-pointer" />
                  <span>Service is Currently LIVE (Displays Live Badge on Website)</span>
                </label>

                <button type="submit" className="w-full py-3 bg-emerald-500 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/10 cursor-pointer">
                  Save Live Stream Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: AUDIO SERMONS */}
          {activeTab === 'audio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form onSubmit={handleAddAudio} className="lg:col-span-7 bg-[#121212] border border-[#262626] p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="pb-4 mb-6 border-b border-[#262626]">
                    <h2 className="text-xs font-bold text-white tracking-wide uppercase flex items-center space-x-2">
                      <span className="w-1.5 h-4 bg-[#f59e0b] rounded-full"></span>
                      <span>Add Audio Sermon</span>
                    </h2>
                  </div>

                  <label style={labelStyle}>Audio Title</label>
                  <input style={inputStyle} value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder="e.g. Praying the Word of God" required />

                  <label style={labelStyle}>Speaker</label>
                  <input style={inputStyle} value={aSpeaker} onChange={(e) => setASpeaker(e.target.value)} required />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Episode Label</label>
                      <input style={inputStyle} value={aEpisode} onChange={(e) => setAEpisode(e.target.value)} placeholder="Ep. 1" />
                    </div>
                    <div>
                      <label style={labelStyle}>Duration</label>
                      <input style={inputStyle} value={aDuration} onChange={(e) => setADuration(e.target.value)} placeholder="42:15" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Upload Audio File</label>
                      <input type="file" accept="audio/*" style={fileInputStyle} onChange={(e) => handleFileUpload(e, 'media', setAAudioUrl)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Or MP3 URL</label>
                      <input style={inputStyle} value={aAudioUrl} onChange={(e) => setAAudioUrl(e.target.value)} placeholder="https://..." required />
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#262626]">
                  <button type="submit" className="w-full bg-[#f59e0b] text-[#0a0a0a] font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-amber-400 transition shadow-lg shadow-amber-500/10 cursor-pointer">
                    Add Audio Track
                  </button>
                </div>
              </form>

              <div className="lg:col-span-5 bg-[#121212] border border-[#262626] p-6 rounded-2xl shadow-xl flex flex-col">
                <div className="pb-4 mb-4 border-b border-[#262626]">
                  <h2 className="text-xs font-bold text-white tracking-wide uppercase">Audio Library ({audioList.length})</h2>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                  {audioList.length === 0 ? (
                    <p className="text-neutral-500 text-xs py-8 text-center">No audio tracks uploaded yet.</p>
                  ) : (
                    audioList.map((a) => (
                      <div key={a.id} className="bg-neutral-900/60 border border-neutral-800/80 p-3.5 rounded-xl flex justify-between items-center gap-3">
                        <div className="min-w-0 truncate">
                          <p className="m-0 font-bold text-xs text-white truncate">{a.title}</p>
                          <p className="m-0 text-[11px] text-neutral-500 truncate mt-0.5">{a.episode} • {a.duration}</p>
                        </div>
                        <button onClick={() => handleDeleteAudio(a.id)} className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/20 transition cursor-pointer shrink-0">
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
