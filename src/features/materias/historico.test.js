import { describe, expect, it } from 'vitest'
import { lerHistorico, lerHistoricoGeral, nomeBonito } from './historico'

// Histórico de mentira, no formato do SIGAA. Nenhum dado real.
const COLUNAS_LADO_A_LADO = `
Histórico Escolar
Curso:   ENGENHARIA DE SOFTWARE/FCTE - BACHARELADO - DIURNO
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
Curso:
ENGENHARIA DE SOFTWARE/FCTE - BACHARELADO - DIURNO
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
    const { cursadas, fora, doCurso } = lerHistorico(texto)

    expect([...cursadas].sort()).toEqual(ESPERADO)
    expect(fora).toEqual(['ADM0192'])
    expect(doCurso).toBe(true)
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
    const vazio = { cursadas: [], fora: [], doCurso: false }

    expect(lerHistorico('')).toEqual(vazio)
    expect(lerHistorico(undefined)).toEqual(vazio)
  })

  it('reconhece o curso mesmo com espaços estranhos da cópia do PDF', () => {
    const variacoes = [
      'Curso:\u00a0ENGENHARIA\u00a0DE\u00a0SOFTWARE/FCTE - BACHARELADO',
      'Curso:   ENGENHARIA  DE\nSOFTWARE / FCTE - BACHARELADO',
      'Curso: Engenharia de Software/FCTE - Bacharelado',
      'Curso: ENGENHARIA DE SOFTWARE - FCTE - BACHARELADO',
    ]

    for (const linha of variacoes) {
      expect(
        lerHistorico(
          COLUNAS_LADO_A_LADO.replace(
            'Curso:   ENGENHARIA DE SOFTWARE/FCTE - BACHARELADO - DIURNO',
            linha,
          ),
        ).doCurso,
      ).toBe(true)
    }
  })

  it('reconhece pelas disciplinas FGA quando a linha do curso some', () => {
    const tabela = ['FGA0168', 'FGA0163', 'FGA0157', 'FGA0084', 'FGA0133']
      .map((codigo) => `2024.1 ${codigo} DISCIPLINA 60 01 90,0 MS APR`)
      .join('\n')

    expect(lerHistorico(`Cursados/Cursando\n${tabela}\nLegenda`).doCurso).toBe(
      true,
    )
  })

  it('reconhece de qual curso é o histórico', () => {
    expect(
      lerHistorico(
        COLUNAS_LADO_A_LADO.replace(
          'ENGENHARIA DE SOFTWARE/FCTE',
          'CIÊNCIA DA COMPUTAÇÃO/CIC',
        ),
      ).doCurso,
    ).toBe(false)
    // Uma disciplina com o mesmo nome não confunde: falta a barra do curso.
    expect(
      lerHistorico(
        'Curso: CIÊNCIA DA COMPUTAÇÃO/CIC\nFGA0001 ENGENHARIA DE SOFTWARE 60 APR',
      ).doCurso,
    ).toBe(false)
  })
})

// Histórico de mentira de outro curso, no formato do PDF copiado do SIGAA.
const CONTABEIS = `SIGAA - Sistema Integrado de Gestão de Atividades Acadêmicas
Histórico Escolar - Emitido em: 01/01/2026 às 10:00
Dados Pessoais
Nome: FULANA DE TAL
Dados do Vínculo do(a) Discente
Curso:
CIÊNCIAS CONTÁBEIS/CCA - BACHARELADO - DIURNO
Status: ATIVO
Componentes Curriculares Cursados/Cursando
Ano/Período
Letivo Componente Curricular CH Turma Freq % Nota
Situação
2022.2 CCA0015 CONTABILIDADE GERAL 1
Dr. PROFESSOR UM (60h) 60 01 98,0 MM
APR
2022.2 MAT0025 CÁLCULO 1
Dra. PROFESSORA DOIS (60h), Dra. PROFESSORA TRÊS (30h) 90 23 97,0 MM
APR
2023.1 CCA0077 CONTABILIDADE GERAL 2
Dr. PROFESSOR QUATRO (60h) 60 02 100,0 MI
REP
2023.1 EST0023 PROBABILIDADE E ESTATÍSTICA
Dr. PROFESSOR CINCO (60h) 60 03 100,0 MM
APR
* Comp. Optativo e Comp. Equivalente a Obrig. & Comp. Equivalente a Optativo # Comp. Eletivo
SIGLA SIGNIFICADO SITUAÇÃO
APR Aprovado(a) por média Aluno(a) aprovado(a) com média maior ou igual a 5,0.
CANC Cancelado Matrícula em turma cancelada.
DISP Dispensado(a) Aproveitou o componente e foi dispensado(a).
MATR Matriculado(a) Matriculado(a) na turma.
REP Reprovado(a) por média Aluno(a) com média inferior a 5,0.
Legenda
REPF Reprovado(a) por falta Reprovado(a) por não atender aos critérios de assiduidade.
Página 1 de
2
SIGAA - Sistema Integrado de Gestão de Atividades Acadêmicas
Legenda
TRANC Trancado Matrícula em turma trancada.
CUMP Cumpriu Ganhou o Componente por Aproveitamento.
Carga Horária Integralizada/Pendente
Obrigatórias
Optativos Complementares
Total
Exigido
2130 h
930 h
0 h
3060 h
Integralizado
210 h
0 h
0 h
210 h
Pendente
1920 h
930 h
0 h
2850 h
Componentes Curriculares Obrigatórios Pendentes:3
Código
Componente Curricular CH
CCA0077
CONTABILIDADE GERAL 2 60 h
CCA0111
METODOLOGIA DA PESQUISA EM CIÊNCIAS CONTÁBEIS 30 h
FDD0015
LEGISLAÇÃO SOCIAL 60 h
Para verificar a autenticidade deste documento entre em https://sig.unb.br/sigaa/documentos/
Página 2 de
2
`

describe('lerHistoricoGeral (qualquer curso)', () => {
  it('lê o curso, os totais de horas, as cursadas e as pendentes', () => {
    const lido = lerHistoricoGeral(CONTABEIS)

    expect(lido.curso).toBe('CIÊNCIAS CONTÁBEIS')
    expect(lido.exigido).toEqual({
      obrigatorias: 2130,
      optativas: 930,
      complementares: 0,
      total: 3060,
    })
    expect(lido.integralizado.total).toBe(210)
    expect(lido.cursadas).toEqual([
      { codigo: 'CCA0015', nome: 'CONTABILIDADE GERAL 1', tipo: 'obrigatoria' },
      {
        codigo: 'EST0023',
        nome: 'PROBABILIDADE E ESTATÍSTICA',
        tipo: 'obrigatoria',
      },
      { codigo: 'MAT0025', nome: 'CÁLCULO 1', tipo: 'obrigatoria' },
    ])
    expect(lido.pendentes).toEqual([
      { codigo: 'CCA0077', nome: 'CONTABILIDADE GERAL 2', ch: 60 },
      {
        codigo: 'CCA0111',
        nome: 'METODOLOGIA DA PESQUISA EM CIÊNCIAS CONTÁBEIS',
        ch: 30,
      },
      { codigo: 'FDD0015', nome: 'LEGISLAÇÃO SOCIAL', ch: 60 },
    ])
  })

  it('separa obrigatórias, optativas e eletivas pela marca do SIGAA', () => {
    const tipos = Object.fromEntries(
      lerHistoricoGeral(COLUNAS_LADO_A_LADO).cursadas.map((item) => [
        item.codigo,
        item.tipo,
      ]),
    )

    expect(tipos.ADM0192).toBe('eletiva')
    expect(tipos.CIC0004).toBe('obrigatoria')
  })

  it('não guarda nada pessoal', () => {
    const texto = JSON.stringify(lerHistoricoGeral(CONTABEIS))

    expect(texto).not.toContain('FULANA')
    expect(texto).not.toContain('PROFESSOR')
  })

  it('não é de Engenharia de Software, mas é um histórico', () => {
    expect(lerHistorico(CONTABEIS).doCurso).toBe(false)
    expect(lerHistoricoGeral(COLUNAS_LADO_A_LADO).curso).toBe(
      'ENGENHARIA DE SOFTWARE',
    )
  })

  it('texto qualquer não é histórico', () => {
    expect(lerHistoricoGeral('')).toBeNull()
    expect(lerHistoricoGeral('lista de compras: arroz, feijão')).toBeNull()
  })

  it('deixa o nome da disciplina mais legível', () => {
    expect(nomeBonito('METODOLOGIA DA PESQUISA EM CIÊNCIAS CONTÁBEIS')).toBe(
      'Metodologia da Pesquisa em Ciências Contábeis',
    )
    expect(nomeBonito('ESTUDOS EM ADMINISTRAÇÃO II')).toBe(
      'Estudos em Administração II',
    )
  })
})
