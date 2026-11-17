import {
  cargaDoHistorico,
  cargaHorariaDe,
  creditosDoFluxograma,
} from '../faltas/faltas'

const percentual = (parte, total) =>
  total > 0 ? Math.round((parte / total) * 100) : 0

/** "2026.2" + 3 semestres → "2028.1". */
export function somarSemestres(semestre, quantos) {
  const [ano, periodo] = String(semestre).split('.').map(Number)

  if (!ano || !periodo) return null

  const indice = ano * 2 + (periodo - 1) + quantos

  return `${Math.floor(indice / 2)}.${(indice % 2) + 1}`
}

/**
 * Previsão a partir do histórico e das matérias cadastradas no semestre:
 * quanto a integralização sobe se passar em tudo, o que falta e, no mesmo
 * ritmo, quando seria a formatura. Uma matéria conta como obrigatória se
 * bate com uma obrigatória pendente do histórico (ou do fluxograma); as
 * outras contam como optativa ou livre. Nenhuma parte passa do que falta.
 */
export function preverIntegralizacao({
  progresso,
  materias,
  semestre,
  comFluxograma = false,
}) {
  const exigido = progresso?.exigido
  const integralizado = progresso?.integralizado

  if (!exigido?.total) return null

  const livresExigidas = exigido.optativas + exigido.complementares
  const obrigCumpridas = integralizado?.obrigatorias ?? 0
  const livresCumpridas =
    (integralizado?.optativas ?? 0) + (integralizado?.complementares ?? 0)
  const faltamObrig = Math.max(0, exigido.obrigatorias - obrigCumpridas)
  const faltamLivres = Math.max(0, livresExigidas - livresCumpridas)

  let obrigNoSemestre = 0
  let livresNoSemestre = 0

  for (const materia of materias) {
    const horas = cargaHorariaDe(materia)
    const obrigatoria =
      cargaDoHistorico(progresso, materia.nome) !== null ||
      (comFluxograma && creditosDoFluxograma(materia.nome) !== null)

    if (obrigatoria) obrigNoSemestre += horas
    else livresNoSemestre += horas
  }

  const ganhoObrig = Math.min(obrigNoSemestre, faltamObrig)
  const ganhoLivres = Math.min(livresNoSemestre, faltamLivres)
  const ganho = ganhoObrig + ganhoLivres
  const cumpridas = obrigCumpridas + livresCumpridas
  const faltam = faltamObrig + faltamLivres
  const faltamDepois = faltam - ganho

  // No mesmo ritmo deste semestre, quantos semestres depois dele.
  const semestresDepois =
    ganho > 0
      ? Math.ceil(faltamDepois / (obrigNoSemestre + livresNoSemestre))
      : null

  return {
    agora: percentual(cumpridas, exigido.total),
    depois: percentual(cumpridas + ganho, exigido.total),
    ganho,
    ganhoObrig,
    ganhoLivres,
    faltam,
    faltamObrig,
    faltamLivres,
    obrigatoriasPendentes: progresso.pendentes?.length ?? 0,
    ritmo: obrigNoSemestre + livresNoSemestre,
    semestresDepois,
    formatura:
      semestresDepois === null
        ? null
        : somarSemestres(semestre, semestresDepois),
  }
}
