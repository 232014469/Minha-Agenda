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
    const pagina = document.querySelector('.layout-coluna')
    const topo = pagina ? pagina.getBoundingClientRect().top : 0

    raiz.dataset.virada = sentido
    // A perspectiva olha para o meio do que está na tela (não para o meio da
    // página inteira, que pode ser bem mais alta): assim a folha vira reta,
    // sem entortar perto das argolas
    raiz.style.setProperty(
      '--virada-meio',
      `${window.innerHeight / 2 - topo}px`,
    )

    const transicao = document.startViewTransition(() => {
      flushSync(() => navegar(para))
    })

    transicao.finished.finally(() => {
      delete raiz.dataset.virada
      raiz.style.removeProperty('--virada-meio')
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
