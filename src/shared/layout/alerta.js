import {
  compararPrazo,
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
