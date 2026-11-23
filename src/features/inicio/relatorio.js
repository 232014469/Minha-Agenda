import {
  ehAtrasada,
  ehConcluida,
  ehNaoRealizada,
  inicioDaSemana,
} from '../agenda/agendaUtils'

const DIA_MS = 24 * 60 * 60 * 1000
const SEMANAS_NO_RITMO = 6

const porcento = (parte, total) =>
  total === 0 ? 0 : Math.round((parte / total) * 100)

/** Junta as tarefas por uma chave, contando o total e as concluídas. */
function agrupar(tarefas, chaveDe) {
  const grupos = new Map()

  for (const tarefa of tarefas) {
    const chave = chaveDe(tarefa)
    const grupo = grupos.get(chave) ?? {
      chave,
      total: 0,
      concluidas: 0,
      naoRealizadas: 0,
      atrasadas: 0,
    }

    grupo.total += 1
    if (ehConcluida(tarefa.status)) grupo.concluidas += 1
    if (ehNaoRealizada(tarefa.status)) grupo.naoRealizadas += 1
    if (ehAtrasada(tarefa)) grupo.atrasadas += 1
    grupos.set(chave, grupo)
  }

  return [...grupos.values()].map((grupo) => ({
    ...grupo,
    percentual: porcento(grupo.concluidas, grupo.total),
  }))
}

/**
 * Relatório das entregas do semestre, para a janela do "Meu progresso":
 *
 * - `resumo`: total, concluídas, pendentes, atrasadas, não realizadas e o
 *   percentual concluído;
 * - `pontualidade`: das concluídas, quantas foram marcadas até o prazo (pela
 *   última mudança da tarefa, `alteradoEm`; as sem essa data não entram);
 * - `porMateria` e `porTipo`: total, concluídas e percentual de cada um;
 * - `ritmo`: as últimas semanas (pelo prazo), com o total e as concluídas;
 * - `proximos7Dias`: pendentes que vencem na próxima semana.
 */
export function relatorioDeEntregas(tarefas, materias, agora = new Date()) {
  const concluidas = tarefas.filter((tarefa) => ehConcluida(tarefa.status))
  const naoRealizadas = tarefas.filter((tarefa) =>
    ehNaoRealizada(tarefa.status),
  ).length
  const atrasadas = tarefas.filter((tarefa) => ehAtrasada(tarefa)).length
  const total = tarefas.length

  const comData = concluidas.filter(
    (tarefa) => tarefa.prazo && Number.isFinite(tarefa.alteradoEm),
  )
  const noPrazo = comData.filter(
    (tarefa) => tarefa.alteradoEm <= new Date(tarefa.prazo).getTime(),
  ).length

  const materiaPorId = new Map(materias.map((materia) => [materia.id, materia]))
  const porMateria = agrupar(tarefas, (tarefa) => tarefa.materiaId)
    .filter((grupo) => materiaPorId.has(grupo.chave))
    .map((grupo) => ({
      ...grupo,
      nome: materiaPorId.get(grupo.chave).nome,
      cor: materiaPorId.get(grupo.chave).cor,
    }))
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome))

  const porTipo = agrupar(tarefas, (tarefa) => tarefa.tipo || 'Outro').sort(
    (a, b) => b.total - a.total || String(a.chave).localeCompare(b.chave),
  )

  const estaSemana = inicioDaSemana(agora).getTime()
  const ritmo = Array.from({ length: SEMANAS_NO_RITMO }, (_, indice) => {
    const inicio = estaSemana - (SEMANAS_NO_RITMO - 1 - indice) * 7 * DIA_MS
    const fim = inicio + 7 * DIA_MS
    const daSemana = tarefas.filter((tarefa) => {
      const prazo = new Date(tarefa.prazo).getTime()

      return prazo >= inicio && prazo < fim
    })

    return {
      inicio: new Date(inicio),
      atual: indice === SEMANAS_NO_RITMO - 1,
      total: daSemana.length,
      concluidas: daSemana.filter((tarefa) => ehConcluida(tarefa.status))
        .length,
    }
  })

  const agoraMs = agora.getTime()
  const proximos7Dias = tarefas.filter((tarefa) => {
    if (ehConcluida(tarefa.status) || ehNaoRealizada(tarefa.status)) {
      return false
    }

    const prazo = new Date(tarefa.prazo).getTime()

    return prazo >= agoraMs && prazo < agoraMs + 7 * DIA_MS
  }).length

  return {
    resumo: {
      total,
      concluidas: concluidas.length,
      pendentes: total - concluidas.length - naoRealizadas,
      atrasadas,
      naoRealizadas,
      percentual: porcento(concluidas.length, total),
    },
    pontualidade: {
      noPrazo,
      comAtraso: comData.length - noPrazo,
      avaliadas: comData.length,
      percentual: porcento(noPrazo, comData.length),
    },
    porMateria,
    porTipo,
    ritmo,
    proximos7Dias,
  }
}
