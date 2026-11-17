// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import DadosProvider from '../../dados/DadosProvider'
import { DISCIPLINAS, FLUXOGRAMA, somarCreditos } from './dadosFluxograma'
import NovaMateriaPage from './NovaMateriaPage'
import { CHAVE } from '../../dados/armazenamento'

function abrir() {
  return render(
    <MemoryRouter>
      <DadosProvider>
        <NovaMateriaPage />
      </DadosProvider>
    </MemoryRouter>,
  )
}

function salvos() {
  return JSON.parse(localStorage.getItem(CHAVE))
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('dados do fluxograma', () => {
  it('bate com os créditos de cada semestre do fluxograma oficial', () => {
    expect(FLUXOGRAMA.map(somarCreditos)).toEqual([
      24, 24, 26, 24, 24, 24, 24, 26, 22, 17,
    ])
    expect(somarCreditos(DISCIPLINAS)).toBe(235)
  })

  it('não repete o id de nenhuma disciplina', () => {
    const ids = DISCIPLINAS.map((item) => item.id)

    expect(new Set(ids).size).toBe(ids.length)
  })
})

const HISTORICO_ES = [
  'Curso: ENGENHARIA DE SOFTWARE/FCTE - BACHARELADO - DIURNO',
  'Componentes Curriculares Cursados/Cursando',
  '2023.2 MAT0025 CÁLCULO 1 90 -- -- - CUMP',
  '2023.2 CIC0004 ALGORITMOS 90 09 90,0 MM APR',
  '2024.1 FGA0085 MATEMÁTICA DISCRETA 1 60 01 92,0 MI REP',
  'Legenda',
].join('\n')

function colarHistorico(texto) {
  fireEvent.click(screen.getByRole('button', { name: 'Importar do histórico' }))
  fireEvent.change(screen.getByLabelText('Texto do histórico'), {
    target: { value: texto },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Importar histórico' }))
}

describe('Fluxograma escondido até importar o histórico', () => {
  it('começa só com o convite para importar', () => {
    abrir()

    expect(
      screen.getByRole('button', { name: 'Importar do histórico' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('list', { name: '1º semestre' }),
    ).not.toBeInTheDocument()
  })

  it('histórico de Engenharia de Software mostra o fluxograma marcado', () => {
    abrir()
    colarHistorico(HISTORICO_ES)

    expect([...salvos().cursadas].sort()).toEqual(['CIC0004', 'MAT0025'])
    expect(salvos().fluxogramaAtivo).toBe(true)
    expect(
      screen.getByRole('list', { name: '1º semestre' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Cálculo 1: cursada' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('histórico de outro curso mostra o progresso no curso', () => {
    abrir()
    colarHistorico(
      [
        'Curso:',
        'CIÊNCIAS CONTÁBEIS/CCA - BACHARELADO - DIURNO',
        'Componentes Curriculares Cursados/Cursando',
        '2022.2 CCA0015 CONTABILIDADE GERAL 1',
        '60 01 98,0 MM',
        'APR',
        'Legenda',
        'Carga Horária Integralizada/Pendente',
        'Exigido 2130 h 930 h 0 h 3060 h',
        'Integralizado 60 h 0 h 0 h 60 h',
        'Componentes Curriculares Obrigatórios Pendentes:1',
        'CCA0111',
        'METODOLOGIA DA PESQUISA EM CIÊNCIAS CONTÁBEIS 30 h',
      ].join('\n'),
    )

    expect(
      screen.getByRole('heading', { name: 'Progresso no curso' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Ciências Contábeis')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()
    expect(
      screen.queryByRole('list', { name: '1º semestre' }),
    ).not.toBeInTheDocument()
    expect(salvos().cursadas).toEqual([])
    expect(salvos().progressoCurso.curso).toBe('CIÊNCIAS CONTÁBEIS')

    // O "+" traz a obrigatória para o formulário, com a carga horária dela.
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Cursar Metodologia da Pesquisa em Ciências Contábeis neste semestre',
      }),
    )
    expect(screen.getByLabelText('Nome da matéria')).toHaveValue(
      'Metodologia da Pesquisa em Ciências Contábeis',
    )
    expect(screen.getByLabelText('Carga horária')).toHaveValue('30')

    fireEvent.click(screen.getByRole('button', { name: 'Esconder progresso' }))
    expect(
      screen.queryByRole('heading', { name: 'Progresso no curso' }),
    ).not.toBeInTheDocument()
  })

  it('texto que não é histórico avisa e não muda nada', () => {
    abrir()
    colarHistorico('lista de compras: arroz, feijão')

    expect(screen.getByRole('status')).toHaveTextContent(
      'não parece ser um histórico do SIGAA',
    )
    expect(salvos()?.progressoCurso).toBeUndefined()
  })

  it('"Esconder fluxograma" volta ao convite, sem perder as marcações', () => {
    abrir()
    colarHistorico(HISTORICO_ES)
    fireEvent.click(screen.getByRole('button', { name: 'Esconder fluxograma' }))

    expect(
      screen.queryByRole('list', { name: '1º semestre' }),
    ).not.toBeInTheDocument()
    expect(salvos().fluxogramaAtivo).toBe(false)
    expect(salvos().cursadas).toHaveLength(2)
  })
})

describe('Fluxograma na aba Adicionar matéria', () => {
  // Nestes testes o fluxograma já está à mostra.
  beforeEach(() => {
    localStorage.setItem(
      CHAVE,
      JSON.stringify({ materias: [], tarefas: [], fluxogramaAtivo: true }),
    )
  })

  it('mostra os 10 semestres', () => {
    abrir()

    expect(
      screen.getByRole('list', { name: '1º semestre' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('list', { name: '10º semestre' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Créditos cursados no curso' }),
    ).toHaveAttribute('aria-valuetext', '0 de 235 · 0%')
  })

  it('marca e desmarca uma disciplina como cursada', () => {
    abrir()

    const botao = screen.getByRole('button', { name: 'Cálculo 1: cursada' })

    expect(botao).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(botao)

    expect(botao).toHaveAttribute('aria-pressed', 'true')
    expect(botao).toHaveTextContent('Cursada')
    expect(salvos().cursadas).toEqual(['MAT0025'])
    expect(
      screen.getByRole('progressbar', { name: 'Créditos cursados no curso' }),
    ).toHaveAttribute('aria-valuetext', '6 de 235 · 3%')

    fireEvent.click(botao)
    expect(salvos().cursadas).toEqual([])
  })

  it('cada optativa é marcada separadamente', () => {
    abrir()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Optativa 2 do 7º semestre: cursada',
      }),
    )

    expect(salvos().cursadas).toEqual(['OPT-7-2'])
  })

  it('o "+" leva a disciplina para o formulário de cadastro', () => {
    abrir()

    const setimo = screen.getByRole('list', { name: '7º semestre' })

    fireEvent.click(
      within(setimo).getByRole('button', {
        name: 'Cursar Paradigmas de Programação neste semestre',
      }),
    )

    expect(screen.getByLabelText('Nome da matéria')).toHaveValue(
      'Paradigmas de Programação',
    )
  })
})
