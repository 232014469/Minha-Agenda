import { useSyncExternalStore } from 'react'
import { APP } from '../config/app'

/**
 * Preferências deste aparelho (não vão na sincronização): o mascote do menu,
 * se os sons tocam e se os gatinhos aparecem pela tela.
 */
const PADRAO = { mascote: 'lobo', sons: true, gatinhos: true }
const CHAVE = `${APP.chaveDosDados}.preferencias`
const ouvintes = new Set()

function ler() {
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE) ?? '{}')

    return { ...PADRAO, ...salvas }
  } catch {
    return { ...PADRAO }
  }
}

let atuais = ler()

function avisar() {
  for (const ouvinte of ouvintes) ouvinte()
}

export function lerPreferencias() {
  return atuais
}

export function mudarPreferencia(nome, valor) {
  atuais = { ...atuais, [nome]: valor }

  try {
    localStorage.setItem(CHAVE, JSON.stringify(atuais))
  } catch {
    // Sem armazenamento: vale só até fechar a página.
  }

  avisar()
}

/** Relê do armazenamento (usado nos testes, que limpam o localStorage). */
export function recarregarPreferencias() {
  atuais = ler()
  avisar()
}

function assinar(ouvinte) {
  ouvintes.add(ouvinte)

  return () => ouvintes.delete(ouvinte)
}

export function usePreferencias() {
  return useSyncExternalStore(assinar, lerPreferencias)
}
