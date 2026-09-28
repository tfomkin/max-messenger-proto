import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import '@/app/styles/global.css'

// StrictMode double-mounts effects in dev and stacked long-poll loops against GREEN-API.
createRoot(document.getElementById('root')!).render(<App />)
