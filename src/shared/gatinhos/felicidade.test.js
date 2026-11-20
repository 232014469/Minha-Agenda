import { describe, expect, it } from 'vitest'
import { felicidadeDoGatinho } from './felicidade'

const DIA = 24 * 60 * 60 * 1000
const AGORA = new Date()
const PASSADO = new Date(AGORA.getTime() - 10 * DIA).toISOString()
const FUTURO = new Date(AGORA.getTime() + 20 * DIA).toISOString()
const tarefa = (prazo, status = 'A_FAZER') => ({ prazo, status })

describe('felicidade do gatinho', () => {
  it('tudo entregue em dia: radiante', () => {
    const resultado = felicidadeDoGatinho(
      { tarefas: [tarefa(PASSADO, 'CONCLUIDA'), tarefa(FUTURO)] },
      AGORA,
    )

    expect(resultado.pontos).toBe(100)
    expect(resultado.nivel).toBe('radiante')
    expect(resultado.motivos).toContain('tudo entregue em dia')
  })

  it('cada atividade atrasada a mais pesa mais', () => {
    const uma = felicidadeDoGatinho({ tarefas: [tarefa(PASSADO)] }, AGORA)
    const duas = felicidadeDoGatinho(
      { tarefas: [tarefa(PASSADO), tarefa(PASSADO)] },
      AGORA,
    )

    expect(uma.pontos).toBe(60)
    expect(duas.pontos).toBe(45)
    expect(duas.nivel).toBe('chateado')
    expect(duas.motivos).toContain('2 atividades atrasadas')
  })

  it('muitas faltas também deixam ele chateado', () => {
    const resultado = felicidadeDoGatinho(
      { materias: [{ nome: 'Cálculo', cargaHoraria: 60, faltas: 16 }] },
      AGORA,
    )

    expect(resultado.pontos).toBe(45)
    expect(resultado.motivos).toContain('muitas faltas em Cálculo')
  })
})
