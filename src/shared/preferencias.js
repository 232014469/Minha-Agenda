import { useSyncExternalStore } from 'react'
import { APP } from '../config/app'
import { EVENTO_EXTRAS_RECEBIDOS, marcarExtra } from '../sync/extras'
import { ehGato } from './gatinhos/gatos'

/**
 * Preferências deste aparelho (não vão na sincronização): o mascote do menu,
 * se os sons tocam, se os bordões substituem alguns miados e o que fica no
 * alto do menu (`cantinho`): o gatinho, o relógio de estudo, o cartão "Hoje"
 * ou um quadro de lembrete; e se o céu é animado (`ceu`: sol, nuvens, chuva
 * e lua; desligado, sobram só as estrelas da noite) e se os cartões são de
 * vidro líquido (`vidro`: meio transparentes e embaçados). Sem ser o gatinho, ele some de todo lugar. Opções que saíram do app
 * são esquecidas ao ler.
 */
export const CANTINHOS = ['gatinho', 'relogio', 'hoje', 'lembrete']

const PADRAO = {
  mascote: 'gato01',
  sons: true,
  bordoes: true,
  cantinho: 'gatinho',
  ceu: true,
  vidro: true,
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
  if (atuais[nome] === valor) return

  atuais = { ...atuais, [nome]: valor }

  try {
    localStorage.setItem(CHAVE, JSON.stringify(atuais))
  } catch {
    // Sem armazenamento: vale só até fechar a página.
  }

  marcarExtra('preferencias')
  avisar()
}

// Chegaram preferências mais novas de outro aparelho: relê e avisa a tela
if (typeof window !== 'undefined') {
  window.addEventListener(EVENTO_EXTRAS_RECEBIDOS, (evento) => {
    if (evento.detail?.includes('preferencias')) recarregarPreferencias()
  })
}

/**
 * Se os bordões tocam. Com o gatinho, eles substituem alguns miados, então
 * dependem dos miados ligados; sem o gatinho não há miados, e basta a chave
 * dos bordões.
 */
export function tocaBordoes({ sons, bordoes, cantinho }) {
  return Boolean(bordoes && (sons || cantinho !== 'gatinho'))
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
