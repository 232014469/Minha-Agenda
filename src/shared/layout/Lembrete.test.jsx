// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { EVENTO_EXTRAS } from '../../sync/extras'
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

  it('abrir vazio não conta como mudança para os outros aparelhos', () => {
    const mudou = vi.fn()

    window.addEventListener(EVENTO_EXTRAS, mudou)
    render(<Lembrete compacto />)

    expect(mudou).not.toHaveBeenCalled()
    expect(localStorage.getItem('wolf-study.dados.lembrete')).toBeNull()

    fireEvent.change(screen.getByLabelText('Lembrete'), {
      target: { value: 'Prova na quarta' },
    })
    window.removeEventListener(EVENTO_EXTRAS, mudou)

    expect(mudou).toHaveBeenCalledOnce()
  })
})
