import {
  ehAtrasada,
  ehConcluida,
  ehNaoRealizada,
} from '../../features/agenda/agendaUtils'
import { situacaoDasFaltas } from '../../features/faltas/faltas'

/** Quanto cada coisa pesa na felicidade do gatinho (de 0 a 100). */
const BASE = 70
const PRIMEIRA_ATRASADA = 10
const CADA_OUTRA_ATRASADA = 15
const NAO_REALIZADA = 5
const MAXIMO_NAO_REALIZADAS = 15
const FALTAS = { atencao: 5, perigo: 15, reprovado: 25 }
const BONUS_EM_DIA = 30

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`

/**
 * Felicidade do gatinho a partir das entregas e das faltas. Atrasar (cada
 * atividade a mais pesa mais), deixar de fazer e acumular faltas deixa ele
 * chateado; entregar tudo em dia deixa ele radiante (e o jardim florido).
 *
 * `cuidado` (opcional): o cuidado do dia no bichinho, { pontos, motivos }.
 *
 * Responde { pontos (0 a 100), nivel, motivos } — nivel: 'radiante' (80+),
 * 'feliz' (55+), 'chateado' (30+) ou 'triste'.
 */
export function felicidadeDoGatinho(
  { tarefas = [], materias = [], cuidado = null },
  agora = new Date(),
) {
  let pontos = BASE
  const motivos = []

  const atrasadas = tarefas.filter((tarefa) => ehAtrasada(tarefa)).length

  if (atrasadas) {
    pontos -= PRIMEIRA_ATRASADA + (atrasadas - 1) * CADA_OUTRA_ATRASADA
    motivos.push(
      plural(atrasadas, 'atividade atrasada', 'atividades atrasadas'),
    )
  }

  const naoRealizadas = tarefas.filter((tarefa) =>
    ehNaoRealizada(tarefa.status),
  ).length

  if (naoRealizadas) {
    pontos -= Math.min(MAXIMO_NAO_REALIZADAS, naoRealizadas * NAO_REALIZADA)
    motivos.push(plural(naoRealizadas, 'não realizada', 'não realizadas'))
  }

  for (const materia of materias) {
    const { nivel } = situacaoDasFaltas(materia)

    if (FALTAS[nivel]) {
      pontos -= FALTAS[nivel]
      if (nivel !== 'atencao') motivos.push(`muitas faltas em ${materia.nome}`)
    }
  }

  // Bônus: das atividades que já venceram, quantas foram entregues
  const vencidas = tarefas.filter(
    (tarefa) => tarefa.prazo && new Date(tarefa.prazo) < agora,
  )
  const entregues = vencidas.filter((tarefa) => ehConcluida(tarefa.status))

  if (!atrasadas && vencidas.length) {
    pontos += Math.round((BONUS_EM_DIA * entregues.length) / vencidas.length)
    if (entregues.length === vencidas.length)
      motivos.push('tudo entregue em dia')
  }

  // Cuidado do bichinho virtual: comida e brincadeira (ver bichinho.js)
  if (cuidado) {
    pontos += cuidado.pontos
    motivos.push(...cuidado.motivos)
  }

  pontos = Math.max(0, Math.min(100, pontos))

  let nivel = 'triste'

  if (pontos >= 80) nivel = 'radiante'
  else if (pontos >= 55) nivel = 'feliz'
  else if (pontos >= 30) nivel = 'chateado'

  return { pontos, nivel, motivos }
}
