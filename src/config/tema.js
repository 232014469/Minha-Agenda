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

/** Aparência: claro, escuro ou igual ao sistema do aparelho. */
export const MODOS = [
  { id: 'claro', nome: 'Claro', icone: '☀️' },
  { id: 'escuro', nome: 'Escuro', icone: '🌙' },
  { id: 'auto', nome: 'Automático', icone: '🌗' },
]

const CHAVE_MODO = `${APP.chaveDosDados}.modo`

/** Cor da barra do navegador no celular, igual ao menu de cada modo. */
const COR_DA_BARRA = { claro: '#faeedb', escuro: '#2a385f' }

const sistemaEscuro = () =>
  globalThis.matchMedia?.('(prefers-color-scheme: dark)')

let modoAtual = 'claro'
let ouvindoSistema = false

function pintarModo() {
  const escuro =
    modoAtual === 'escuro' ||
    (modoAtual === 'auto' && Boolean(sistemaEscuro()?.matches))
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
 * Aplica a aparência e guarda a escolha neste aparelho. No automático, muda
 * sozinho quando o sistema troca entre claro e escuro.
 */
export function aplicarModo(id) {
  modoAtual = MODOS.some((modo) => modo.id === id) ? id : 'claro'

  if (!ouvindoSistema) {
    sistemaEscuro()?.addEventListener?.('change', pintarModo)
    ouvindoSistema = true
  }

  pintarModo()

  try {
    localStorage.setItem(CHAVE_MODO, modoAtual)
  } catch {
    // Sem armazenamento (modo privado): vale só até fechar.
  }

  return modoAtual
}
