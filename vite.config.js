import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { APP } from './src/config/app.js'

/**
 * Ajusta o que fica fora do React: o título do index.html e o manifesto
 * (nome e ícone de quando o app é instalado), a partir de src/config/app.js.
 */
function nomeDoApp(app) {
  return {
    name: 'nome-do-app',
    transformIndexHtml(html) {
      return html.replaceAll('Wolf Study', app.nome)
    },
    generateBundle() {
      const manifesto = {
        name: app.nome,
        short_name: app.nome,
        description:
          'Agenda pessoal para a faculdade: matérias, entregas e prazos.',
        lang: 'pt-BR',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#faf3e7',
        theme_color: '#faeedb',
        icons: [192, 512].map((tamanho) => ({
          src: `icone-${tamanho}.png`,
          sizes: `${tamanho}x${tamanho}`,
          type: 'image/png',
          purpose: 'any maskable',
        })),
      }

      this.emitFile({
        type: 'asset',
        fileName: 'manifest.webmanifest',
        source: JSON.stringify(manifesto, null, 2),
      })
    },
  }
}

export default defineConfig({
  // base './' deixa o site funcionar em qualquer endereço (GitHub Pages...).
  base: './',
  plugins: [react(), nomeDoApp(APP)],
  // Sempre a mesma porta: http://localhost:5180. Se estiver ocupada, avisa
  // em vez de trocar de porta (assim o favorito no navegador sempre funciona).
  server: { port: 5180, strictPort: true },
  preview: { port: 5181, strictPort: true },
})
