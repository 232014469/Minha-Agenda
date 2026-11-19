import { useSyncExternalStore } from 'react'
import { APP } from '../config/app'
import { ehGato } from './gatinhos/gatos'

/**
 * Preferências deste aparelho (não vão na sincronização): o mascote do menu,
 * se os sons tocam e se os gatinhos aparecem pela tela.
 */
const PADRAO = { mascote: 'gato01', sons: true, gatinhos: true }
const CHAVE = `${APP.chaveDosDados}.preferencias`
const ouvintes = new Set()

function ler() {
  try {
    const salvas = {
      ...PADRAO,
      ...JSON.parse(localStorage.getItem(CHAVE) ?? '{}'),
    }

    // O lobinho saiu: quem tinha escolhido ele fica com o gatinho padrão.
    if (!ehGato(salvas.mascote)) salvas.mascote = PADRAO.mascote

    return salvas
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
