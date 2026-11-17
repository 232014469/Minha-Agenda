import { describe, expect, it } from 'vitest'
import {
  cargaHorariaDe,
  creditosDoFluxograma,
  situacaoDasFaltas,
  textoDasFaltas,
} from './faltas'

describe('carga horária', () => {
  it('usa a escolhida, depois a do fluxograma, depois 60 h', () => {
    expect(cargaHorariaDe({ nome: 'Qualquer', cargaHoraria: 90 })).toBe(90)
    // Cálculo 1 tem 6 créditos no fluxograma: 90 h.
    expect(cargaHorariaDe({ nome: 'cálculo 1' })).toBe(90)
    expect(cargaHorariaDe({ nome: 'Matéria inventada' })).toBe(60)
  })

  it('acha os créditos pelo nome, sem ligar para acento e maiúscula', () => {
    expect(creditosDoFluxograma('COMPILADORES 1')).toBe(4)
    expect(creditosDoFluxograma('Introducao a Engenharia')).toBe(2)
    expect(creditosDoFluxograma('Optativa')).toBeNull()
  })
})

describe('situação das faltas (UnB: limite de 25% da carga)', () => {
  const materia = (faltas, cargaHoraria = 60) => ({
    nome: 'X',
    faltas,
    cargaHoraria,
  })

  it('60 h dá 15 h de limite, ou 7 encontros de 2 h', () => {
    const s = situacaoDasFaltas(materia(0))

    expect(s.limite).toBe(15)
    expect(s.restamEncontros).toBe(7)
    expect(s.nivel).toBe('ok')
  })

  it('muda de cor perto do limite', () => {
    expect(situacaoDasFaltas(materia(8)).nivel).toBe('atencao')
    expect(situacaoDasFaltas(materia(12)).nivel).toBe('perigo')
    expect(situacaoDasFaltas(materia(15)).nivel).toBe('perigo')
    expect(situacaoDasFaltas(materia(16)).nivel).toBe('reprovado')
  })

  it('explica em palavras o que ainda dá', () => {
    expect(textoDasFaltas(situacaoDasFaltas(materia(0)))).toBe(
      'Ainda pode faltar 7 encontros',
    )
    expect(textoDasFaltas(situacaoDasFaltas(materia(12)))).toBe(
      'Pode faltar só mais 1 encontro',
    )
    expect(textoDasFaltas(situacaoDasFaltas(materia(14)))).toBe(
      'Não pode faltar mais',
    )
    expect(textoDasFaltas(situacaoDasFaltas(materia(16)))).toBe(
      'Passou do limite de faltas',
    )
  })
})
