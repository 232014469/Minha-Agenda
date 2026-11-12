// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import DadosProvider from '../../dados/DadosProvider'
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

function salvas() {
  return JSON.parse(localStorage.getItem(CHAVE)).materias
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('Adicionar matéria', () => {
  it('só libera o botão quando há um nome', () => {
    abrir()

    const botao = screen.getByRole('button', { name: 'Adicionar matéria' })

    expect(botao).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Nome da matéria'), {
      target: { value: '   ' },
    })
    expect(botao).toBeDisabled()
  })

  it('pede o semestre', () => {
    abrir()

    fireEvent.change(screen.getByLabelText('Nome da matéria'), {
      target: { value: 'Cálculo 1' },
    })
    fireEvent.change(screen.getByLabelText('Semestre'), {
      target: { value: ' ' },
    })

    expect(
      screen.getByRole('button', { name: 'Adicionar matéria' }),
    ).toBeDisabled()
  })

  it('salva a matéria, avisa e deixa o formulário pronto para a próxima', () => {
    abrir()

    fireEvent.change(screen.getByLabelText('Nome da matéria'), {
      target: { value: '  Cálculo 1 ' },
    })
    fireEvent.change(screen.getByLabelText('Semestre'), {
      target: { value: '2026.2' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar matéria' }))

    expect(salvas()).toEqual([
      expect.objectContaining({ nome: 'Cálculo 1', periodo: '2026.2' }),
    ])
    expect(screen.getByRole('status')).toHaveTextContent(
      '“Cálculo 1” adicionada em 2026.2.',
    )
    expect(screen.getByLabelText('Nome da matéria')).toHaveValue('')
    expect(screen.getByLabelText('Semestre')).toHaveValue('2026.2')
    expect(
      screen.getByRole('link', { name: 'Ver no Dashboard' }),
    ).toHaveAttribute('href', '/dashboard')
  })
})

describe('Cor da matéria', () => {
  it('oferece as 8 cores e sugere a primeira livre', () => {
    abrir()

    const cores = screen.getAllByRole('radio')

    expect(cores).toHaveLength(8)
    expect(screen.getByRole('radio', { name: 'Lilás' })).toBeChecked()
  })

  it('salva a cor escolhida e já sugere outra para a próxima', () => {
    abrir()

    fireEvent.change(screen.getByLabelText('Nome da matéria'), {
      target: { value: 'Física' },
    })
    fireEvent.click(screen.getByRole('radio', { name: 'Turquesa' }))
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar matéria' }))

    expect(salvas()[0].cor).toBe('turquesa')
    expect(screen.getByRole('radio', { name: 'Lilás' })).toBeChecked()
  })
})
