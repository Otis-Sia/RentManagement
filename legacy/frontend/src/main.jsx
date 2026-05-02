import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initPWA } from './pwa-utils.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Initialize PWA features
initPWA().then((pwaStatus) => {
  console.log('[App] PWA initialized:', pwaStatus);
}).catch((error) => {
  console.error('[App] PWA initialization failed:', error);
});
