// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import DadosProvider from '../../dados/DadosProvider'
import { EVENTO_EXTRAS_RECEBIDOS, ITENS_EXTRAS } from '../../sync/extras'
import PlanoDeFormatura from './PlanoDeFormatura'

function abrir() {
  return render(
    <MemoryRouter>
      <DadosProvider>
        <PlanoDeFormatura />
      </DadosProvider>
    </MemoryRouter>,
  )
}

const plano = () => JSON.parse(localStorage.getItem(ITENS_EXTRAS.plano))

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('Plano de formatura', () => {
  it('monta um semestre, escreve uma disciplina e replaneja', () => {
    abrir()

    const novo = screen.getByRole('button', { name: /^Semestre \d/ })
    const proximo = novo.textContent.replace(/[^\d.]/g, '')

    fireEvent.click(novo)
    const coluna = screen.getByRole('article', { name: `Semestre ${proximo}` })

    fireEvent.click(
      within(coluna).getByRole('button', { name: /Escrever uma disciplina/ }),
    )
    fireEvent.change(within(coluna).getByLabelText(/Nome da disciplina/), {
      target: { value: 'Compiladores' },
    })
    fireEvent.click(within(coluna).getByRole('button', { name: 'Pôr' }))

    expect(within(coluna).getByText('Compiladores')).toBeInTheDocument()
    expect(plano().itens).toMatchObject([
      { nome: 'Compiladores', horas: 60, semestre: proximo },
    ])

    // Replanejar: manda para um semestre novo
    const menu = within(coluna).getByLabelText('Mover Compiladores')
    const depois = [...menu.options].find((opcao) =>
      opcao.textContent.includes('(novo)'),
    ).value

    fireEvent.change(menu, { target: { value: depois } })

    expect(
      within(
        screen.getByRole('article', { name: `Semestre ${depois}` }),
      ).getByText('Compiladores'),
    ).toBeInTheDocument()
    expect(within(coluna).queryByText('Compiladores')).not.toBeInTheDocument()
  })

  it('mostra o plano que chega de outro aparelho', () => {
    abrir()

    localStorage.setItem(
      ITENS_EXTRAS.plano,
      JSON.stringify({
        semestres: ['2031.1'],
        itens: [
          {
            id: 'a',
            nome: 'TCC 1',
            codigo: '',
            tipo: 'obrigatoria',
            horas: 60,
            semestre: '2031.1',
          },
        ],
      }),
    )
    act(() => {
      window.dispatchEvent(
        new CustomEvent(EVENTO_EXTRAS_RECEBIDOS, { detail: ['plano'] }),
      )
    })

    expect(screen.getByText('TCC 1')).toBeInTheDocument()
  })
})
