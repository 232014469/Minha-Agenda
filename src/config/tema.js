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
