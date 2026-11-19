// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { mudarPreferencia, recarregarPreferencias } from '../preferencias'
import { EVENTO_CONCLUIU, EVENTO_TRISTE } from '../gatinhos/gatos'
import Mascote from './Mascote'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  localStorage.clear()
  recarregarPreferencias()
})

describe('Mascote', () => {
  it('uiva ao clicar e volta ao normal depois', () => {
    vi.useFakeTimers()
    render(<Mascote />)

    const lobinho = screen.getByRole('button', { name: /Lobinho/ })

    fireEvent.click(lobinho)
    expect(lobinho).toHaveClass('mascote-uivando')

    act(() => vi.advanceTimersByTime(1700))
    expect(lobinho).not.toHaveClass('mascote-uivando')
  })

  it('vira o gatinho escolhido nas Configurações, que pula e mia', () => {
    mudarPreferencia('mascote', 'gato03')
    render(<Mascote />)

    const gatinho = screen.getByRole('button', { name: /Gatinho laranja/ })

    fireEvent.click(gatinho)
    expect(gatinho).toHaveClass('mascote-uivando')
    expect(gatinho).toHaveTextContent('Miau!')
  })

  it('o próprio mascote comemora quando uma tarefa é concluída', () => {
    mudarPreferencia('mascote', 'gato05')
    render(<Mascote />)

    act(() => window.dispatchEvent(new CustomEvent(EVENTO_CONCLUIU)))

    const gatinho = screen.getByRole('button', { name: /Gatinho preto/ })

    expect(gatinho).toHaveClass('mascote-uivando')
    expect(gatinho).toHaveTextContent('Feito! 🎉')
    expect(screen.getByRole('status')).toHaveTextContent('Tarefa concluída!')
  })

  it('o lobinho também comemora', () => {
    render(<Mascote />)

    act(() => window.dispatchEvent(new CustomEvent(EVENTO_CONCLUIU)))

    expect(screen.getByRole('button', { name: /Lobinho/ })).toHaveTextContent(
      'Feito! 🎉',
    )
  })

  it('fica triste quando uma tarefa não é realizada ou é excluída', () => {
    mudarPreferencia('mascote', 'gato01')
    render(<Mascote />)

    act(() => window.dispatchEvent(new CustomEvent(EVENTO_TRISTE)))

    expect(
      screen.getByRole('button', { name: /Gatinho marrom/ }),
    ).toHaveTextContent('Ah… 😿')
  })

  it('pede atenção depois de 5 cliques seguidos', () => {
    mudarPreferencia('mascote', 'gato02')
    render(<Mascote />)

    const gatinho = screen.getByRole('button', { name: /Gatinho cinza/ })

    for (let i = 0; i < 4; i += 1) fireEvent.click(gatinho)
    expect(gatinho).toHaveTextContent('Miau!')

    fireEvent.click(gatinho)
    expect(gatinho).toHaveTextContent('Miaaau! 🥺')
  })
})
