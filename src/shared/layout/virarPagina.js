import { flushSync } from 'react-dom'

/**
 * Troca de tela virando a página do caderno: a página inteira (com o céu e
 * as manchas) gira presa na borda das argolas (para a esquerda, indo para a frente no menu) ou a nova
 * volta por cima (indo para trás). Usa as transições de tela do navegador;
 * sem elas, ou com "reduzir movimento", o clique segue normal.
 *
 * Chame no onClick de um link: `sentido` é 'frente' ou 'tras'.
 */
export function navegarVirandoPagina(evento, navegar, para, sentido) {
  const comTecla =
    evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey

  if (evento.defaultPrevented || evento.button !== 0 || comTecla) return
  if (typeof document.startViewTransition !== 'function') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  evento.preventDefault()

  function virar() {
    const raiz = document.documentElement

    raiz.dataset.virada = sentido

    const transicao = document.startViewTransition(() => {
      flushSync(() => navegar(para))
    })

    transicao.finished.finally(() => {
      delete raiz.dataset.virada
    })
  }

  // Com uma janela aberta (dia da agenda, cartão ampliado), fecha antes com
  // o Esc dela e só então vira, para a janela não virar junto com a página
  if (document.querySelector('[aria-modal="true"]')) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    requestAnimationFrame(() => requestAnimationFrame(virar))
  } else {
    virar()
  }
}
