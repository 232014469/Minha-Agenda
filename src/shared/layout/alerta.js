import {
  compararPrazo,
  ehAtrasada,
  ehConcluida,
  ehNaoRealizada,
} from '../../features/agenda/agendaUtils'

/** Pendentes que venceram ou vencem hoje, da mais antiga para a mais nova. */
export function tarefasUrgentes(tarefas, hoje = new Date()) {
  const amanha = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate() + 1,
  )

  return tarefas
    .filter(
      (tarefa) =>
        tarefa.prazo &&
        !ehConcluida(tarefa.status) &&
        !ehNaoRealizada(tarefa.status) &&
        new Date(tarefa.prazo) < amanha,
    )
    .sort(compararPrazo)
}

/** Chove no céu do modo claro enquanto houver atividade pendente atrasada. */
export function temAtrasadas(tarefas) {
  return tarefas.some((tarefa) => ehAtrasada(tarefa))
}

/**
 * "Previsão do tempo" da agenda, para a placa do menu: chuva com atividade
 * atrasada, sol com nuvem quando há entrega hoje e céu limpo quando não há
 * nada pendente para hoje.
 */
export function previsaoDoTempo(tarefas, hoje = new Date()) {
  const atrasadas = tarefas.filter((tarefa) => ehAtrasada(tarefa)).length

  if (atrasadas) {
    return {
      tempo: 'chuva',
      icone: '🌧️',
      texto: `${atrasadas} ${atrasadas === 1 ? 'atividade atrasada' : 'atividades atrasadas'}`,
    }
  }

  const paraHoje = tarefasUrgentes(tarefas, hoje).length

  if (paraHoje) {
    return {
      tempo: 'nublado',
      icone: '🌤️',
      texto: `${paraHoje} ${paraHoje === 1 ? 'entrega hoje' : 'entregas hoje'}`,
    }
  }

  return { tempo: 'sol', icone: '☀️', texto: 'Céu limpo: nada atrasado' }
}
