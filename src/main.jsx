import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import '@fontsource/concert-one/400.css'
import '@fontsource/courier-prime/400.css'
import '@fontsource/courier-prime/700.css'
import './styles/tokens.css'
import './index.css'
import App from './App.jsx'
import DadosProvider from './dados/DadosProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <DadosProvider>
        <App />
      </DadosProvider>
    </HashRouter>
  </StrictMode>,
)
