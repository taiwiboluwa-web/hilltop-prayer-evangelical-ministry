import fs from 'node:fs';

const path = 'src/pages/AdminPortal.tsx';
let s = fs.readFileSync(path, 'utf8');

const importLine = "import { WebsiteSettingsAdmin } from '../components/WebsiteSettingsAdmin';";
if (!s.includes(importLine)) {
  const anchor = "import { supabase } from '../supabase';";
  if (!s.includes(anchor)) throw new Error('Supabase import anchor not found in AdminPortal.tsx');
  s = s.replace(anchor, `${anchor}\n${importLine}`);
}

s = s.replace(
  /type Tab = [^;]+;/,
  "type Tab = 'overview'|'ministers'|'gallery'|'videos'|'live'|'audio'|'website-settings';"
);

if (!s.includes("id:'website-settings'")) {
  const audioNav = "  { id:'audio', label:'Audio Messages', short:'AU' },";
  if (!s.includes(audioNav)) throw new Error('Audio navigation anchor not found in AdminPortal.tsx');
  s = s.replace(audioNav, `${audioNav}\n  { id:'website-settings', label:'Website Settings', short:'WS' },`);
}

if (!s.includes("'website-settings': svg")) {
  const audioIcon = "  audio: svg('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 9a7 7 0 0 0 14 0M12 19v3m-4 0h8'),";
  if (!s.includes(audioIcon)) throw new Error('Audio icon anchor not found in AdminPortal.tsx');
  s = s.replace(audioIcon, `${audioIcon}\n  'website-settings': svg('M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42M18.36 5.64l-1.42 1.42M7.06 16.94l-1.42 1.42M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z'),`);
}

if (!s.includes('const renderWebsiteSettings=')) {
  const marker = "  const render=()=>tab==='overview'?renderOverview():tab==='ministers'?renderMinisters():tab==='gallery'?renderGallery():tab==='videos'?renderVideos():tab==='live'?renderLive():renderAudio();";
  if (!s.includes(marker)) throw new Error('AdminPortal render marker not found');
  s = s.replace(marker, "  const renderWebsiteSettings=()=> <WebsiteSettingsAdmin/>;\n\n  const render=()=>tab==='overview'?renderOverview():tab==='ministers'?renderMinisters():tab==='gallery'?renderGallery():tab==='videos'?renderVideos():tab==='live'?renderLive():tab==='audio'?renderAudio():renderWebsiteSettings();");
}

// Also add a prominent top-bar shortcut so the settings cannot be missed.
const topbarAnchor = '<button className="admin-btn" onClick={()=>window.open(\'https://hilltopministries.org/\',\'_blank\',\'noopener,noreferrer\')}>Visit site ↗</button>';
if (!s.includes('Website Settings</button>') && s.includes(topbarAnchor)) {
  s = s.replace(topbarAnchor, `${topbarAnchor}<button className={\`admin-btn ${tab==='website-settings'?'gold':''}\`} onClick={()=>setTab('website-settings')}>⚙ Website Settings</button>`);
}

fs.writeFileSync(path, s);
console.log('Website Settings is now permanently visible in the Hilltop Admin workspace');
