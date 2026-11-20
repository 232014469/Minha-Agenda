import { ehConcluida, ehNaoRealizada } from '../features/agenda/agendaUtils'

/** Depois de quantos dias de atraso a atividade vira "não realizada". */
export const DIAS_PARA_NAO_REALIZADA = 7

const DIA_MS = 24 * 60 * 60 * 1000

/**
 * Atividade atrasada há uma semana ou mais vira "não realizada" sozinha.
 * Devolve os mesmos dados (mesmo objeto) quando nada muda.
 *
 * `alteradoEm` não muda de propósito: todo aparelho chega na mesma conclusão
 * sozinho, e assim uma mudança de verdade feita em outro aparelho (concluir,
 * mudar o prazo) continua valendo na sincronização.
 */
export function encerrarAtrasadas(dados, agora = Date.now()) {
  const limite = agora - DIAS_PARA_NAO_REALIZADA * DIA_MS
  let mudou = false

  const tarefas = dados.tarefas.map((tarefa) => {
    if (
      !tarefa.prazo ||
      ehConcluida(tarefa.status) ||
      ehNaoRealizada(tarefa.status)
    ) {
      return tarefa
    }

    const prazo = new Date(tarefa.prazo).getTime()

    if (Number.isNaN(prazo) || prazo > limite) return tarefa

    mudou = true

    return { ...tarefa, status: 'NAO_REALIZADA' }
  })

  return mudou ? { ...dados, tarefas } : dados
}
