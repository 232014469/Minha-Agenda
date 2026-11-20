// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { mudarPreferencia, recarregarPreferencias } from '../preferencias'
import GatinhosNaTela from './GatinhosNaTela'
import { EVENTO_SAIU_PASSEAR, EVENTO_VOLTOU_DO_PASSEIO } from './gatos'
import { TEMPO_PARA_SAIR } from './rotina'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  localStorage.clear()
  recarregarPreferencias()
})

describe('GatinhosNaTela', () => {
  it('o mascote sai do lugar antes do passeio e volta depois', () => {
    vi.useFakeTimers()
    const avisos = []
    const anotar = (evento) => avisos.push(evento.type)

    window.addEventListener(EVENTO_SAIU_PASSEAR, anotar)
    window.addEventListener(EVENTO_VOLTOU_DO_PASSEIO, anotar)
    const { container, unmount } = render(<GatinhosNaTela />)

    act(() => vi.advanceTimersByTime(40_000))
    expect(avisos).toEqual([EVENTO_SAIU_PASSEAR])
    expect(container.querySelector('.gatinho-passeio')).toBeNull()

    act(() => vi.advanceTimersByTime(TEMPO_PARA_SAIR))
    expect(container.querySelector('.gatinho-passeio')).not.toBeNull()
    expect(avisos).toEqual([EVENTO_SAIU_PASSEAR])

    // Se os gatinhos somem no meio do passeio, o mascote volta ao lugar
    unmount()
    expect(avisos).toEqual([EVENTO_SAIU_PASSEAR, EVENTO_VOLTOU_DO_PASSEIO])

    window.removeEventListener(EVENTO_SAIU_PASSEAR, anotar)
    window.removeEventListener(EVENTO_VOLTOU_DO_PASSEIO, anotar)
  })

  it('não passeia quando os gatinhos estão desligados', () => {
    vi.useFakeTimers()
    mudarPreferencia('gatinhos', false)
    const { container } = render(<GatinhosNaTela />)

    act(() => vi.advanceTimersByTime(60_000))

    expect(container.querySelector('.gatinho-passeio')).toBeNull()
  })
})
