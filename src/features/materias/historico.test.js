import { describe, expect, it } from 'vitest'
import { lerHistorico } from './historico'

// Histórico de mentira, no formato do SIGAA. Nenhum dado real.
const COLUNAS_LADO_A_LADO = `
Histórico Escolar
Componentes Curriculares Cursados/Cursando
Ano/Período Componente Curricular CH Turma Freq % Nota Situação
 --     MAT0025  CÁLCULO 1                       90  --  --   -   CUMP
2023.2  CIC0004  ALGORITMOS E PROGRAMAÇÃO        90  09  90,0 MM  APR
               Dr. FULANO DE TAL (90h)
2023.2  FGA0161  ENGENHARIA E AMBIENTE           60  01  79,0 MI  REP
2024.1  FGA0147  ESTRUTURA DE DADOS E ALGORITMOS 60  01  90,0 MS  APR
2024.2  # ADM0192 CALCULO FINANCEIRO             60  06  98,0 SS  APR
2025.1  MAT0026  CÁLCULO 2                       90  15  --   -   TRANC
2026.2  FGA0003  COMPILADORES 1                  60  01  100,0 -  MATR
Legenda
APR Aprovado(a) por média
Componentes Curriculares Obrigatórios Pendentes
FGA0160 MÉTODOS NUMÉRICOS PARA ENGENHARIA 60 h
Equivalências:
Cumpriu FGA0157 - PROBABILIDADE E ESTATÍSTICA APLICADO A ENGENHARIA (60h) através de EST0023 - PROBABILIDADE E ESTATÍSTICA (60h)
`

// O mesmo histórico copiado como o Preview do Mac às vezes faz: a coluna de
// situações inteira primeiro, depois a de códigos.
const COLUNAS_SEPARADAS = `
Componentes Curriculares Cursados/Cursando
Situação
CUMP
APR
REP
APR
APR
TRANC
MATR
MAT0025
CÁLCULO 1
CIC0004
ALGORITMOS E PROGRAMAÇÃO
FGA0161
ENGENHARIA E AMBIENTE
FGA0147
ESTRUTURA DE DADOS E ALGORITMOS
ADM0192
CALCULO FINANCEIRO
MAT0026
CÁLCULO 2
FGA0003
COMPILADORES 1
Legenda
Equivalências:
Cumpriu FGA0157 - PROBABILIDADE E ESTATÍSTICA através de EST0023 - PROBABILIDADE E ESTATÍSTICA (60h)
`

const ESPERADO = ['CIC0004', 'FGA0146', 'FGA0157', 'MAT0025']

describe('lerHistorico', () => {
  it.each([
    ['colunas lado a lado', COLUNAS_LADO_A_LADO],
    ['colunas separadas', COLUNAS_SEPARADAS],
  ])('marca só aprovadas, cumpridas e equivalências (%s)', (_, texto) => {
    const { cursadas, fora } = lerHistorico(texto)

    expect([...cursadas].sort()).toEqual(ESPERADO)
    expect(fora).toEqual(['ADM0192'])
  })

  it('troca o código antigo pelo atual (FGA0147 → FGA0146)', () => {
    expect(lerHistorico(COLUNAS_LADO_A_LADO).cursadas).toContain('FGA0146')
  })

  it('não marca reprovada, trancada, matriculada nem pendente', () => {
    const { cursadas } = lerHistorico(COLUNAS_LADO_A_LADO)

    for (const codigo of ['FGA0302', 'MAT0026', 'FGA0003', 'FGA0160']) {
      expect(cursadas).not.toContain(codigo)
    }
  })

  it('texto vazio ou qualquer não quebra', () => {
    expect(lerHistorico('')).toEqual({ cursadas: [], fora: [] })
    expect(lerHistorico(undefined)).toEqual({ cursadas: [], fora: [] })
  })
})
