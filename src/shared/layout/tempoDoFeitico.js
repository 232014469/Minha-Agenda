/**
 * Tempos da transformação do Reino doce (Feitico.jsx): a troca entre reino e
 * bosque acontece por baixo no auge do efeito, e o efeito some no fim.
 */
export const AUGE_DO_FEITICO = 950
export const DURACAO_DO_FEITICO = 2700

/** Só encanta no Reino doce, com animações ligadas (e fora dos testes). */
export function podeEncantar() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  if (document.documentElement.dataset.tema !== 'doce') return false

  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
