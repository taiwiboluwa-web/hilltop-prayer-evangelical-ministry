import fs from 'node:fs';

const path = 'src/pages/AdminPortal.tsx';
let s = fs.readFileSync(path, 'utf8');

const importLine = "import { WebsiteSettingsAdmin } from '../components/WebsiteSettingsAdmin';";
if (!s.includes(importLine)) {
  const anchor = "import { supabase } from '../supabase';";
  if (!s.includes(anchor)) throw new Error('Supabase import anchor not found in AdminPortal.tsx');
  s = s.replace(anchor, `${anchor}\n${importLine}`);
}

s = s.replace(/type Tab = [^;]+;/, "type Tab = 'overview'|'ministers'|'gallery'|'videos'|'live'|'audio'|'website-settings';");

if (!s.includes("id:'website-settings'")) {
  const navAnchors = [
    "  { id:'audio', label:'Audio Messages', short:'AU' },",
    "  { id: 'audio', label: 'Audio Messages', short: 'AU' },",
    "{id:'audio',label:'Audio Messages',short:'AU'},",
    "{ id:'audio', label:'Audio Messages', short:'AU' },"
  ];
  const anchor = navAnchors.find(a => s.includes(a));
  if (!anchor) throw new Error('Audio navigation anchor not found in AdminPortal.tsx');
  s = s.replace(anchor, `${anchor}\n  { id:'website-settings', label:'Website Settings', short:'WS' },`);
}

if (!s.includes("'website-settings': svg")) {
  const iconAnchors = [
    "  audio: svg('M12 3a3 3 0 0 0 3 3v6a3 3 0 0 0-6 0V6a3 3 0 0 0 3-3Zm-7 9a7 7 0 0 0 14 0M12 19v3m-4 0h8'),",
    "  audio: svg('",
    "audio: svg('",
  ];
  const anchor = iconAnchors.find(a => s.includes(a));
  if (anchor) {
    const pos = s.indexOf(anchor);
    const lineEnd = s.indexOf('\n', pos);
    if (lineEnd !== -1) {
      const line = s.slice(pos, lineEnd);
      s = s.slice(0, lineEnd) + "\n  'website-settings': svg('M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42M18.36 5.64l-1.42 1.42M7.06 16.94l-1.42 1.42M12 8a4 4 0 1 0 0 8 4 4 0 0 0-0-8Z')," + s.slice(lineEnd);
    }
  }
}

if (!s.includes('const renderWebsiteSettings=')) {
  const renderMatches = [
    /  const render=\(\)=>tab==='overview'\?renderOverview\(\):tab==='ministers'\?renderMinisters\(\):tab==='gallery'\?renderGallery\(\):tab==='videos'\?renderVideos\(\):tab==='live'\?renderLive\(\):renderAudio\(\);/,
    /  const render=\(\)=>.*renderAudio\(\);/
  ];
  const match = renderMatches.map(r => s.match(r)).find(Boolean);
  if (!match) throw new Error('AdminPortal render function not found');
  const marker = match[0];
  s = s.replace(marker, "  const renderWebsiteSettings=()=> <WebsiteSettingsAdmin/>;\n\n  const render=()=>tab==='overview'?renderOverview():tab==='ministers'?renderMinisters():tab==='gallery'?renderGallery():tab==='videos'?renderVideos():tab==='live'?renderLive():tab==='audio'?renderAudio():renderWebsiteSettings();");
}

// Add a visible top-bar shortcut when the current dashboard contains the Visit site button.
if (!s.includes('Website Settings</button>')) {
  const visitPatterns = [
    /(<button[^>]*onClick=\{\(\)=>window\.open\([^\n]+Visit site[^\n]+<\/button>)/,
    /(<button[^>]*>Visit site ↗<\/button>)/
  ];
  for (const re of visitPatterns) {
    if (re.test(s)) {
      s = s.replace(re, `$1<button className={\`admin-btn ${'${tab'}==='website-settings'?'gold':''}\`} onClick={()=>setTab('website-settings')}>⚙ Website Settings</button>`);
      break;
    }
  }
}

fs.writeFileSync(path, s);
console.log('Website Settings build patch updated for the current AdminPortal source');
