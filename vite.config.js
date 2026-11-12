import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' deixa o site funcionar em qualquer endereço (GitHub Pages, Render...).
export default defineConfig({
  base: './',
  plugins: [react()],
})
