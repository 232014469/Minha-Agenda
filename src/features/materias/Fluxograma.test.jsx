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

describe('Fluxograma na aba Adicionar matéria', () => {
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

  it('importa as aprovadas a partir do texto do histórico', () => {
    abrir()

    fireEvent.click(
      screen.getByRole('button', { name: 'Importar do histórico' }),
    )
    fireEvent.change(screen.getByLabelText('Texto do histórico'), {
      target: {
        value: [
          'Componentes Curriculares Cursados/Cursando',
          '2023.2 MAT0025 CÁLCULO 1 90 -- -- - CUMP',
          '2023.2 CIC0004 ALGORITMOS 90 09 90,0 MM APR',
          '2024.1 FGA0085 MATEMÁTICA DISCRETA 1 60 01 92,0 MI REP',
          'Legenda',
        ].join('\n'),
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Marcar cursadas' }))

    expect([...salvos().cursadas].sort()).toEqual(['CIC0004', 'MAT0025'])
    expect(screen.getByRole('status')).toHaveTextContent(
      '2 disciplinas do fluxograma aprovadas no histórico (2 novas marcadas).',
    )
    expect(
      screen.getByRole('button', { name: 'Cálculo 1: cursada' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })
})
