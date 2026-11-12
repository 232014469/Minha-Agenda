import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' deixa o site funcionar em qualquer endereço (GitHub Pages, Render...).
export default defineConfig({
  base: './',
  plugins: [react()],
  // Sempre a mesma porta: http://localhost:5180. Se estiver ocupada, avisa
  // em vez de trocar de porta (assim o favorito no navegador sempre funciona).
  server: { port: 5180, strictPort: true },
  preview: { port: 5181, strictPort: true },
})
