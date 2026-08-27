import fs from 'node:fs'

const appPath = 'src/App.tsx'
let app = fs.readFileSync(appPath, 'utf8')

if (!app.includes("./pages/AdminMemberApplications")) {
  app = app.replace("import { Navbar, Logo } from './components/Navbar'", "import { Navbar, Logo } from './components/Navbar'\nimport { AdminMemberApplications } from './pages/AdminMemberApplications'")
}

const oldHandler = "const handleSubmit=(e:React.FormEvent)=>{e.preventDefault();if(!formData.name||!formData.email)return;setSubmitted(true)}"
const newHandler = "const [submitting,setSubmitting]=useState(false);const [submitError,setSubmitError]=useState('');const handleSubmit=async(e:React.FormEvent)=>{e.preventDefault();if(!formData.name||!formData.email||submitting)return;setSubmitting(true);setSubmitError('');try{const {error}=await supabase.from('member_applications').insert({name:formData.name.trim(),email:formData.email.trim(),phone:formData.phone.trim()||null});if(error)throw error;try{await fetch('/api/member-notification',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(formData)})}catch{}setSubmitted(true)}catch(error){console.error('Member application failed',error);setSubmitError('We could not submit your details right now. Please try again.')}finally{setSubmitting(false)}}"

if (app.includes(oldHandler)) app = app.replace(oldHandler, newHandler)

const submitButton = '<button type="submit">Next</button>'
const enhancedButton = '<button type="submit" disabled={submitting}>{submitting?\'Submitting…\':\'Next\'}</button>{submitError&&<div role="alert" style={{color:\'#9b3f2f\',fontFamily:\'Outfit\',fontSize:\'.8rem\'}}>{submitError}</div>}'
if (app.includes(submitButton) && !app.includes('submitting?')) app = app.replace(submitButton, enhancedButton)

const adminBranch = "if(activePage==='Admin')return <AdminPortal onBack={()=>setActivePage('Home')}/>;"
const enhancedAdminBranch = "if(activePage==='Admin')return <><AdminPortal onBack={()=>setActivePage('Home')}/><AdminMemberApplications/></>;"
if (app.includes(adminBranch)) app = app.replace(adminBranch, enhancedAdminBranch)

fs.writeFileSync(appPath, app)
console.log('Applied Become a Member persistence, notification trigger, and admin applications inbox')
