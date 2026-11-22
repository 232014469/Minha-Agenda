// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import Lembrete from './Lembrete'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('Lembrete', () => {
  it('guarda o texto escrito e mostra de novo ao voltar', () => {
    render(<Lembrete />)

    fireEvent.change(screen.getByLabelText('Lembrete'), {
      target: { value: 'Levar a calculadora na prova' },
    })
    cleanup()
    render(<Lembrete compacto />)

    expect(screen.getByLabelText('Lembrete')).toHaveValue(
      'Levar a calculadora na prova',
    )
  })

  it('corta o texto em 90 letras, para caber no papel', () => {
    render(<Lembrete />)

    fireEvent.change(screen.getByLabelText('Lembrete'), {
      target: { value: 'a'.repeat(250) },
    })

    expect(screen.getByLabelText('Lembrete').value).toHaveLength(90)
  })
})
