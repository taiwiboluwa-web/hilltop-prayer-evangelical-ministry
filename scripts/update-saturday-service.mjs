import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
let source = await readFile(path, 'utf8')

const schedule = "const SCHEDULE = [{ day: '2nd and 3rd Saturdays', name: 'Saturday Service', time: '5:00 PM - 7:00 PM', venue: '3 Kola Ojedeji Street, Ipaja, Lagos' }]"
source = source.replace(/const SCHEDULE\s*=\s*\[[\s\S]*?\]\s*\n/, `${schedule}\n`)
source = source.replace(/5:30 PM\s*-\s*8:00 PM/g, '5:00 PM - 7:00 PM')
source = source.replace(/5:30 PM/g, '5:00 PM')

const countdown = `function getNextServiceDate(now: Date = new Date()): Date {
  const year = now.getFullYear()
  const month = now.getMonth()
  const getNthSaturday = (y: number, m: number, nth: number): Date => {
    let count = 0
    const date = new Date(y, m, 1, 17, 0, 0)
    while (date.getMonth() === m) {
      if (date.getDay() === 6) {
        count++
        if (count === nth) return new Date(date)
      }
      date.setDate(date.getDate() + 1)
    }
    return date
  }
  const secondSat = getNthSaturday(year, month, 2)
  const thirdSat = getNthSaturday(year, month, 3)
  if (now < secondSat) return secondSat
  if (now < thirdSat) return thirdSat
  return getNthSaturday(year, month + 1, 2)
}

function getConfiguredServiceDate(settings: ServiceCountdownSettings, now: Date = new Date()): Date {
  if (!settings.saturday_service_automatic && settings.saturday_service_override_target) {
    const override = new Date(settings.saturday_service_override_target)
    if (!Number.isNaN(override.getTime()) && override.getTime() > now.getTime()) return override
  }
  return getNextServiceDate(now)
}

type ServiceCountdownSettings = {
  saturday_service_enabled: boolean
  saturday_service_automatic: boolean
  saturday_service_override_target: string | null
  saturday_service_title: string
  saturday_service_time_label: string
  saturday_service_venue: string
}`

const fnPattern = /function getNextServiceDate\([\s\S]*?\n\}\n\nfunction useCountdown/
if (fnPattern.test(source)) {
  source = source.replace(fnPattern, `${countdown}\n\nfunction useCountdown`)
}

const aboutPattern = /function AboutPage\(\) \{[\s\S]*?\n\n  return \(/
const aboutReplacement = `function AboutPage() {
  const [target, setTarget] = useState(() => getNextServiceDate())
  const [serviceEnabled, setServiceEnabled] = useState(true)
  const [serviceSettings, setServiceSettings] = useState<ServiceCountdownSettings>({
    saturday_service_enabled: true,
    saturday_service_automatic: true,
    saturday_service_override_target: null,
    saturday_service_title: 'Saturday Service',
    saturday_service_time_label: '5:00 PM - 7:00 PM',
    saturday_service_venue: '3 Kola Ojedeji Street, Ipaja, Lagos',
  })

  useEffect(() => {
    let active = true
    const load = async () => {
      const { data } = await supabase.from('countdown_settings').select('saturday_service_enabled,saturday_service_automatic,saturday_service_override_target,saturday_service_title,saturday_service_time_label,saturday_service_venue').eq('id', 1).maybeSingle()
      if (!active) return
      const settings = data as ServiceCountdownSettings | null
      if (settings) {
        setServiceSettings(settings)
        setServiceEnabled(settings.saturday_service_enabled !== false)
        setTarget(getConfiguredServiceDate(settings))
      } else {
        setTarget(getNextServiceDate())
      }
    }
    load()
    const refreshId = window.setInterval(load, 30000)
    return () => { active = false; window.clearInterval(refreshId) }
  }, [])

  const c = useCountdown(target)
  const formattedDate = target.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Lagos',
  })

  return (`
if (aboutPattern.test(source)) {
  source = source.replace(aboutPattern, aboutReplacement)
}

source = source.replace(
  /<span style=\{\{ fontFamily: 'Outfit', fontSize: '0\.65rem',[\s\S]*?<\\/span>\s*<\\/div>\s*\n\s*<AnimatedText tag="h3"/,
  `<span style={{ fontFamily: 'Outfit', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gold-light)', textTransform: 'uppercase' }}>
                  {serviceSettings.saturday_service_title}
                </span>
              </div>

              <AnimatedText tag="h3"`
)

source = source.replace(
  /<AnimatedText tag="h3" className="display" style=\{\{ fontSize: 'clamp\(1\.8rem, 4vw, 2\.8rem\)', marginBottom: 8 \}\}>\s*Saturday Service\s*<\\/AnimatedText>/,
  `<AnimatedText tag="h3" className="display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 8 }}>
                {serviceSettings.saturday_service_title}
              </AnimatedText>`
)

source = source.replace(
  /<p style=\{\{ fontFamily: 'Outfit', color: 'var\(--muted\)', fontSize: '0\.85rem', marginBottom: 24 \}\}>\s*5:00 PM, 3 Kola Ojedeji Street, Ipaja, Lagos\s*<\\/p>/,
  `<p style={{ fontFamily: 'Outfit', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 24 }}>
                {serviceSettings.saturday_service_time_label} · {serviceSettings.saturday_service_venue}
              </p>`
)

source = source.replace(
  /<div className="label" style=\{\{ marginBottom: 16, textAlign: 'center' \}\}>Gather With Us<\\/div>/,
  `{serviceEnabled && <div className="label" style={{ marginBottom: 16, textAlign: 'center' }}>Gather With Us</div>}`
)
source = source.replace(
  /<AnimatedText tag="h2" className="display" style=\{\{ fontSize: 'clamp\(2rem,4\.5vw,3\.4rem\)', marginBottom: 40, textAlign: 'center' \}\}>Next Live Service<\\/AnimatedText>/,
  `{serviceEnabled && <AnimatedText tag="h2" className="display" style={{ fontSize: 'clamp(2rem,4.5vw,3.4rem)', marginBottom: 40, textAlign: 'center' }}>Next Live Service</AnimatedText>}`
)

await writeFile(path, source, 'utf8')
console.log('Saturday Service countdown connected to recurring admin-controlled schedule')
