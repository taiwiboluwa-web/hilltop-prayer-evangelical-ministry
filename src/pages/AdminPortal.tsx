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

  // --- Fetch Functions ---
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

  // --- Auth & General Handlers ---
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

  // --- Minister Slot Handling ---
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

  // --- Gallery Dynamic Actions ---
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

  // --- Sermon Actions ---
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

  // --- Live Stream Actions ---
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

  // --- Audio Actions ---
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
      <div className="min-h-screen bg-[#050508] text-[#dfb755] flex items-center justify-center font-['Outfit',sans-serif]">
        <div className="text-center">
          <div className="w-8 h-8 border-[3px] border-[#dfb755]/20 border-t-[#dfb755] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm tracking-wide">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4 font-['Outfit',sans-serif]">
        <div className="w-full max-w-[420px] bg-[#0c0c14] border border-[#dfb755]/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-7">
            <h2 className="text-[#f5f2eb] text-center text-xl font-bold m-0 tracking-wide">Admin Portal Access</h2>
            <button onClick={onBack} className="bg-white/5 border border-white/10 text-[#f5f2eb]/80 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-medium hover:bg-white/10 transition-all">
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
              <label className="block text-[#dfb755] text-[10px] font-bold mb-2 tracking-[0.1em] uppercase">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-white/[0.03] border border-[#dfb755]/20 rounded-xl text-white box-border outline-none text-sm focus:border-[#dfb755] transition-all" placeholder="admin@ministry.com" />
            </div>
            <div>
              <label className="block text-[#dfb755] text-[10px] font-bold mb-2 tracking-[0.1em] uppercase">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-white/[0.03] border border-[#dfb755]/20 rounded-xl text-white box-border outline-none text-sm focus:border-[#dfb755] transition-all" placeholder="••••••••" />
            </div>
            <button type="submit" className="py-3.5 bg-gradient-to-r from-[#dfb755] to-[#c59938] text-[#06060a] border-none rounded-xl font-bold cursor-pointer mt-2 text-sm tracking-wider shadow-lg shadow-[#dfb755]/10 hover:brightness-105 transition-all">
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
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(223,183,85,0.18)',
    borderRadius: '10px',
    color: '#f5f2eb',
    fontSize: '13px',
    boxSizing: 'border-box',
    marginBottom: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const fileInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#06060a',
    border: '1px dashed rgba(223,183,85,0.3)',
    borderRadius: '10px',
    color: 'rgba(245,242,235,0.5)',
    fontSize: '12px',
    boxSizing: 'border-box',
    marginBottom: '14px',
    cursor: 'pointer',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'rgba(223,183,85,0.85)',
    fontSize: '10px',
    fontWeight: '700',
    marginBottom: '5px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  };

  return (
    <div className="min-h-screen bg-[#050508] text-[#f5f2eb] font-['Outfit',sans-serif] flex">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-[260px] bg-[#080810] border-r border-[#dfb755]/10 flex flex-col justify-between fixed top-0 bottom-0 left-0 z-20 select-none">
        <div>
          {/* Logo Area */}
          <div className="p-6 border-b border-[#dfb755]/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#dfb755] to-[#9a7828] flex items-center justify-center font-black text-[#050508] text-base shadow-md shadow-[#dfb755]/20">
              ✦
            </div>
            <div>
              <span className="block font-black text-xs tracking-wider text-[#dfb755] uppercase">Admin</span>
              <span className="block text-sm font-bold text-[#f5f2eb] tracking-tight">Dashboard</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4 flex flex-col gap-1.5">
            <span className="px-3 text-[10px] font-bold tracking-[0.15em] text-[#dfb755]/60 uppercase mb-2 mt-2">Views</span>
            {[
              { id: 'ministers', label: 'Ministers', icon: '⚡' },
              { id: 'gallery', label: 'Gallery Moments', icon: '🖼️' },
              { id: 'videos', label: 'Video Sermons', icon: '📺' },
              { id: 'live', label: 'Live Broadcast', icon: '🔴' },
              { id: 'audio', label: 'Audio Messages', icon: '🎧' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#dfb755]/10 border border-[#dfb755]/30 text-[#f4d688] shadow-sm shadow-[#dfb755]/5'
                      : 'bg-transparent border border-transparent text-[#f5f2eb]/60 hover:bg-white/[0.03] hover:text-[#f5f2eb]'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom User info & Signout */}
        <div className="p-4 border-t border-[#dfb755]/10 bg-[#06060a]/50">
          <div className="text-[11px] text-[#f5f2eb]/40 truncate mb-3 px-2 font-mono">
            {email || 'taiwiboluwa@gmail.com'}
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-white/5 border border-white/10 text-[#f5f2eb]/80 rounded-xl font-bold text-xs hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-[260px] min-h-screen bg-[#050508] flex flex-col">
        
        {/* Top Navbar Header */}
        <header className="h-[76px] bg-[#080810]/80 backdrop-blur-md border-b border-[#dfb755]/10 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="bg-white/5 border border-white/10 text-[#dfb755] px-3.5 py-2 rounded-lg cursor-pointer font-semibold text-xs transition-all hover:bg-[#dfb755]/15"
            >
              ← Back to Home
            </button>
            <h1 className="text-lg font-extrabold m-0 text-[#f5f2eb] tracking-tight uppercase">
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
              className={`px-4 py-2.5 rounded-xl border-none font-bold cursor-pointer flex items-center gap-2 text-xs transition-all shadow-md ${
                isDeploying ? 'bg-gray-700 cursor-not-allowed opacity-60' : 'bg-gradient-to-r from-[#10b981] to-[#059669] text-white hover:brightness-110 shadow-emerald-900/20'
              }`}
            >
              <span>⚡</span> {isDeploying ? 'Deploying...' : 'Deploy Live Site'}
            </button>
          </div>
        </header>

        {/* Content Body Container */}
        <div className="p-8 max-w-[1280px] w-full mx-auto flex-1">
          
          {uploadProgress && (
            <div className="bg-[#dfb755]/10 border border-[#dfb755] text-[#f4d688] p-3 rounded-xl text-xs mb-6 text-center font-medium shadow-md">
              {uploadProgress}
            </div>
          )}

          {/* TAB 1: MINISTERS MANAGEMENT */}
          {activeTab === 'ministers' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-6">
              <form onSubmit={handleSaveMinister} className="bg-[#0b0b14] border border-[#dfb755]/15 p-6 rounded-2xl shadow-xl">
                <h3 className="text-base font-bold m-0 mb-4 text-[#f4d688] flex items-center gap-2">
                  <span>✦</span> Edit Minister Slot #{selectedSlotOrder}
                </h3>

                <label style={labelStyle}>Select Minister Slot</label>
                <select
                  style={{ ...inputStyle, backgroundColor: '#10101c', color: '#f4d688', fontWeight: '600', cursor: 'pointer' }}
                  value={selectedSlotOrder}
                  onChange={(e) => handleSlotChange(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((slotNum) => {
                    const m = ministers.find((item) => (item.display_order ?? item.id) === slotNum);
                    return (
                      <option key={slotNum} value={slotNum}>
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

                <label style={labelStyle}>About Me (Biography / Profile Description)</label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical' }}
                  rows={3}
                  value={mDescText}
                  onChange={(e) => setMDescText(e.target.value)}
                  placeholder="Write full biography or brief description..."
                />

                <label style={labelStyle}>Upload Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  style={fileInputStyle}
                  onChange={(e) => handleFileUpload(e, 'media', setMImageUrl)}
                />

                <label style={labelStyle}>Or Picture URL</label>
                <input
                  style={inputStyle}
                  value={mImageUrl}
                  onChange={(e) => setMImageUrl(e.target.value)}
                  placeholder="https://..."
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#dfb755] to-[#c59938] text-[#06060a] border-none rounded-xl font-bold cursor-pointer mt-2 text-xs tracking-wider shadow-md hover:brightness-105 transition-all"
                >
                  Save Changes to Slot {selectedSlotOrder}
                </button>
              </form>

              <div className="bg-[#0b0b14] border border-[#dfb755]/15 p-6 rounded-2xl shadow-xl">
                <h3 className="text-base font-bold mb-4 text-[#f5f2eb]">
                  Minister Slots Overview
                </h3>
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4, 5].map((slotNum) => {
                    const m = ministers.find((item) => (item.display_order ?? item.id) === slotNum);
                    const isSelected = selectedSlotOrder === slotNum;

                    return (
                      <div
                        key={slotNum}
                        onClick={() => handleSlotChange(slotNum)}
                        className={`p-3.5 rounded-xl flex items-center gap-4 cursor-pointer transition-all ${
                          isSelected ? 'bg-[#dfb755]/10 border border-[#dfb755]' : 'bg-[#06060a] border border-[#dfb755]/15'
                        }`}
                      >
                        <img
                          src={m?.image_url || m?.img || 'https://via.placeholder.com/60?text=No+Photo'}
                          alt={m?.name || 'Open Slot'}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#dfb755]/40 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] bg-[#dfb755]/20 text-[#f4d688] px-2 py-0.5 rounded font-bold tracking-wider flex-shrink-0">
                              SLOT {slotNum}
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-[#f5f2eb] truncate">
                              {m?.name || 'Open Slot'}
                            </span>
                          </div>
                          <p className="m-0 text-[11px] text-[#f5f2eb]/50 truncate">
                            {m?.desc_text || m?.desc || 'No description provided.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSlotChange(slotNum);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] cursor-pointer font-bold flex-shrink-0 transition-all ${
                            isSelected ? 'bg-[#dfb755] text-[#06060a] border-none' : 'bg-[#dfb755]/10 border border-[#dfb755]/30 text-[#f4d688]'
                          }`}
                        >
                          {isSelected ? 'Editing' : 'Select'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GALLERY & MOMENTS MANAGEMENT */}
          {activeTab === 'gallery' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-6">
              <form onSubmit={handleAddGalleryItem} className="bg-[#0b0b14] border border-[#dfb755]/15 p-6 rounded-2xl shadow-xl">
                <h3 className="text-base font-bold m-0 mb-2 text-[#f4d688]">
                  Add New Gallery Photo
                </h3>
                <p className="text-xs text-[#f5f2eb]/60 mb-4 leading-relaxed">
                  Add photos and captions to display in the fellowship gallery section on the website.
                </p>

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

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#dfb755] to-[#c59938] text-[#06060a] border-none rounded-xl font-bold cursor-pointer mt-2 text-xs tracking-wider shadow-md hover:brightness-105 transition-all"
                >
                  Add Gallery Photo
                </button>
              </form>

              <div className="bg-[#0b0b14] border border-[#dfb755]/15 p-6 rounded-2xl shadow-xl">
                <h3 className="text-base font-bold mb-4 text-[#f5f2eb]">
                  Gallery Library ({galleryItems.length})
                </h3>
                <div className="flex flex-col gap-3 max-h-[540px] overflow-y-auto pr-1">
                  {galleryItems.length === 0 ? (
                    <p className="text-[#f5f2eb]/40 text-xs py-8 text-center">No gallery photos added yet.</p>
                  ) : (
                    galleryItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="bg-[#06060a] border border-[#dfb755]/15 p-3 rounded-xl flex items-center gap-4"
                      >
                        <img
                          src={item.image_url || 'https://via.placeholder.com/80?text=Gallery+Photo'}
                          alt={item.title || 'Gallery item'}
                          className="w-14 h-10 rounded-lg object-cover border border-[#dfb755]/40 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-[#dfb755]/20 text-[#f4d688] px-2 py-0.5 rounded font-bold flex-shrink-0">
                              #{index + 1}
                            </span>
                            <span className="font-bold text-xs text-[#f5f2eb] truncate">
                              {item.title}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryItem(item.id)}
                          className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs cursor-pointer font-bold flex-shrink-0 hover:bg-red-500/20 transition-all"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form onSubmit={handleAddSermon} className="bg-[#0b0b14] border border-[#dfb755]/15 p-6 rounded-2xl shadow-xl">
                <h3 className="text-base font-bold mb-4 text-[#f4d688]">Upload New Video Sermon</h3>
                
                <label style={labelStyle}>Sermon Title</label>
                <input style={inputStyle} value={vTitle} onChange={(e) => setVTitle(e.target.value)} placeholder="e.g. The Power of Persistent Prayer" required />

                <label style={labelStyle}>Preacher / Speaker</label>
                <input style={inputStyle} value={vSpeaker} onChange={(e) => setVSpeaker(e.target.value)} required />

                <label style={labelStyle}>Scripture Reference</label>
                <input style={inputStyle} value={vScripture} onChange={(e) => setVScripture(e.target.value)} placeholder="e.g. Luke 18:1-8" />

                <label style={labelStyle}>Category</label>
                <select style={{ ...inputStyle, backgroundColor: '#10101c', cursor: 'pointer' }} value={vCategory} onChange={(e) => setVCategory(e.target.value)}>
                  <option value="Faith">Faith</option>
                  <option value="Prayer">Prayer</option>
                  <option value="Healing">Healing</option>
                  <option value="Deliverance">Deliverance</option>
                  <option value="Evangelism">Evangelism</option>
                </select>

                <label style={labelStyle}>Upload Video File (PC/Phone)</label>
                <input type="file" accept="video/*" style={fileInputStyle} onChange={(e) => handleFileUpload(e, 'media', setVVideoUrl)} />

                <label style={labelStyle}>Or YouTube / Embed URL</label>
                <input style={inputStyle} value={vVideoUrl} onChange={(e) => setVVideoUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." required />

                <label style={labelStyle}>Upload Thumbnail Image (Optional)</label>
                <input type="file" accept="image/*" style={fileInputStyle} onChange={(e) => handleFileUpload(e, 'media', setVThumbnail)} />

                <label style={labelStyle}>Thumbnail URL</label>
                <input style={inputStyle} value={vThumbnail} onChange={(e) => setVThumbnail(e.target.value)} placeholder="https://..." />

                <label className="flex items-center gap-2.5 text-[#f5f2eb]/85 text-xs mb-4 cursor-pointer font-medium">
                  <input type="checkbox" checked={vIsFeatured} onChange={(e) => setVIsFeatured(e.target.checked)} className="w-4 h-4 accent-[#dfb755] cursor-pointer" />
                  Mark as Main Featured Sermon
                </label>

                <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#dfb755] to-[#c59938] text-[#06060a] border-none rounded-xl font-bold cursor-pointer text-xs tracking-wider shadow-md hover:brightness-105 transition-all">
                  Publish Sermon
                </button>
              </form>

              <div className="bg-[#0b0b14] border border-[#dfb755]/15 p-6 rounded-2xl shadow-xl">
                <h3 className="text-base font-bold mb-4 text-[#f5f2eb]">Existing Video Sermons ({sermons.length})</h3>
                <div className="flex flex-col gap-3 max-h-[540px] overflow-y-auto pr-1">
                  {sermons.length === 0 ? (
                    <p className="text-[#f5f2eb]/40 text-xs py-8 text-center">No video sermons uploaded yet.</p>
                  ) : (
                    sermons.map((s) => (
                      <div key={s.id} className="bg-[#06060a] border border-[#dfb755]/15 p-3.5 rounded-xl flex justify-between items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className={`m-0 font-bold text-xs truncate ${s.is_featured ? 'text-[#f4d688]' : 'text-[#f5f2eb]'}`}>
                            {s.is_featured ? '★ ' : ''}{s.title}
                          </p>
                          <p className="m-0 text-[11px] text-[#f5f2eb]/50 truncate mt-0.5">{s.speaker} • {s.category}</p>
                        </div>
                        <button onClick={() => handleDeleteSermon(s.id)} className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs cursor-pointer font-bold flex-shrink-0 hover:bg-red-500/20 transition-all">
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
            <div className="bg-[#0b0b14] border border-[#dfb755]/15 p-6 sm:p-8 rounded-2xl shadow-xl max-w-[650px]">
              <h3 className="text-base font-bold mb-4 text-[#f4d688]">Configure Live Broadcast</h3>
              <form onSubmit={handleUpdateLive}>
                <label style={labelStyle}>Live Event Title</label>
                <input style={inputStyle} value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} required />

                <label style={labelStyle}>YouTube Live Stream Embed URL</label>
                <input style={inputStyle} value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://www.youtube.com/embed/live_stream?channel=..." required />

                <label className="flex items-center gap-2.5 text-[#f5f2eb]/85 text-xs mb-6 cursor-pointer font-medium">
                  <input type="checkbox" checked={isLiveActive} onChange={(e) => setIsLiveActive(e.target.checked)} className="w-4 h-4 accent-[#10b981] cursor-pointer" />
                  Service is Currently LIVE (Displays Live Badge on Website)
                </label>

                <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white border-none rounded-xl font-bold cursor-pointer text-xs tracking-wider shadow-md hover:brightness-105 transition-all">
                  Save Live Stream Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: AUDIO SERMONS */}
          {activeTab === 'audio' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form onSubmit={handleAddAudio} className="bg-[#0b0b14] border border-[#dfb755]/15 p-6 rounded-2xl shadow-xl">
                <h3 className="text-base font-bold mb-4 text-[#f4d688]">Add Audio Sermon</h3>

                <label style={labelStyle}>Audio Title</label>
                <input style={inputStyle} value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder="e.g. Praying the Word of God" required />

                <label style={labelStyle}>Speaker</label>
                <input style={inputStyle} value={aSpeaker} onChange={(e) => setASpeaker(e.target.value)} required />

                <label style={labelStyle}>Episode Label</label>
                <input style={inputStyle} value={aEpisode} onChange={(e) => setAEpisode(e.target.value)} placeholder="Ep. 1" />

                <label style={labelStyle}>Duration</label>
                <input style={inputStyle} value={aDuration} onChange={(e) => setADuration(e.target.value)} placeholder="42:15" />

                <label style={labelStyle}>Upload Audio Track (MP3/M4A)</label>
                <input type="file" accept="audio/*" style={fileInputStyle} onChange={(e) => handleFileUpload(e, 'media', aAudioUrl => setAAudioUrl(aAudioUrl))} />

                <label style={labelStyle}>Or Audio MP3 URL</label>
                <input style={inputStyle} value={aAudioUrl} onChange={(e) => setAAudioUrl(e.target.value)} placeholder="https://..." required />

                <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#dfb755] to-[#c59938] text-[#06060a] border-none rounded-xl font-bold cursor-pointer text-xs tracking-wider shadow-md hover:brightness-105 transition-all">
                  Add Audio Track
                </button>
              </form>

              <div className="bg-[#0b0b14] border border-[#dfb755]/15 p-6 rounded-2xl shadow-xl">
                <h3 className="text-base font-bold mb-4 text-[#f5f2eb]">Audio Library ({audioList.length})</h3>
                <div className="flex flex-col gap-3 max-h-[540px] overflow-y-auto pr-1">
                  {audioList.length === 0 ? (
                    <p className="text-[#f5f2eb]/40 text-xs py-8 text-center">No audio tracks uploaded yet.</p>
                  ) : (
                    audioList.map((a) => (
                      <div key={a.id} className="bg-[#06060a] border border-[#dfb755]/15 p-3.5 rounded-xl flex justify-between items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="m-0 font-bold text-xs text-[#f5f2eb] truncate">{a.title}</p>
                          <p className="m-0 text-[11px] text-[#f5f2eb]/50 truncate mt-0.5">{a.episode} • {a.duration}</p>
                        </div>
                        <button onClick={() => handleDeleteAudio(a.id)} className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs cursor-pointer font-bold flex-shrink-0 hover:bg-red-500/20 transition-all">
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
