import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { configDoApp } from './src/config/app.js'

/**
 * Ajusta o que fica fora do React para a versão do app: título e ícones do
 * index.html e o manifesto (nome e ícone de quando o app é instalado).
 */
function versaoDoApp(app) {
  const icone = (nome) => `${app.prefixoDosIcones}${nome}`

  return {
    name: 'versao-do-app',
    transformIndexHtml(html) {
      return html
        .replaceAll('Jeff Study', app.nome)
        .replace('./favicon.svg', `./${icone('favicon.svg')}`)
        .replace('./apple-touch-icon.png', `./${icone('apple-touch-icon.png')}`)
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
          src: icone(`icone-${tamanho}.png`),
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

// `vite build` gera o Jeff Study; `vite build --mode geral` gera o Study.
export default defineConfig(({ mode }) => {
  const edicao = mode === 'geral' ? 'geral' : 'jeff'

  // O app lê a versão em import.meta.env.VITE_EDICAO (veja src/config/app.js).
  if (edicao === 'geral') process.env.VITE_EDICAO = 'geral'

  return {
    // base './' deixa o site funcionar em qualquer endereço (GitHub Pages...).
    base: './',
    plugins: [react(), versaoDoApp(configDoApp(edicao))],
    // Sempre a mesma porta: http://localhost:5180. Se estiver ocupada, avisa
    // em vez de trocar de porta (assim o favorito no navegador sempre funciona).
    server: { port: 5180, strictPort: true },
    preview: { port: 5181, strictPort: true },
  }
})
