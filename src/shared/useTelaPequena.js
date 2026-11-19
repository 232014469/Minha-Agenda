import { useSyncExternalStore } from 'react'

/** Mesma medida do CSS: até 760px o menu vira a barra de baixo. */
const CONSULTA = '(max-width: 760px)'

const media = () => globalThis.matchMedia?.(CONSULTA)

function assinar(avisar) {
  const lista = media()

  lista?.addEventListener?.('change', avisar)

  return () => lista?.removeEventListener?.('change', avisar)
}

/** Diz se a tela é de celular, e atualiza quando a janela muda de tamanho. */
export function useTelaPequena() {
  return useSyncExternalStore(
    assinar,
    () => media()?.matches ?? false,
    () => false,
  )
}
