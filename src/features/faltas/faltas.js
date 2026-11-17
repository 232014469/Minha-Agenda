import { DISCIPLINAS } from '../materias/dadosFluxograma'

/** Cada clique em "+1 falta" é um encontro de 2 horas-aula. */
export const HORAS_POR_ENCONTRO = 2

/** Carga horária quando nada indica outra (4 créditos). */
export const CARGA_PADRAO = 60

/** Opções que aparecem para escolher a carga horária. */
export const CARGAS = [30, 45, 60, 90, 120]

const normalizar = (texto) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

/** Créditos do fluxograma para uma matéria com o mesmo nome (ou null). */
export function creditosDoFluxograma(nome) {
  const alvo = normalizar(nome ?? '')
  const achada = DISCIPLINAS.find(
    (disciplina) => disciplina.codigo && normalizar(disciplina.nome) === alvo,
  )

  return achada ? achada.creditos : null
}

/**
 * Carga horária da matéria: a escolhida pela pessoa; senão a do fluxograma
 * (1 crédito = 15 h); senão 60 h.
 */
export function cargaHorariaDe(materia) {
  if (materia.cargaHoraria) return materia.cargaHoraria

  const creditos = creditosDoFluxograma(materia.nome)

  return creditos ? creditos * 15 : CARGA_PADRAO
}

/**
 * Situação das faltas. Na UnB, reprova por falta quem tem menos de 75% de
 * frequência: o limite é 25% da carga horária.
 *
 * nivel: 'ok' (menos da metade do limite), 'atencao' (metade ou mais),
 * 'perigo' (resta 1 encontro ou menos) e 'reprovado' (passou do limite).
 */
export function situacaoDasFaltas(materia) {
  const carga = cargaHorariaDe(materia)
  const limite = Math.floor(carga * 0.25)
  const faltas = materia.faltas ?? 0
  const restamHoras = limite - faltas
  const restamEncontros = Math.max(
    0,
    Math.floor(restamHoras / HORAS_POR_ENCONTRO),
  )

  let nivel = 'ok'

  if (faltas > limite) nivel = 'reprovado'
  else if (restamEncontros <= 1) nivel = 'perigo'
  else if (faltas >= limite / 2) nivel = 'atencao'

  return {
    carga,
    limite,
    faltas,
    restamEncontros,
    nivel,
    percentual: limite === 0 ? 0 : Math.min(100, (faltas / limite) * 100),
  }
}

/** "Ainda pode faltar 5 encontros", "Último encontro!", "Passou do limite". */
export function textoDasFaltas({ nivel, restamEncontros }) {
  if (nivel === 'reprovado') return 'Passou do limite de faltas'
  if (restamEncontros === 0) return 'Não pode faltar mais'
  if (restamEncontros === 1) return 'Pode faltar só mais 1 encontro'

  return `Ainda pode faltar ${restamEncontros} encontros`
}
