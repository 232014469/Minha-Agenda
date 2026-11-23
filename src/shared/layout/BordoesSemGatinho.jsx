import { useEffect } from 'react'
import { EVENTO_CONCLUIU, EVENTO_FALTA } from '../gatinhos/gatos'
import { tocaBordoes, usePreferencias } from '../preferencias'
import { miar } from '../sons'

/**
 * Sem o gatinho no alto do menu (relógio, "Hoje" ou lembrete), quem tocava
 * os bordões não está na tela. Este componente, invisível, toca no lugar
 * dele: "É gata!" ao concluir uma tarefa e "Eu, hein!" ao anotar uma falta.
 */
export default function BordoesSemGatinho() {
  const toca = tocaBordoes(usePreferencias())

  useEffect(() => {
    if (!toca) return undefined

    const comemorar = () => miar('e-gata', { volume: 0.8 })
    const reclamar = () => miar('eu-hein', { volume: 0.8 })

    window.addEventListener(EVENTO_CONCLUIU, comemorar)
    window.addEventListener(EVENTO_FALTA, reclamar)

    return () => {
      window.removeEventListener(EVENTO_CONCLUIU, comemorar)
      window.removeEventListener(EVENTO_FALTA, reclamar)
    }
  }, [toca])

  return null
}
