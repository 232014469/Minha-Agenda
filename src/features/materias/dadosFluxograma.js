import { FLUXOGRAMA } from '../../config/curso'

// O fluxograma em si fica em src/config/curso.js.
export { CURSO, FLUXOGRAMA } from '../../config/curso'

/** Todas as disciplinas numa lista só. */
export const DISCIPLINAS = FLUXOGRAMA.flat()

export function somarCreditos(disciplinas) {
  return disciplinas.reduce((total, item) => total + item.creditos, 0)
}
