import { useContext } from 'react'
import { DadosContexto } from './contexto'

export function useDados() {
  const contexto = useContext(DadosContexto)

  if (!contexto) {
    throw new Error('useDados precisa estar dentro de <DadosProvider>.')
  }

  return contexto
}
