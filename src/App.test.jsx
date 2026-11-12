// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import App from './App'
import DadosProvider from './dados/DadosProvider'
import { CHAVE } from './dados/armazenamento'

function abrir(caminho = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[caminho]}>
      <DadosProvider>
        <App />
      </DadosProvider>
    </MemoryRouter>,
  )
}

function salvos() {
  return JSON.parse(localStorage.getItem(CHAVE))
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(
    CHAVE,
    JSON.stringify({
      versao: 1,
      semestre: '2026.1',
      materias: [
        { id: 1, nome: 'Cálculo', periodo: '2026.1', cor: 'lilas' },
        { id: 2, nome: 'Física', periodo: '2026.2', cor: 'verde' },
      ],
      tarefas: [],
      notas: [],
    }),
  )
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('Semestre', () => {
  it('troca o que aparece e lembra a escolha', () => {
    abrir()

    expect(screen.getByText('Cálculo')).toBeInTheDocument()
    expect(screen.queryByText('Física')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Semestre'), {
      target: { value: '2026.2' },
    })

    expect(screen.getByText('Física')).toBeInTheDocument()
    expect(screen.queryByText('Cálculo')).not.toBeInTheDocument()
    expect(salvos().semestre).toBe('2026.2')
  })

  it('não mostra a página de matéria de outro semestre', () => {
    abrir('/materias/2')

    expect(screen.getByText('Semestre 2026.1')).toBeInTheDocument()
  })

  it('ao cadastrar em outro semestre, passa a mostrar esse semestre', () => {
    abrir('/adicionar-materia')

    const campos = screen.getAllByLabelText('Semestre')
    const doFormulario = campos.find((campo) => campo.tagName === 'INPUT')

    fireEvent.change(screen.getByLabelText('Nome da matéria'), {
      target: { value: 'Química' },
    })
    fireEvent.change(doFormulario, { target: { value: '2027.1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar matéria' }))

    const seletor = campos.find((campo) => campo.tagName === 'SELECT')

    expect(seletor).toHaveValue('2027.1')
    expect(salvos().semestre).toBe('2027.1')
  })
})
