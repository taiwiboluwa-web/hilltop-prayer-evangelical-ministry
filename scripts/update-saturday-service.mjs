import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
let source = await readFile(path, 'utf8')

// About section — always show the requested Saturday Service details.
const schedule = "const SCHEDULE = [{ day: '2nd and 3rd Saturdays', name: 'Saturday Service', time: '5:00 PM - 7:00 PM', venue: '3 Kola Ojedeji Street, Ipaja, Lagos' }]"
source = source.replace(/const SCHEDULE\s*=\s*\[[\s\S]*?\]\s*\n/, `${schedule}\n`)

// Remove every remaining old 5:30 PM display value.
source = source.replace(/5:30 PM\s*-\s*8:00 PM/g, '5:00 PM - 7:00 PM')
source = source.replace(/5:30 PM/g, '5:00 PM')
source = source.replace(/const \\[target\\] = useState\\(\\(\\) => getNextServiceDate\\(\\)\\)/, `const [target, setTarget] = useState(() => getNextServiceDate())\n  const [serviceSettings, setServiceSettings] = useState<any>({ saturday_service_enabled: true, saturday_service_automatic: true, saturday_service_override_target: null, saturday_service_title: 'Saturday Service', saturday_service_time_label: '5:00 PM - 7:00 PM', saturday_service_venue: '3 Kola Ojedeji Street, Ipaja, Lagos' })\n  useEffect(() => { const load = async () => { const { data } = await supabase.from('countdown_settings').select('saturday_service_enabled,saturday_service_automatic,saturday_service_override_target,saturday_service_title,saturday_service_time_label,saturday_service_venue').eq('id',1).maybeSingle(); if (data) { setServiceSettings(data); setTarget(getConfiguredServiceDate(data)) } }; load(); const id = setInterval(load,30000); return () => clearInterval(id) }, [])`) 
source = source.replace(/\{SCHEDULE\.map\(s => \(/, `{[{ day: formattedDate, name: serviceSettings.saturday_service_title, time: serviceSettings.saturday_service_time_label, venue: serviceSettings.saturday_service_venue }].map(s => (`)

// Replace the entire countdown calculation, regardless of its previous formatting.
const countdown = `function getNextServiceDate(now: Date = new Date()): Date {
  // Hilltop services hold on the 2nd and 3rd Saturdays of every month at 5:00 PM.
  // The next occurrence is calculated at runtime, so the countdown never expires.
  const getNthSaturday = (year: number, month: number, nth: number): Date => {
    const first = new Date(year, month, 1, 17, 0, 0, 0)
    const offset = (6 - first.getDay() + 7) % 7
    return new Date(year, month, 1 + offset + (nth - 1) * 7, 17, 0, 0, 0)
  }

  const year = now.getFullYear()
  const month = now.getMonth()
  const second = getNthSaturday(year, month, 2)
  const third = getNthSaturday(year, month, 3)

  if (now < second) return second
  if (now < third) return third
  return getNthSaturday(year, month + 1, 2)
}

function getConfiguredServiceDate(settings: any, now: Date = new Date()): Date {
  if (settings && settings.saturday_service_automatic === false && settings.saturday_service_override_target) {
    const override = new Date(settings.saturday_service_override_target)
    if (!Number.isNaN(override.getTime()) && override.getTime() > now.getTime()) return override
  }
  return getNextServiceDate(now)
}

`
source = source.replace(/function getNextServiceDate\([\s\S]*?\n\}\n\nfunction useCountdown/, `${countdown}\nfunction useCountdown`)

source = source.replace(/>Saturday Service<\\/span>/, '>{serviceSettings.saturday_service_title}</span>')
source = source.replace(/>\\s*Saturday Service\\s*<\\/AnimatedText>/, '>{serviceSettings.saturday_service_title}</AnimatedText>')
source = source.replace(/5:00 PM, 3 Kola Ojedeji Street, Ipaja, Lagos/g, '{serviceSettings.saturday_service_time_label} · {serviceSettings.saturday_service_venue}')
await writeFile(path, source, 'utf8')
console.log('Saturday Service display and countdown permanently synchronized to 5:00 PM')
