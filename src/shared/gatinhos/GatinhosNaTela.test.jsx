// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { mudarPreferencia, recarregarPreferencias } from '../preferencias'
import GatinhosNaTela from './GatinhosNaTela'
import {
  EVENTO_CONCLUIU,
  EVENTO_SAIU_PASSEAR,
  EVENTO_VOLTOU_DO_PASSEIO,
} from './gatos'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  localStorage.clear()
  recarregarPreferencias()
})

describe('GatinhosNaTela', () => {
  it('um gatinho comemora quando uma tarefa é concluída', () => {
    render(<GatinhosNaTela />)

    act(() => window.dispatchEvent(new CustomEvent(EVENTO_CONCLUIU)))

    expect(screen.getByRole('status')).toHaveTextContent('Feito!')
  })

  it('não aparece quando os gatinhos estão desligados', () => {
    mudarPreferencia('gatinhos', false)
    render(<GatinhosNaTela />)

    act(() => window.dispatchEvent(new CustomEvent(EVENTO_CONCLUIU)))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('o mascote sai do menu antes do passeio e volta depois', () => {
    vi.useFakeTimers()
    const avisos = []
    const anotar = (evento) => avisos.push(evento.type)

    window.addEventListener(EVENTO_SAIU_PASSEAR, anotar)
    window.addEventListener(EVENTO_VOLTOU_DO_PASSEIO, anotar)
    const { container, unmount } = render(<GatinhosNaTela />)

    act(() => vi.advanceTimersByTime(40_000))
    expect(avisos).toEqual([EVENTO_SAIU_PASSEAR])
    expect(container.querySelector('.gatinho-passeio')).toBeNull()

    act(() => vi.advanceTimersByTime(2200))
    const passeio = container.querySelector('.gatinho-passeio')

    expect(passeio).not.toBeNull()
    expect(avisos).toEqual([EVENTO_SAIU_PASSEAR])

    // Se os gatinhos somem no meio do passeio, o mascote volta ao menu
    unmount()
    expect(avisos).toEqual([EVENTO_SAIU_PASSEAR, EVENTO_VOLTOU_DO_PASSEIO])

    window.removeEventListener(EVENTO_SAIU_PASSEAR, anotar)
    window.removeEventListener(EVENTO_VOLTOU_DO_PASSEIO, anotar)
  })
})
