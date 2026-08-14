import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { Analytics } from './components/Analytics'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Analytics />
    <App />
  </React.StrictMode>,
)
