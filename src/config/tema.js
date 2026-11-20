import { APP } from './app'

/** Temas do app: a cor do menu ativo, das abas, das barras e das manchas. */
export const TEMAS = [
  { id: 'verde', nome: 'Verde' },
  { id: 'azul', nome: 'Azul' },
  { id: 'rosa', nome: 'Rosa' },
  { id: 'amarelo', nome: 'Amarelo' },
]

const CHAVE = `${APP.chaveDosDados}.tema`

/** O tema escolhido neste aparelho (verde se nunca escolheu). */
export function lerTema() {
  try {
    const salvo = localStorage.getItem(CHAVE)

    return TEMAS.some((tema) => tema.id === salvo) ? salvo : 'verde'
  } catch {
    return 'verde'
  }
}

/** Aplica o tema na página e guarda a escolha neste aparelho. */
export function aplicarTema(id) {
  const tema = TEMAS.some((item) => item.id === id) ? id : 'verde'

  document.documentElement.dataset.tema = tema

  try {
    localStorage.setItem(CHAVE, tema)
  } catch {
    // Sem armazenamento (modo privado): o tema vale só até fechar.
  }

  return tema
}

/** Aparência: claro, escuro ou automático (escuro à noite, pelo relógio). */
export const MODOS = [
  { id: 'claro', nome: 'Claro', icone: '☀️' },
  { id: 'escuro', nome: 'Escuro', icone: '🌙' },
  { id: 'auto', nome: 'Automático', icone: '🌗', dica: 'escuro das 18h às 6h' },
]

const CHAVE_MODO = `${APP.chaveDosDados}.modo`

/** Cor da barra do navegador no celular, igual ao menu de cada modo. */
const COR_DA_BARRA = { claro: '#faeedb', escuro: '#2a385f' }

/** No automático, a noite vai das 18h às 6h (hora do aparelho). */
const ANOITECE = 18
const AMANHECE = 6

export function ehNoite(agora = new Date()) {
  const hora = agora.getHours()

  return hora >= ANOITECE || hora < AMANHECE
}

let modoAtual = 'claro'
let relogio = null

function pintarModo() {
  const escuro = modoAtual === 'escuro' || (modoAtual === 'auto' && ehNoite())
  const modo = escuro ? 'escuro' : 'claro'

  document.documentElement.dataset.modo = modo
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', COR_DA_BARRA[modo])
}

/** A aparência escolhida neste aparelho (claro se nunca escolheu). */
export function lerModo() {
  try {
    const salvo = localStorage.getItem(CHAVE_MODO)

    return MODOS.some((modo) => modo.id === salvo) ? salvo : 'claro'
  } catch {
    return 'claro'
  }
}

/**
 * Aplica a aparência e guarda a escolha neste aparelho. No automático, confere
 * o relógio a cada minuto (e ao voltar para a aba), e troca sozinho às 18h e
 * às 6h.
 */
export function aplicarModo(id) {
  modoAtual = MODOS.some((modo) => modo.id === id) ? id : 'claro'

  clearInterval(relogio)
  relogio = null
  document.removeEventListener('visibilitychange', pintarModo)

  if (modoAtual === 'auto') {
    relogio = setInterval(pintarModo, 60_000)
    document.addEventListener('visibilitychange', pintarModo)
  }

  pintarModo()

  try {
    localStorage.setItem(CHAVE_MODO, modoAtual)
  } catch {
    // Sem armazenamento (modo privado): vale só até fechar.
  }

  return modoAtual
}
