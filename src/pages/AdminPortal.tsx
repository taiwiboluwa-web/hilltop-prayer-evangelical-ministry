import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// ... keep your existing interfaces (Sermon, AudioSermon, GalleryItem, etc.)

interface Minister {
  id: string | number;
  name: string;
  role: string;
  desc?: string;
  desc_text?: string;
  image_url: string;
  img?: string;
  display_order: number;
}

export function AdminPortal({ onBack }: AdminPortalProps) {
  // ... keep your existing state hooks for auth, tabs, deployment, etc.

  // --- Upgraded Minister States ---
  const [ministers, setMinisters] = Minister[]>([]);
  const [selectedMinisterId, setSelectedMinisterId] = useState<string | number | null>(null);
  const [isAddingNewMinister, setIsAddingNewMinister] = useState<boolean>(false);
  
  const [mName, setMName] = useState('');
  const [mRole, setMRole] = useState('');
  const [mDescText, setMDescText] = useState('');
  const [mImageUrl, setMImageUrl] = useState('');

  // --- Fetch Ministers ---
  const fetchMinisters = async () => {
    const { data } = await supabase.from('ministers').select('*').order('display_order', { ascending: true });
    if (data) {
      setMinisters(data);
      if (data.length > 0 && !selectedMinisterId && !isAddingNewMinister) {
        handleSelectMinister(data[0]);
      }
    }
  };

  const handleSelectMinister = (m: Minister) => {
    setIsAddingNewMinister(false);
    setSelectedMinisterId(m.id);
    setMName(m.name || '');
    setMRole(m.role || '');
    setMDescText(m.desc_text || m.desc || '');
    setMImageUrl(m.image_url || m.img || '');
  };

  const handleOpenAddMinister = () => {
    setIsAddingNewMinister(true);
    setSelectedMinisterId(null);
    setMName('');
    setMRole('');
    setMDescText('');
    setMImageUrl('');
  };

  const handleSaveMinisterForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: mName,
      role: mRole,
      desc: mDescText,
      desc_text: mDescText,
      image_url: mImageUrl,
      img: mImageUrl,
      display_order: ministers.length + 1,
    };

    if (isAddingNewMinister) {
      const { error } = await supabase.from('ministers').insert([payload]);
      if (error) {
        alert(error.message);
      } else {
        alert('New minister slot added successfully!');
        setIsAddingNewMinister(false);
        fetchMinisters();
      }
    } else if (selectedMinisterId) {
      const { error } = await supabase.from('ministers').update(payload).eq('id', selectedMinisterId);
      if (error) {
        alert(error.message);
      } else {
        alert('Minister updated successfully!');
        fetchMinisters();
      }
    }
  };

  const handleDeleteMinister = async (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this minister slot?')) {
      const { error } = await supabase.from('ministers').delete().eq('id', id);
      if (error) {
        alert(error.message);
      } else {
        fetchMinisters();
        if (selectedMinisterId === id) {
          setIsAddingNewMinister(true);
          setMName('');
          setMRole('');
          setMDescText('');
          setMImageUrl('');
        }
      }
    }
  };

  // ... keep your rest of fetch and handler functions (Gallery, Sermons, Live, Audio)

  return (
    <div className="w-full min-h-screen bg-[#06060a] text-[#f5f2eb] px-4 sm:px-8 py-8 md:py-10 overflow-x-hidden font-['Outfit',sans-serif]">
      <div className="max-w-[1200px] mx-auto w-full">
        
        {/* Header Section */}
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

        {/* TAB 1: UPGRADED MINISTERS MANAGEMENT */}
        {activeTab === 'ministers' && (
          <div>
            {/* Top Action Bar matching Shin's Empire dashboard metric layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#0f0f18] border border-[rgba(223,183,85,0.2)] p-5 rounded-xl shadow-lg">
                <span className="text-[11px] font-bold text-[rgba(223,183,85,0.8)] tracking-wider uppercase">Total Ministers</span>
                <h2 className="text-3xl font-extrabold text-[#f5f2eb] mt-1 mb-0">{ministers.length}</h2>
              </div>
              <div className="col-span-1 sm:col-span-2 flex items-center justify-end">
                <button
                  onClick={handleOpenAddMinister}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#dfb755] to-[#c59938] text-[#06060a] font-extrabold cursor-pointer flex items-center gap-2 text-sm shadow-xl hover:brightness-110 transition-all"
                >
                  <span>+</span> Add New Minister Slot
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-8">
              {/* Form Editor Card */}
              <form onSubmit={handleSaveMinisterForm} className="bg-[#0f0f18] border border-[rgba(223,183,85,0.2)] p-6 sm:p-7 rounded-2xl shadow-xl">
                <h3 className="text-lg font-bold m-0 mb-5 text-[#f4d688] flex items-center justify-between">
                  <span>✦ {isAddingNewMinister ? 'Create New Minister Slot' : `Editing Minister`}</span>
                  <span className="text-xs bg-[rgba(223,183,85,0.1)] px-3 py-1 rounded-full text-[#dfb755] border border-[rgba(223,183,85,0.3)]">
                    {isAddingNewMinister ? 'New Entry' : 'Active Editor'}
                  </span>
                </h3>

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
                  {isAddingNewMinister ? 'Save New Minister Slot' : 'Save Changes'}
                </button>
              </form>

              {/* Minister Slots Smart Feed & Delete Capability */}
              <div className="bg-[#0f0f18] border border-[rgba(223,183,85,0.2)] p-6 sm:p-7 rounded-2xl shadow-xl">
                <h3 className="text-lg font-bold mb-5 text-[#f5f2eb]">
                  Active Minister Slots ({ministers.length})
                </h3>
                <div className="flex flex-col gap-3.5 max-h-[580px] overflow-y-auto pr-1">
                  {ministers.length === 0 ? (
                    <p className="text-[rgba(245,242,235,0.4)] text-xs sm:text-sm py-8 text-center">No ministers added yet. Click above to add one.</p>
                  ) : (
                    ministers.map((m, index) => {
                      const isSelected = selectedMinisterId === m.id && !isAddingNewMinister;

                      return (
                        <div
                          key={m.id}
                          onClick={() => handleSelectMinister(m)}
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
                            src={m.image_url || m.img || 'https://via.placeholder.com/60?text=No+Photo'}
                            alt={m.name || 'Minister'}
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
                                  flexShrink: 0,
                                }}
                              >
                                SLOT #{index + 1}
                              </span>
                              <span className="font-bold text-sm sm:text-base text-[#f5f2eb] truncate">
                                {m.name || 'Untitled Minister'}
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
                              {m.role || 'No role specified'} • {m.desc_text || m.desc || 'No description provided.'}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleSelectMinister(m)}
                              style={{
                                backgroundColor: isSelected ? '#dfb755' : 'rgba(223,183,85,0.12)',
                                border: isSelected ? 'none' : '1px solid rgba(223,183,85,0.3)',
                                color: isSelected ? '#06060a' : '#f4d688',
                                padding: '7px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                transition: 'all 0.2s',
                              }}
                            >
                              {isSelected ? 'Editing' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteMinister(m.id, e)}
                              style={{
                                backgroundColor: 'rgba(239,68,68,0.12)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                color: '#f87171',
                                padding: '7px 10px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                transition: 'all 0.2s',
                              }}
                            >
                              Del
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ... Rest of your tabs (Gallery, Videos, Live, Audio) remain clean and fully functional */}
      </div>
    </div>
  );
}
