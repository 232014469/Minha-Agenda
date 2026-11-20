// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { mudarPreferencia, recarregarPreferencias } from '../preferencias'
import {
  EVENTO_CONCLUIU,
  EVENTO_FALTA,
  EVENTO_SAIU_PASSEAR,
  EVENTO_TRISTE,
  EVENTO_VOLTOU_DO_PASSEIO,
} from '../gatinhos/gatos'
import Mascote from './Mascote'

// Os testes de sempre usam os miados; os bordões têm testes próprios no fim.
beforeEach(() => {
  mudarPreferencia('bordoes', false)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  localStorage.clear()
  recarregarPreferencias()
})

describe('Mascote', () => {
  it('começa com o gatinho marrom', () => {
    render(<Mascote />)

    expect(
      screen.getByRole('button', { name: /Gatinho marrom/ }),
    ).toBeInTheDocument()
  })

  it('vira o gatinho escolhido nas Configurações, que pula e mia', () => {
    mudarPreferencia('mascote', 'gato03')
    render(<Mascote />)

    const gatinho = screen.getByRole('button', { name: /Gatinho laranja/ })

    fireEvent.click(gatinho)
    expect(gatinho).toHaveClass('mascote-reagindo')
    expect(gatinho).toHaveTextContent('Miau!')
  })

  it('o próprio mascote comemora quando uma tarefa é concluída', () => {
    mudarPreferencia('mascote', 'gato05')
    render(<Mascote />)

    act(() => window.dispatchEvent(new CustomEvent(EVENTO_CONCLUIU)))

    const gatinho = screen.getByRole('button', { name: /Gatinho preto/ })

    expect(gatinho).toHaveClass('mascote-reagindo')
    expect(gatinho).toHaveTextContent('Feito! 🎉')
    expect(screen.getByRole('status')).toHaveTextContent('Tarefa concluída!')
  })

  it('fica triste quando uma tarefa não é realizada ou é excluída', () => {
    mudarPreferencia('mascote', 'gato01')
    render(<Mascote />)

    act(() => window.dispatchEvent(new CustomEvent(EVENTO_TRISTE)))

    expect(
      screen.getByRole('button', { name: /Gatinho marrom/ }),
    ).toHaveTextContent('Ah… 😿')
  })

  it('se machuca (fica vermelho) depois de 5 cliques seguidos', () => {
    mudarPreferencia('mascote', 'gato02')
    render(<Mascote />)

    const gatinho = screen.getByRole('button', { name: /Gatinho cinza/ })

    for (let i = 0; i < 4; i += 1) fireEvent.click(gatinho)
    expect(gatinho).toHaveTextContent('Miau!')

    fireEvent.click(gatinho)
    expect(gatinho).toHaveTextContent('Ai! 😾')
    expect(gatinho.querySelector('.sprite').style.backgroundImage).toContain(
      '-hurt',
    )
  })

  it('o gatinho tem rotina: depois de um tempo parado, senta', () => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    mudarPreferencia('mascote', 'gato03')
    const { container } = render(<Mascote />)
    const desenho = () =>
      container.querySelector('.sprite').style.backgroundImage

    expect(desenho()).toContain('idle_blink')

    act(() => vi.advanceTimersByTime(5000))
    expect(desenho()).toContain('-sit')

    vi.restoreAllMocks()
  })

  it('sem rotina para quem prefere menos movimento', () => {
    vi.useFakeTimers()
    window.matchMedia = vi.fn(() => ({ matches: true }))
    mudarPreferencia('mascote', 'gato03')
    const { container } = render(<Mascote />)

    act(() => vi.advanceTimersByTime(60000))
    expect(container.querySelector('.sprite').style.backgroundImage).toContain(
      'idle_blink',
    )

    delete window.matchMedia
  })

  it('sai do menu para o passeio e só volta quando ele termina', () => {
    vi.useFakeTimers()
    mudarPreferencia('mascote', 'gato03')
    const { container } = render(<Mascote />)
    const gatinho = screen.getByRole('button', { name: /Gatinho laranja/ })

    act(() => window.dispatchEvent(new CustomEvent(EVENTO_SAIU_PASSEAR)))
    // Um passo de cada vez: pula do cestinho, anda até a borda e espera fora
    act(() => vi.advanceTimersByTime(1000))
    act(() => vi.advanceTimersByTime(3000))
    act(() => vi.advanceTimersByTime(60000))
    expect(gatinho.style.left).toBe('-48px')
    expect(container.querySelector('.sprite')).toBeNull()

    // Fora do menu, não reage
    act(() => window.dispatchEvent(new CustomEvent(EVENTO_CONCLUIU)))
    expect(gatinho).not.toHaveClass('mascote-reagindo')

    act(() => window.dispatchEvent(new CustomEvent(EVENTO_VOLTOU_DO_PASSEIO)))
    expect(gatinho.style.left).toBe('var(--mascote-meio, 50%)')
    expect(container.querySelector('.sprite').style.backgroundImage).toContain(
      '-walk',
    )
  })

  it('reclama quando mais uma falta é anotada', () => {
    mudarPreferencia('mascote', 'gato03')
    render(<Mascote />)
    const gatinho = screen.getByRole('button', { name: /Gatinho laranja/ })

    act(() => window.dispatchEvent(new CustomEvent(EVENTO_FALTA)))
    expect(gatinho).toHaveTextContent('Mais uma falta? 😾')
    expect(gatinho.querySelector('.sprite').style.backgroundImage).toContain(
      '-hurt',
    )
  })

  it('com os bordões ligados: "É gata!" ao concluir e "Eu, hein!" na falta', () => {
    mudarPreferencia('bordoes', true)
    mudarPreferencia('mascote', 'gato03')
    render(<Mascote />)
    const gatinho = screen.getByRole('button', { name: /Gatinho laranja/ })

    act(() => window.dispatchEvent(new CustomEvent(EVENTO_CONCLUIU)))
    expect(gatinho).toHaveTextContent('É gata! ✨')

    act(() => window.dispatchEvent(new CustomEvent(EVENTO_FALTA)))
    expect(gatinho).toHaveTextContent('Eu, hein! 😾')
  })
})
