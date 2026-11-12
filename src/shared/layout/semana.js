import {
  compararPrazo,
  ehConcluida,
  ehNaoRealizada,
  inicioDaSemana,
} from '../../features/agenda/agendaUtils'

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/**
 * Tarefas ainda pendentes com prazo nesta semana (de segunda a domingo),
 * da mais próxima para a mais distante.
 */
export function atividadesDaSemana(tarefas, hoje = new Date()) {
  const inicio = inicioDaSemana(hoje)
  const fim = new Date(
    inicio.getFullYear(),
    inicio.getMonth(),
    inicio.getDate() + 7,
  )

  return tarefas
    .filter((tarefa) => {
      const prazo = new Date(tarefa.prazo)

      return (
        !ehConcluida(tarefa.status) &&
        !ehNaoRealizada(tarefa.status) &&
        prazo >= inicio &&
        prazo < fim
      )
    })
    .sort(compararPrazo)
}

/** "Hoje", "Amanhã" ou o dia da semana com a data: "Sex 21/11". */
export function rotuloDoDia(prazo, hoje = new Date()) {
  const data = new Date(prazo)
  const dia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diferenca = Math.round((dia(data) - dia(hoje)) / 86400000)

  if (diferenca === 0) return 'Hoje'
  if (diferenca === 1) return 'Amanhã'

  const dd = String(data.getDate()).padStart(2, '0')
  const mm = String(data.getMonth() + 1).padStart(2, '0')

  return `${DIAS[data.getDay()]} ${dd}/${mm}`
}
