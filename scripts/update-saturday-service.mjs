import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
let source = await readFile(path, 'utf8')

// About section — always show the requested Saturday Service details.
const schedule = "const SCHEDULE = [{ day: '2nd and 3rd Saturdays', name: 'Saturday Service', time: '5:00 PM - 7:00 PM', venue: '3 Kola Ojedeji Street, Ipaja, Lagos' }]"
source = source.replace(/const SCHEDULE\s*=\s*\[[\s\S]*?\]\s*
/, `${schedule}
`)

// Remove every remaining old 5:30 PM display value.
source = source.replace(/5:30 PM\s*-\s*8:00 PM/g, '5:00 PM - 7:00 PM')
source = source.replace(/5:30 PM/g, '5:00 PM')
source = source.replace(/const \[target\] = useState\(\(\) => getNextServiceDate\(\)\)/, `const [target, setTarget] = useState(() => getNextServiceDate())
  const [serviceSettings, setServiceSettings] = useState<any>({ saturday_service_enabled: true, saturday_service_automatic: true, saturday_service_override_target: null, saturday_service_title: 'Saturday Service', saturday_service_time_label: '5:00 PM - 7:00 PM', saturday_service_venue: '3 Kola Ojedeji Street, Ipaja, Lagos' })
  useEffect(() => { const load = async () => { try { const response = await fetch('/api/countdown-settings', { cache: 'no-store' }); if (!response.ok) return; const data = await response.json(); if (data) { setServiceSettings(data); setTarget(getConfiguredServiceDate(data)) } } catch {} }; load(); const id = setInterval(load,30000); return () => clearInterval(id) }, [])`) 
source = source.replace(/\{SCHEDULE\.map\(s => \(/, `{[{ day: formattedDate, name: serviceSettings.saturday_service_title, time: serviceSettings.saturday_service_time_label, venue: serviceSettings.saturday_service_venue }].map(s => (`)

// Public event countdown intentionally removed. The schedule remains informational only.

source = source.replace(/>Saturday Service<\/span>/, '>{serviceSettings.saturday_service_title}</span>')
source = source.replace(/>\s*Saturday Service\s*<\/AnimatedText>/, '>{serviceSettings.saturday_service_title}</AnimatedText>')
source = source.replace(/5:00 PM, 3 Kola Ojedeji Street, Ipaja, Lagos/g, '{serviceSettings.saturday_service_time_label} · {serviceSettings.saturday_service_venue}')
await writeFile(path, source, 'utf8')
console.log('Saturday Service display and countdown permanently synchronized to 5:00 PM')
