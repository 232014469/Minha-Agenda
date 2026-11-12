import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import '@fontsource/concert-one/400.css'
import '@fontsource/courier-prime/400.css'
import '@fontsource/courier-prime/700.css'
import './styles/tokens.css'
import './index.css'
import App from './App.jsx'
import { APP } from './config/app'
import DadosProvider from './dados/DadosProvider.jsx'

document.title = APP.nome

// Modo offline: só no site publicado (no `npm run dev` atrapalharia).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <DadosProvider>
        <App />
      </DadosProvider>
    </HashRouter>
  </StrictMode>,
)
