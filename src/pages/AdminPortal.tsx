import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';

interface AdminPortalProps { onBack: () => void }
interface Minister { id:number|string; name:string; role:string; desc?:string; desc_text?:string; image_url?:string; img?:string; image_url_2?:string; image_url_3?:string; image_fit?:'cover'|'contain'; display_order:number }
interface GalleryItem { id:string|number; title:string; image_url:string; created_at?:string }
interface Sermon { id:string; title:string; speaker:string; scripture:string; category:string; video_url:string; thumbnail_url:string; is_featured:boolean; created_at:string }
interface AudioSermon { id:string; title:string; speaker:string; episode:string; duration:string; audio_url:string; created_at?:string }
type Tab = 'overview'|'ministers'|'gallery'|'videos'|'live'|'audio';

const nav: {id:Tab; label:string; short:string}[] = [
  { id:'overview', label:'Overview', short:'OV' },
  { id:'ministers', label:'Ministers', short:'MI' },
  { id:'gallery', label:'Gallery Moments', short:'GA' },
  { id:'videos', label:'Video Sermons', short:'VI' },
  { id:'live', label:'Live Broadcast', short:'LI' },
  { id:'audio', label:'Audio Messages', short:'AU' },
];

const svg = (d:string) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d}/></svg>;
const icons: Record<string, React.ReactNode> = {
  overview: svg('M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z'),
  ministers: svg('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6-3a4 4 0 0 1 0 8m4 5v-2a4 4 0 0 0-3-3.87'),
  gallery: svg('m3 17 5-5 4 4 3-3 6 6M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Zm4-10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z'),
  videos: svg('m15 10 4.55-2.28A1 1 0 0 1 21 8.62v6.76a1 1 0 0 1-1.45.9L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z'),
  live: svg('M8.5 16.5a5 5 0 0 1 0-9m7 0a5 5 0 0 1 0 9M5 19.5a9 9 0 0 1 0-15m14 0a9 9 0 0 1 0 15M12 12h.01'),
  audio: svg('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 9a7 7 0 0 0 14 0M12 19v3m-4 0h8'),
};

const styles = `
.admin-shell{--gold:#d9ad4c;--gold-bright:#f0ca70;--ink:#090a08;--panel:#0f100d;--panel2:#141510;--line:rgba(217,173,76,.18);--muted:#7f806f;min-height:100vh;background:#080906;color:#f4f0e6;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.admin-shell *{box-sizing:border-box}.admin-shell button,.admin-shell input,.admin-shell textarea,.admin-shell select{font:inherit}.admin-shell button{cursor:pointer}
`;

