import { describe, expect, it } from 'vitest'
import { encerrarAtrasadas } from './vencidas'

const DIA = 24 * 60 * 60 * 1000
const AGORA = new Date(2026, 10, 20, 12, 0).getTime()
const prazo = (dias) => new Date(AGORA - dias * DIA).toISOString()

describe('atividade atrasada há uma semana', () => {
  it('vira não realizada sozinha, sem mexer em alteradoEm', () => {
    const dados = {
      tarefas: [
        { id: 1, prazo: prazo(8), status: 'A_FAZER', alteradoEm: 5 },
        { id: 2, prazo: prazo(7), status: 'EM_ANDAMENTO' },
      ],
    }
    const novos = encerrarAtrasadas(dados, AGORA)

    expect(novos.tarefas.map((tarefa) => tarefa.status)).toEqual([
      'NAO_REALIZADA',
      'NAO_REALIZADA',
    ])
    expect(novos.tarefas[0].alteradoEm).toBe(5)
  })

  it('não mexe nas atrasadas há menos de uma semana nem nas concluídas', () => {
    const dados = {
      tarefas: [
        { id: 1, prazo: prazo(6), status: 'A_FAZER' },
        { id: 2, prazo: prazo(30), status: 'CONCLUIDA' },
        { id: 3, status: 'A_FAZER' },
      ],
    }

    expect(encerrarAtrasadas(dados, AGORA)).toBe(dados)
  })
})
