import fs from 'node:fs';

const path = 'src/pages/AdminPortal.tsx';
let s = fs.readFileSync(path, 'utf8');

if (!s.includes("WebsiteSettingsAdmin")) {
  s = s.replace("import { supabase } from '../supabase';", "import { supabase } from '../supabase';\nimport { WebsiteSettingsAdmin } from '../components/WebsiteSettingsAdmin';");
}

s = s.replace("type Tab = 'overview'|'ministers'|'gallery'|'videos'|'live'|'audio';", "type Tab = 'overview'|'ministers'|'gallery'|'videos'|'live'|'audio'|'website-settings';");

if (!s.includes("id:'website-settings'")) {
  s = s.replace("  { id:'audio', label:'Audio Messages', short:'AU' },", "  { id:'audio', label:'Audio Messages', short:'AU' },\n  { id:'website-settings', label:'Website Settings', short:'WS' },");
}

if (!s.includes("websiteSettings: svg")) {
  s = s.replace("  audio: svg('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 9a7 7 0 0 0 14 0M12 19v3m-4 0h8'),", "  audio: svg('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 9a7 7 0 0 0 14 0M12 19v3m-4 0h8'),\n  'website-settings': svg('M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42M18.36 5.64l-1.42 1.42M7.06 16.94l-1.42 1.42M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z'),");
}

if (!s.includes("const renderWebsiteSettings")) {
  const marker = "  const render=()=>tab==='overview'?renderOverview():tab==='ministers'?renderMinisters():tab==='gallery'?renderGallery():tab==='videos'?renderVideos():tab==='live'?renderLive():renderAudio();";
  const replacement = "  const renderWebsiteSettings=()=> <WebsiteSettingsAdmin/>;\n\n  const render=()=>tab==='overview'?renderOverview():tab==='ministers'?renderMinisters():tab==='gallery'?renderGallery():tab==='videos'?renderVideos():tab==='live'?renderLive():tab==='audio'?renderAudio():renderWebsiteSettings();";
  if (!s.includes(marker)) throw new Error('AdminPortal render marker not found');
  s = s.replace(marker, replacement);
}

fs.writeFileSync(path, s);
console.log('Website Settings admin controls wired into AdminPortal');