export default function AdminPortal({onBack}:AdminPortalProps){
  const [loading,setLoading]=useState(true),[isAdmin,setIsAdmin]=useState(false),[authError,setAuthError]=useState('');
  const [tab,setTab]=useState<Tab>('overview'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[deploying,setDeploying]=useState(false);
  const [ministers,setMinisters]=useState<Minister[]>([]),[selectedMinister,setSelectedMinister]=useState(1),[mName,setMName]=useState(''),[mRole,setMRole]=useState(''),[mDesc,setMDesc]=useState(''),[mImage,setMImage]=useState('');
  const [mImage2,setMImage2]=useState(''),[mImage3,setMImage3]=useState('');
  const [ministerFit,setMinisterFit]=useState<'cover'|'contain'>('cover');
  const [gallery,setGallery]=useState<GalleryItem[]>([]),[gTitle,setGTitle]=useState(''),[gImage,setGImage]=useState('');
  const [sermons,setSermons]=useState<Sermon[]>([]),[vTitle,setVTitle]=useState(''),[vSpeaker,setVSpeaker]=useState(''),[vScripture,setVScripture]=useState(''),[vCategory,setVCategory]=useState('Faith'),[vUrl,setVUrl]=useState(''),[vThumb,setVThumb]=useState(''),[vFeatured,setVFeatured]=useState(false);
  const [liveTitle,setLiveTitle]=useState(''),[liveUrl,setLiveUrl]=useState(''),[liveActive,setLiveActive]=useState(false);
  const [audio,setAudio]=useState<AudioSermon[]>([]),[aTitle,setATitle]=useState(''),[aSpeaker,setASpeaker]=useState(''),[aEpisode,setAEpisode]=useState('Ep. 1'),[aDuration,setADuration]=useState(''),[aUrl,setAUrl]=useState('');

  const fetchMinisters=async()=>{const {data}=await supabase.from('ministers').select('*').order('display_order',{ascending:true});if(data){setMinisters(data);const m=data.find(x=>(x.display_order??x.id)===selectedMinister);if(m){setMName(m.name||'');setMRole(m.role||'');setMDesc(m.desc_text||m.desc||'');setMImage(m.image_url||m.img||'');setMImage2(m.image_url_2||'');setMImage3(m.image_url_3||'');setMinisterFit(m.image_fit==='contain'?'contain':'cover')}}};
  const fetchGallery=async()=>{const {data}=await supabase.from('gallery_moments').select('*').order('created_at',{ascending:false});if(data)setGallery(data)};
  const fetchSermons=async()=>{const {data}=await supabase.from('sermons').select('*').order('created_at',{ascending:false});if(data)setSermons(data)};
  const fetchLive=async()=>{const {data}=await supabase.from('live_stream').select('*').eq('id',1).maybeSingle();if(data){setLiveTitle(data.title||'');setLiveUrl(data.stream_url||'');setLiveActive(!!data.is_live)}};
  const fetchAudio=async()=>{const {data}=await supabase.from('audio_sermons').select('*').order('created_at',{ascending:false});if(data)setAudio(data)};
  const refresh=async()=>{await Promise.all([fetchMinisters(),fetchGallery(),fetchSermons(),fetchLive(),fetchAudio()])};
  const chooseMinister=(order:number)=>{setSelectedMinister(order);const m=ministers.find(x=>(x.display_order??x.id)===order);setMName(m?.name||'');setMRole(m?.role||'');setMDesc(m?.desc_text||m?.desc||'');setMImage(m?.image_url||m?.img||'');setMImage2(m?.image_url_2||'');setMImage3(m?.image_url_3||'');setMinisterFit(m?.image_fit==='contain'?'contain':'cover')};
  const saveMinister=async(e:React.FormEvent)=>{e.preventDefault();if(!mName.trim()||!mRole.trim()){alert('Enter the minister name and role.');return}const existing=ministers.find(x=>(x.display_order??x.id)===selectedMinister);const payload={name:mName.trim(),role:mRole.trim(),desc:mDesc,desc_text:mDesc,image_url:mImage,img:mImage,image_url_2:mImage2,image_url_3:mImage3,image_fit:ministerFit,display_order:selectedMinister};const result=existing?await supabase.from('ministers').update(payload).eq('id',existing.id):await supabase.from('ministers').insert(payload);if(result.error)alert(result.error.message);else{await fetchMinisters();alert(`Minister slot ${selectedMinister} saved.`)}};
  const removeMinister=async()=>{const m=ministers.find(x=>(x.display_order??x.id)===selectedMinister);if(!m)return;if(!confirm(`Remove ${m.name} from Minister Slot ${selectedMinister}?`))return;const {error}=await supabase.from('ministers').delete().eq('id',m.id);if(error)alert(error.message);else{setMName('');setMRole('');setMDesc('');setMImage('');setMImage2('');setMImage3('');await fetchMinisters()}};
  const addGallery=async(e:React.FormEvent)=>{e.preventDefault();if(!gTitle.trim()||!gImage.trim()){alert('Add a title and image.');return}const {error}=await supabase.from('gallery_moments').insert({title:gTitle.trim(),image_url:gImage.trim()});if(error)alert(error.message);else{setGTitle('');setGImage('');await fetchGallery()}};
  const removeGallery=async(id:string|number)=>{if(!confirm('Remove this gallery moment?'))return;const {error}=await supabase.from('gallery_moments').delete().eq('id',id);if(error)alert(error.message);else fetchGallery()};
  const counts=useMemo(()=>({ministers:ministers.length,gallery:gallery.length,videos:sermons.length,live:liveActive?1:0,audio:audio.length}),[ministers,gallery,sermons,liveActive,audio]);
  useEffect(()=>{(async()=>{try{const {data:{user}}=await supabase.auth.getUser();if(!user){setLoading(false);return}const {data:profile}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle();if(user.email==='taiwiboluwa@gmail.com'||profile?.role==='admin'||user.user_metadata?.role==='admin'){setIsAdmin(true);await refresh()}else setAuthError('Access denied: this account is not assigned as an admin.')}catch(e:any){setAuthError(e.message||'Authentication error')}finally{setLoading(false)}})()},[]);
  return <div className="admin-shell"><style>{styles}</style><main className="admin-main"><div className="admin-content"><h1>Hilltop Admin</h1><p>Admin dashboard is operational.</p></div></main></div>
}
