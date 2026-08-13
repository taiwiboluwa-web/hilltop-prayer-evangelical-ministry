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
      <div style={{ minHeight: '100vh', backgroundColor: '#08080e', color: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
        Authenticating session...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#08080e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Outfit, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0e0e17', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: '#f2ede4', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Admin Portal</h2>
            <button onClick={onBack} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(242,237,228,0.7)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
              ← Back
            </button>
          </div>
          
          {authError && (
            <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#c9a84c', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#c9a84c', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ padding: '12px', background: 'linear-gradient(135deg, #c9a84c, #e4c76b)', color: '#08080e', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: '8px',
    color: '#f2ede4',
    fontSize: '14px',
    boxSizing: 'border-box',
    marginBottom: '12px',
    outline: 'none',
  };

  const fileInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    backgroundColor: '#050508',
    border: '1px dashed rgba(201,168,76,0.3)',
    borderRadius: '8px',
    color: 'rgba(242,237,228,0.6)',
    fontSize: '13px',
    boxSizing: 'border-box',
    marginBottom: '12px',
    cursor: 'pointer',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'rgba(201,168,76,0.8)',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '4px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#08080e', color: '#f2ede4', padding: '32px', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(201,168,76,0.15)', paddingBottom: '20px', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <button
                onClick={onBack}
                style={{
                  backgroundColor: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: '#e4c76b',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px',
                }}
              >
                ← Back to Home
              </button>
              <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#f2ede4', letterSpacing: '0.02em' }}>
                Ministry Content Manager
              </h1>
            </div>
            <p style={{ color: 'rgba(242,237,228,0.5)', fontSize: '13px', margin: '4px 0 0 0' }}>
              Manage ministers, fellowship gallery photos, video sermons, live broadcasts, and audio tracks
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handleTriggerDeploy}
              disabled={isDeploying}
              style={{
                background: isDeploying ? '#4b5563' : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '700',
                cursor: isDeploying ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
              }}
            >
              ⚡ {isDeploying ? 'Deploying...' : 'Deploy Live Site'}
            </button>

            <button onClick={handleLogout} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(242,237,228,0.7)', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              Sign Out
            </button>
          </div>
        </div>

        {uploadProgress && (
          <div style={{ backgroundColor: 'rgba(201,168,76,0.15)', border: '1px solid #c9a84c', color: '#e4c76b', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
            {uploadProgress}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '1px solid rgba(201,168,76,0.15)', paddingBottom: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('ministers')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: activeTab === 'ministers' ? '1px solid rgba(201,168,76,0.4)' : 'none', backgroundColor: activeTab === 'ministers' ? 'rgba(201,168,76,0.15)' : 'transparent', color: activeTab === 'ministers' ? '#e4c76b' : 'rgba(242,237,228,0.6)', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
          >
            ⚡ Ministers
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: activeTab === 'gallery' ? '1px solid rgba(201,168,76,0.4)' : 'none', backgroundColor: activeTab === 'gallery' ? 'rgba(201,168,76,0.15)' : 'transparent', color: activeTab === 'gallery' ? '#e4c76b' : 'rgba(242,237,228,0.6)', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
          >
            🖼️ Fellowship Gallery &amp; Moments
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: activeTab === 'videos' ? '1px solid rgba(201,168,76,0.4)' : 'none', backgroundColor: activeTab === 'videos' ? 'rgba(201,168,76,0.15)' : 'transparent', color: activeTab === 'videos' ? '#e4c76b' : 'rgba(242,237,228,0.6)', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
          >
            Video Sermons
          </button>
          <button
            onClick={() => setActiveTab('live')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: activeTab === 'live' ? '1px solid rgba(201,168,76,0.4)' : 'none', backgroundColor: activeTab === 'live' ? 'rgba(201,168,76,0.15)' : 'transparent', color: activeTab === 'live' ? '#e4c76b' : 'rgba(242,237,228,0.6)', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
          >
            Live Broadcast
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: activeTab === 'audio' ? '1px solid rgba(201,168,76,0.4)' : 'none', backgroundColor: activeTab === 'audio' ? 'rgba(201,168,76,0.15)' : 'transparent', color: activeTab === 'audio' ? '#e4c76b' : 'rgba(242,237,228,0.6)', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
          >
            Audio Messages
          </button>
        </div>

        {/* TAB 1: MINISTERS MANAGEMENT */}
        {activeTab === 'ministers' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px' }}>
            <form onSubmit={handleSaveMinister} style={{ backgroundColor: '#0e0e17', border: '1px solid rgba(201,168,76,0.18)', padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0', color: '#e4c76b' }}>
                Edit Minister Slot #{selectedSlotOrder}
              </h3>

              <label style={labelStyle}>Select Minister Slot</label>
              <select
                style={{ ...inputStyle, backgroundColor: '#131320', color: '#e4c76b', fontWeight: 'bold' }}
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
                  padding: '12px',
                  background: 'linear-gradient(135deg, #c9a84c, #e4c76b)',
                  color: '#08080e',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                Save Changes to Slot {selectedSlotOrder}
              </button>
            </form>

            <div style={{ backgroundColor: '#0e0e17', border: '1px solid rgba(201,168,76,0.18)', padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#f2ede4' }}>
                Minister Slots Overview
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3, 4, 5].map((slotNum) => {
                  const m = ministers.find((item) => (item.display_order ?? item.id) === slotNum);
                  const isSelected = selectedSlotOrder === slotNum;

                  return (
                    <div
                      key={slotNum}
                      onClick={() => handleSlotChange(slotNum)}
                      style={{
                        backgroundColor: isSelected ? 'rgba(201,168,76,0.1)' : '#050508',
                        border: isSelected ? '1px solid #c9a84c' : '1px solid rgba(201,168,76,0.12)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <img
                        src={m?.image_url || m?.img || 'https://via.placeholder.com/60?text=No+Photo'}
                        alt={m?.name || 'Open Slot'}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid #c9a84c',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              background: 'rgba(201,168,76,0.2)',
                              color: '#e4c76b',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                            }}
                          >
                            SLOT {slotNum}
                          </span>
                          <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#f2ede4' }}>
                            {m?.name || 'Open Slot'}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: '4px 0 0 0',
                            fontSize: '12px',
                            color: 'rgba(242,237,228,0.5)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '260px',
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
                          backgroundColor: 'rgba(201,168,76,0.15)',
                          border: '1px solid rgba(201,168,76,0.3)',
                          color: '#e4c76b',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        Select
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GALLERY & MOMENTS MANAGEMENT (DYNAMIC LIST) */}
        {activeTab === 'gallery' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px' }}>
            <form onSubmit={handleAddGalleryItem} style={{ backgroundColor: '#0e0e17', border: '1px solid rgba(201,168,76,0.18)', padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0', color: '#e4c76b' }}>
                Add New Gallery Photo
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(242,237,228,0.6)', marginBottom: '16px' }}>
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
                  padding: '12px',
                  background: 'linear-gradient(135deg, #c9a84c, #e4c76b)',
                  color: '#08080e',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                Add Gallery Photo
              </button>
            </form>

            <div style={{ backgroundColor: '#0e0e17', border: '1px solid rgba(201,168,76,0.18)', padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#f2ede4' }}>
                Gallery Library ({galleryItems.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto' }}>
                {galleryItems.length === 0 ? (
                  <p style={{ color: 'rgba(242,237,228,0.4)', fontSize: '13px' }}>No gallery photos added yet.</p>
                ) : (
                  galleryItems.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#050508',
                        border: '1px solid rgba(201,168,76,0.12)',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                      }}
                    >
                      <img
                        src={item.image_url || 'https://via.placeholder.com/80?text=Gallery+Photo'}
                        alt={item.title || 'Gallery item'}
                        style={{
                          width: 56,
                          height: 40,
                          borderRadius: '6px',
                          objectFit: 'cover',
                          border: '1px solid #c9a84c',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              background: 'rgba(201,168,76,0.2)',
                              color: '#e4c76b',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                            }}
                          >
                            #{index + 1}
                          </span>
                          <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#f2ede4' }}>
                            {item.title}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        style={{
                          backgroundColor: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: '#f87171',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: '600',
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <form onSubmit={handleAddSermon} style={{ backgroundColor: '#0e0e17', border: '1px solid rgba(201,168,76,0.18)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#e4c76b' }}>Upload New Video Sermon</h3>
              
              <label style={labelStyle}>Sermon Title</label>
              <input style={inputStyle} value={vTitle} onChange={(e) => setVTitle(e.target.value)} placeholder="e.g. The Power of Persistent Prayer" required />

              <label style={labelStyle}>Preacher / Speaker</label>
              <input style={inputStyle} value={vSpeaker} onChange={(e) => setVSpeaker(e.target.value)} required />

              <label style={labelStyle}>Scripture Reference</label>
              <input style={inputStyle} value={vScripture} onChange={(e) => setVScripture(e.target.value)} placeholder="e.g. Luke 18:1-8" />

              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={vCategory} onChange={(e) => setVCategory(e.target.value)}>
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

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(242,237,228,0.8)', fontSize: '13px', marginBottom: '16px', cursor: 'pointer' }}>
                <input type="checkbox" checked={vIsFeatured} onChange={(e) => setVIsFeatured(e.target.checked)} />
                Mark as Main Featured Sermon
              </label>

              <button type="submit" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #c9a84c, #e4c76b)', color: '#08080e', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                Publish Sermon
              </button>
            </form>

            <div style={{ backgroundColor: '#0e0e17', border: '1px solid rgba(201,168,76,0.18)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Existing Video Sermons ({sermons.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto' }}>
                {sermons.length === 0 ? (
                  <p style={{ color: 'rgba(242,237,228,0.4)', fontSize: '13px' }}>No video sermons uploaded yet.</p>
                ) : (
                  sermons.map((s) => (
                    <div key={s.id} style={{ backgroundColor: '#050508', border: '1px solid rgba(201,168,76,0.12)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: s.is_featured ? '#e4c76b' : '#f2ede4' }}>
                          {s.is_featured ? '★ ' : ''}{s.title}
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(242,237,228,0.5)' }}>{s.speaker} • {s.category}</p>
                      </div>
                      <button onClick={() => handleDeleteSermon(s.id)} style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
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
          <div style={{ backgroundColor: '#0e0e17', border: '1px solid rgba(201,168,76,0.18)', padding: '24px', borderRadius: '12px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#e4c76b' }}>Configure Live Broadcast</h3>
            <form onSubmit={handleUpdateLive}>
              <label style={labelStyle}>Live Event Title</label>
              <input style={inputStyle} value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} required />

              <label style={labelStyle}>YouTube Live Stream Embed URL</label>
              <input style={inputStyle} value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://www.youtube.com/embed/live_stream?channel=..." required />

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(242,237,228,0.8)', fontSize: '13px', marginBottom: '20px', cursor: 'pointer' }}>
                <input type="checkbox" checked={isLiveActive} onChange={(e) => setIsLiveActive(e.target.checked)} />
                Service is Currently LIVE (Displays Live Badge on Website)
              </label>

              <button type="submit" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                Save Live Stream Settings
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: AUDIO SERMONS */}
        {activeTab === 'audio' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <form onSubmit={handleAddAudio} style={{ backgroundColor: '#0e0e17', border: '1px solid rgba(201,168,76,0.18)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#e4c76b' }}>Add Audio Sermon</h3>

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

              <button type="submit" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #c9a84c, #e4c76b)', color: '#08080e', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                Add Audio Track
              </button>
            </form>

            <div style={{ backgroundColor: '#0e0e17', border: '1px solid rgba(201,168,76,0.18)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Audio Library ({audioList.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto' }}>
                {audioList.length === 0 ? (
                  <p style={{ color: 'rgba(242,237,228,0.4)', fontSize: '13px' }}>No audio tracks uploaded yet.</p>
                ) : (
                  audioList.map((a) => (
                    <div key={a.id} style={{ backgroundColor: '#050508', border: '1px solid rgba(201,168,76,0.12)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#f2ede4' }}>{a.title}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(242,237,228,0.5)' }}>{a.episode} • {a.duration}</p>
                      </div>
                      <button onClick={() => handleDeleteAudio(a.id)} style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
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
