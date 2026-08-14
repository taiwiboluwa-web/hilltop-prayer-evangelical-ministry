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
  const [activeTab, setActiveTab] = useState<'ministers' | 'videos' | 'live' | 'audio' | 'gallery'>('ministers');

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
      <div style={{ minHeight: '100vh', backgroundColor: '#06060a', color: '#dfb755', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid rgba(223,183,85,0.2)', borderTopColor: '#dfb755', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
          <p style={{ fontSize: '14px', letterSpacing: '0.05em' }}>Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#06060a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Outfit, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#0f0f18', border: '1px solid rgba(223,183,85,0.25)', borderRadius: '20px', padding: '36px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <h2 style={{ color: '#f5f2eb', textAlign: 'center', fontSize: '22px', fontWeight: '700', margin: 0, letterSpacing: '0.02em' }}>Admin Portal Access</h2>
            <button onClick={onBack} style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(245,242,235,0.8)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
              ← Back
            </button>
          </div>
          
          {authError && (
            <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', lineHeight: '1.4' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', color: '#dfb755', fontSize: '11px', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '13px 16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(223,183,85,0.25)', borderRadius: '10px', color: '#fff', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }} placeholder="admin@ministry.com" />
            </div>
            <div>
              <label style={{ display: 'block', color: '#dfb755', fontSize: '11px', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '13px 16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(223,183,85,0.25)', borderRadius: '10px', color: '#fff', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }} placeholder="••••••••" />
            </div>
            <button type="submit" style={{ padding: '14px', background: 'linear-gradient(135deg, #dfb755, #c59938)', color: '#06060a', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', fontSize: '14px', letterSpacing: '0.02em', boxShadow: '0 4px 15px rgba(223,183,85,0.2)' }}>
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(223,183,85,0.2)',
    borderRadius: '10px',
    color: '#f5f2eb',
    fontSize: '14px',
    boxSizing: 'border-box',
    marginBottom: '16px',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const fileInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#07070f',
    border: '1px dashed rgba(223,183,85,0.35)',
    borderRadius: '10px',
    color: 'rgba(245,242,235,0.6)',
    fontSize: '13px',
    boxSizing: 'border-box',
    marginBottom: '16px',
    cursor: 'pointer',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'rgba(223,183,85,0.9)',
    fontSize: '11px',
    fontWeight: '700',
    marginBottom: '6px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  };

  return (
    <div className="w-full min-h-screen bg-[#06060a] text-[#f5f2eb] px-4 sm:px-8 py-8 md:py-10 overflow-x-hidden font-['Outfit',sans-serif]">
      <div className="max-w-[1200px] mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-[rgba(223,183,85,0.15)] pb-6 mb-8 gap-5 bg-gradient-to-b from-[rgba(223,183,85,0.03)] to-transparent p-6 rounded-2xl">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <button
                onClick={onBack}
                className="bg-[rgba(223,183,85,0.1)] border border-[rgba(223,183,85,0.3)] text-[#dfb755] px-3.5 py-2 rounded-lg cursor-pointer font-semibold text-xs transition-all hover:bg-[rgba(223,183,85,0.2)]"
              >
                ← Back to Home
              </button>
              <h1 className="text-2xl sm:text-3xl font-extrabold m-0 text-[#f5f2eb] tracking-tight">
                Ministry Content Manager
              </h1>
            </div>
            <p className="text-[rgba(245,242,235,0.55)] text-xs sm:text-sm m-0">
              Manage ministers, fellowship gallery photos, video sermons, live broadcasts, and audio tracks in real-time.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={handleTriggerDeploy}
              disabled={isDeploying}
              className={`px-5 py-3 rounded-xl border-none font-bold cursor-pointer flex items-center gap-2 text-xs sm:text-sm transition-all shadow-lg ${
                isDeploying ? 'bg-gray-700 cursor-not-allowed opacity-60' : 'bg-gradient-to-r from-[#10b981] to-[#059669] text-white hover:brightness-110 shadow-emerald-900/20'
              }`}
            >
              <span>⚡</span> {isDeploying ? 'Deploying...' : 'Deploy Live Site'}
            </button>

            <button onClick={handleLogout} className="bg-white/5 border border-white/10 text-[rgba(245,242,235,0.75)] px-4 py-3 rounded-xl cursor-pointer font-semibold text-xs sm:text-sm hover:bg-white/10 transition-all">
              Sign Out
            </button>
          </div>
        </div>

        {uploadProgress && (
          <div className="bg-[rgba(223,183,85,0.15)] border border-[#dfb755] text-[#f4d688] p-3.5 rounded-xl text-xs sm:text-sm mb-6 text-center font-medium shadow-md">
            {uploadProgress}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2.5 mb-8 border-b border-[rgba(223,183,85,0.15)] pb-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'ministers', label: '⚡ Ministers' },
            { id: 'gallery', label: '🖼️ Fellowship Gallery' },
            { id: 'videos', label: '📺 Video Sermons' },
            { id: 'live', label: '🔴 Live Broadcast' },
            { id: 'audio', label: '🎧 Audio Messages' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all ${
                activeTab === tab.id 
                  ? 'border border-[rgba(223,183,85,0.5)] bg-[rgba(223,183,85,0.15)] text-[#f4d688] shadow-md shadow-[#dfb755]/10' 
                  : 'border border-transparent bg-[rgba(255,255,255,0.02)] text-[rgba(245,242,235,0.6)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f5f2eb]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: MINISTERS MANAGEMENT */}
        {activeTab === 'ministers' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-8">
            <form onSubmit={handleSaveMinister} className="bg-[#0f0f18] border border-[rgba(223,183,85,0.2)] p-6 sm:p-7 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold m-0 mb-5 text-[#f4d688] flex items-center gap-2">
                <span>✦</span> Edit Minister Slot #{selectedSlotOrder}
              </h3>

              <label style={labelStyle}>Select Minister Slot</label>
              <select
                style={{ ...inputStyle, backgroundColor: '#131320', color: '#f4d688', fontWeight: '600', cursor: 'pointer' }}
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
                rows={4}
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
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #dfb755, #c59938)',
                  color: '#06060a',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '10px',
                  fontSize: '14px',
                  boxShadow: '0 4px 15px rgba(223,183,85,0.25)',
                }}
              >
                Save Changes to Slot {selectedSlotOrder}
              </button>
            </form>

            <div className="bg-[#0f0f18] border border-[rgba(223,183,85,0.2)] p-6 sm:p-7 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold mb-5 text-[#f5f2eb]">
                Minister Slots Overview
              </h3>
              <div className="flex flex-col gap-3.5">
                {[1, 2, 3, 4, 5].map((slotNum) => {
                  const m = ministers.find((item) => (item.display_order ?? item.id) === slotNum);
                  const isSelected = selectedSlotOrder === slotNum;

                  return (
                    <div
                      key={slotNum}
                      onClick={() => handleSlotChange(slotNum)}
                      style={{
                        backgroundColor: isSelected ? 'rgba(223,183,85,0.08)' : '#080811',
                        border: isSelected ? '1px solid #dfb755' : '1px solid rgba(223,183,85,0.15)',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <img
                        src={m?.image_url || m?.img || 'https://via.placeholder.com/60?text=No+Photo'}
                        alt={m?.name || 'Open Slot'}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid rgba(223,183,85,0.4)',
                          flexShrink: 0,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1">
                          <span
                            style={{
                              fontSize: '10px',
                              background: 'rgba(223,183,85,0.2)',
                              color: '#f4d688',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: '700',
                              letterSpacing: '0.05em',
                              flexShrink: 0,
                            }}
                          >
                            SLOT {slotNum}
                          </span>
                          <span className="font-bold text-sm sm:text-base text-[#f5f2eb] truncate">
                            {m?.name || 'Open Slot'}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '12px',
                            color: 'rgba(245,242,235,0.5)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {m?.desc_text || m?.desc || 'No description provided.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSlotChange(slotNum);
                        }}
                        style={{
                          backgroundColor: isSelected ? '#dfb755' : 'rgba(223,183,85,0.12)',
                          border: isSelected ? 'none' : '1px solid rgba(223,183,85,0.3)',
                          color: isSelected ? '#06060a' : '#f4d688',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '700',
                          flexShrink: 0,
                          transition: 'all 0.2s',
                        }}
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
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-8">
            <form onSubmit={handleAddGalleryItem} className="bg-[#0f0f18] border border-[rgba(223,183,85,0.2)] p-6 sm:p-7 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold m-0 mb-3 text-[#f4d688]">
                Add New Gallery Photo
              </h3>
              <p className="text-xs sm:text-sm text-[rgba(245,242,235,0.6)] mb-5 leading-relaxed">
                Add unlimited photos and captions to display in the &quot;A Glimpse Into Our Fellowship&quot; section on the website homepage.
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
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #dfb755, #c59938)',
                  color: '#06060a',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '10px',
                  fontSize: '14px',
                  boxShadow: '0 4px 15px rgba(223,183,85,0.25)',
                }}
              >
                Add Gallery Photo
              </button>
            </form>

            <div className="bg-[#0f0f18] border border-[rgba(223,183,85,0.2)] p-6 sm:p-7 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold mb-5 text-[#f5f2eb]">
                Gallery Library ({galleryItems.length})
              </h3>
              <div className="flex flex-col gap-3.5 max-h-[580px] overflow-y-auto pr-1">
                {galleryItems.length === 0 ? (
                  <p className="text-[rgba(245,242,235,0.4)] text-xs sm:text-sm py-8 text-center">No gallery photos added yet.</p>
                ) : (
                  galleryItems.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#080811',
                        border: '1px solid rgba(223,183,85,0.15)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                      }}
                    >
                      <img
                        src={item.image_url || 'https://via.placeholder.com/80?text=Gallery+Photo'}
                        alt={item.title || 'Gallery item'}
                        style={{
                          width: 64,
                          height: 46,
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid rgba(223,183,85,0.4)',
                          flexShrink: 0,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span
                            style={{
                              fontSize: '10px',
                              background: 'rgba(223,183,85,0.2)',
                              color: '#f4d688',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: '700',
                              flexShrink: 0,
                            }}
                          >
                            #{index + 1}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-[#f5f2eb] truncate">
                            {item.title}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        style={{
                          backgroundColor: 'rgba(239,68,68,0.12)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: '#f87171',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '700',
                          flexShrink: 0,
                          transition: 'all 0.2s',
                        }}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleAddSermon} className="bg-[#0f0f18] border border-[rgba(223,183,85,0.2)] p-6 sm:p-7 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold mb-5 text-[#f4d688]">Upload New Video Sermon</h3>
              
              <label style={labelStyle}>Sermon Title</label>
              <input style={inputStyle} value={vTitle} onChange={(e) => setVTitle(e.target.value)} placeholder="e.g. The Power of Persistent Prayer" required />

              <label style={labelStyle}>Preacher / Speaker</label>
              <input style={inputStyle} value={vSpeaker} onChange={(e) => setVSpeaker(e.target.value)} required />

              <label style={labelStyle}>Scripture Reference</label>
              <input style={inputStyle} value={vScripture} onChange={(e) => setVScripture(e.target.value)} placeholder="e.g. Luke 18:1-8" />

              <label style={labelStyle}>Category</label>
              <select style={{ ...inputStyle, backgroundColor: '#131320', cursor: 'pointer' }} value={vCategory} onChange={(e) => setVCategory(e.target.value)}>
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

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(245,242,235,0.85)', fontSize: '13px', marginBottom: '20px', cursor: 'pointer', fontWeight: '500' }}>
                <input type="checkbox" checked={vIsFeatured} onChange={(e) => setVIsFeatured(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#dfb755', cursor: 'pointer' }} />
                Mark as Main Featured Sermon
              </label>

              <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #dfb755, #c59938)', color: '#06060a', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 15px rgba(223,183,85,0.25)' }}>
                Publish Sermon
              </button>
            </form>

            <div className="bg-[#0f0f18] border border-[rgba(223,183,85,0.2)] p-6 sm:p-7 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold mb-5 text-[#f5f2eb]">Existing Video Sermons ({sermons.length})</h3>
              <div className="flex flex-col gap-3.5 max-h-[580px] overflow-y-auto pr-1">
                {sermons.length === 0 ? (
                  <p className="text-[rgba(245,242,235,0.4)] text-xs sm:text-sm py-8 text-center">No video sermons uploaded yet.</p>
                ) : (
                  sermons.map((s) => (
                    <div key={s.id} style={{ backgroundColor: '#080811', border: '1px solid rgba(223,183,85,0.15)', padding: '14px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
                      <div className="min-w-0 flex-1">
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: s.is_featured ? '#f4d688' : '#f5f2eb' }} className="truncate">
                          {s.is_featured ? '★ ' : ''}{s.title}
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(245,242,235,0.5)' }} className="truncate">{s.speaker} • {s.category}</p>
                      </div>
                      <button onClick={() => handleDeleteSermon(s.id)} style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '700', flexShrink: 0, transition: 'all 0.2s' }}>
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
          <div className="bg-[#0f0f18] border border-[rgba(223,183,85,0.2)] p-6 sm:p-8 rounded-2xl shadow-xl max-w-[650px]">
            <h3 className="text-lg font-bold mb-5 text-[#f4d688]">Configure Live Broadcast</h3>
            <form onSubmit={handleUpdateLive}>
              <label style={labelStyle}>Live Event Title</label>
              <input style={inputStyle} value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} required />

              <label style={labelStyle}>YouTube Live Stream Embed URL</label>
              <input style={inputStyle} value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://www.youtube.com/embed/live_stream?channel=..." required />

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(245,242,235,0.85)', fontSize: '13px', marginBottom: '24px', cursor: 'pointer', fontWeight: '500' }}>
                <input type="checkbox" checked={isLiveActive} onChange={(e) => setIsLiveActive(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer' }} />
                Service is Currently LIVE (Displays Live Badge on Website)
              </label>

              <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 15px rgba(16,185,129,0.25)' }}>
                Save Live Stream Settings
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: AUDIO SERMONS */}
        {activeTab === 'audio' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleAddAudio} className="bg-[#0f0f18] border border-[rgba(223,183,85,0.2)] p-6 sm:p-7 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold mb-5 text-[#f4d688]">Add Audio Sermon</h3>

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

              <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #dfb755, #c59938)', color: '#06060a', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 15px rgba(223,183,85,0.25)' }}>
                Add Audio Track
              </button>
            </form>

            <div className="bg-[#0f0f18] border border-[rgba(223,183,85,0.2)] p-6 sm:p-7 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold mb-5 text-[#f5f2eb]">Audio Library ({audioList.length})</h3>
              <div className="flex flex-col gap-3.5 max-h-[580px] overflow-y-auto pr-1">
                {audioList.length === 0 ? (
                  <p className="text-[rgba(245,242,235,0.4)] text-xs sm:text-sm py-8 text-center">No audio tracks uploaded yet.</p>
                ) : (
                  audioList.map((a) => (
                    <div key={a.id} style={{ backgroundColor: '#080811', border: '1px solid rgba(223,183,85,0.15)', padding: '14px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
                      <div className="min-w-0 flex-1">
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#f5f2eb' }} className="truncate">{a.title}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(245,242,235,0.5)' }} className="truncate">{a.episode} • {a.duration}</p>
                      </div>
                      <button onClick={() => handleDeleteAudio(a.id)} style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '700', flexShrink: 0, transition: 'all 0.2s' }}>
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
    </div>
  );
}
