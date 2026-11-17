import { describe, expect, it } from 'vitest'
import {
  preverIntegralizacao,
  somarSemestres,
  vagasDeOptativas,
} from './previsao'

const progresso = {
  curso: 'CIÊNCIAS CONTÁBEIS',
  exigido: {
    obrigatorias: 2400,
    optativas: 450,
    complementares: 150,
    total: 3000,
  },
  integralizado: {
    obrigatorias: 1200,
    optativas: 300,
    complementares: 0,
    total: 1500,
  },
  cursadas: [],
  pendentes: [
    { codigo: 'CCA0077', nome: 'CONTABILIDADE GERAL 2', ch: 60 },
    { codigo: 'CCA0018', nome: 'CUSTOS', ch: 60 },
  ],
}

const materia = (nome, cargaHoraria) => ({ id: nome, nome, cargaHoraria })

describe('somarSemestres', () => {
  it('passa de ano no segundo semestre', () => {
    expect(somarSemestres('2026.2', 0)).toBe('2026.2')
    expect(somarSemestres('2026.2', 1)).toBe('2027.1')
    expect(somarSemestres('2026.2', 3)).toBe('2028.1')
    expect(somarSemestres('', 1)).toBeNull()
  })
})

describe('preverIntegralizacao', () => {
  it('soma as matérias do semestre e separa obrigatórias de optativas', () => {
    const previsao = preverIntegralizacao({
      progresso,
      materias: [
        materia('Contabilidade Geral 2', 60),
        materia('Custos', 60),
        materia('Tópicos Especiais', 60),
      ],
      semestre: '2026.2',
    })

    expect(previsao.agora).toBe(50)
    expect(previsao.ganhoObrig).toBe(120)
    expect(previsao.ganhoLivres).toBe(60)
    expect(previsao.depois).toBe(56)
    expect(previsao.faltam).toBe(1500)
    expect(previsao.faltamObrig).toBe(1200)
    expect(previsao.faltamLivres).toBe(300)
    // Faltam 1320 h depois deste semestre, a 180 h por semestre: 8 semestres.
    expect(previsao.semestresDepois).toBe(8)
    expect(previsao.formatura).toBe('2030.2')
  })

  it('optativas além do que falta não contam', () => {
    const previsao = preverIntegralizacao({
      progresso,
      materias: [materia('Optativa Grande', 120), materia('Outra', 300)],
      semestre: '2026.2',
    })

    expect(previsao.ganhoLivres).toBe(300)
  })

  it('sem matérias no semestre não prevê formatura', () => {
    const previsao = preverIntegralizacao({
      progresso,
      materias: [],
      semestre: '2026.2',
    })

    expect(previsao.ganho).toBe(0)
    expect(previsao.formatura).toBeNull()
  })

  it('sem os totais do histórico não há previsão', () => {
    expect(
      preverIntegralizacao({ progresso: { pendentes: [] }, materias: [] }),
    ).toBeNull()
  })
})

describe('vagasDeOptativas', () => {
  it('divide em vagas de 60 h, com a sobra na última', () => {
    expect(vagasDeOptativas(930)).toHaveLength(16)
    expect(vagasDeOptativas(930).at(-1)).toBe(30)
    expect(vagasDeOptativas(120)).toEqual([60, 60])
    expect(vagasDeOptativas(0)).toEqual([])
  })
})
