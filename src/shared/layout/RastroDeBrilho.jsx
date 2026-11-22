import { useEffect } from 'react'
import './RastroDeBrilho.css'

/** Cores dos brilhinhos (as do arco-íris do Reino doce). */
const CORES = ['#ff8fb1', '#ffb86b', '#ffe27a', '#9be8a8', '#8fd3ff', '#c9a7ff']

/** Distância mínima (px) entre um brilhinho e o próximo. */
const PASSO = 14

/** Quantos brilhinhos podem existir ao mesmo tempo. */
const MAXIMO = 40

/**
 * No tema Reino doce, a ponta do mouse vai soltando brilhinhos coloridos que
 * caem e somem. Não faz nada nos outros temas, em telas de toque ou com
 * "reduzir movimento". Os brilhinhos são desenhados direto no body (sem
 * React a cada um), num tamanho e numa queda um pouco diferentes.
 */
export default function RastroDeBrilho() {
  useEffect(() => {
    const mouse = window.matchMedia?.('(pointer: fine)')
    const calmo = window.matchMedia?.('(prefers-reduced-motion: reduce)')

    if (!mouse || !calmo) return undefined

    let ultimo = null
    let vivos = 0

    function soltar(evento) {
      if (document.documentElement.dataset.tema !== 'doce') return
      if (!mouse.matches || calmo.matches || vivos >= MAXIMO) return

      const { clientX: x, clientY: y } = evento

      if (ultimo && Math.hypot(x - ultimo.x, y - ultimo.y) < PASSO) return
      ultimo = { x, y }

      const brilho = document.createElement('span')
      const tamanho = 8 + Math.random() * 8

      brilho.className = 'brilhinho'
      brilho.setAttribute('aria-hidden', 'true')
      brilho.style.left = `${x}px`
      brilho.style.top = `${y}px`
      brilho.style.width = `${tamanho}px`
      brilho.style.height = `${tamanho}px`
      brilho.style.background = CORES[Math.floor(Math.random() * CORES.length)]
      brilho.style.setProperty(
        '--brilho-lado',
        `${(Math.random() - 0.5) * 30}px`,
      )
      brilho.style.setProperty('--brilho-queda', `${30 + Math.random() * 40}px`)
      brilho.style.setProperty(
        '--brilho-giro',
        `${(Math.random() - 0.5) * 240}deg`,
      )
      brilho.addEventListener('animationend', () => {
        brilho.remove()
        vivos -= 1
      })

      vivos += 1
      document.body.append(brilho)
    }

    window.addEventListener('mousemove', soltar, { passive: true })

    return () => {
      window.removeEventListener('mousemove', soltar)
      document
        .querySelectorAll('.brilhinho')
        .forEach((brilho) => brilho.remove())
    }
  }, [])

  return null
}
