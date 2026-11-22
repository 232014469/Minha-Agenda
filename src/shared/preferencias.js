import { useSyncExternalStore } from 'react'
import { APP } from '../config/app'
import { ehGato } from './gatinhos/gatos'

/**
 * Preferências deste aparelho (não vão na sincronização): o mascote do menu,
 * se os sons tocam, se os bordões substituem alguns miados e o que fica no
 * alto do menu (`cantinho`): o gatinho, o relógio de estudo, o cartão "Hoje"
 * ou um quadro de lembrete; e se o céu é animado (`ceu`: sol, nuvens, chuva
 * e lua; desligado, sobram só as estrelas da noite). Sem ser o gatinho, ele some de todo lugar. Opções que saíram do app
 * são esquecidas ao ler.
 */
export const CANTINHOS = ['gatinho', 'relogio', 'hoje', 'lembrete']

const PADRAO = {
  mascote: 'gato01',
  sons: true,
  bordoes: true,
  cantinho: 'gatinho',
  ceu: true,
}
const CHAVE = `${APP.chaveDosDados}.preferencias`
const ouvintes = new Set()

function ler() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(CHAVE) ?? '{}')
    const salvas = { ...PADRAO }

    for (const nome of Object.keys(PADRAO)) {
      if (nome in guardadas) salvas[nome] = guardadas[nome]
    }

    // Quem tinha desligado o "Gatinho na tela" fica com o relógio de estudo
    if (guardadas.gatinho === false && !('cantinho' in guardadas)) {
      salvas.cantinho = 'relogio'
    }
    if (!CANTINHOS.includes(salvas.cantinho)) salvas.cantinho = PADRAO.cantinho

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
