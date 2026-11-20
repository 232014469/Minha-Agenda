// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import {
  aplicarModo,
  aplicarTema,
  ehNoite,
  lerModo,
  lerTema,
} from '../../config/tema'
import Tema from './Tema'

afterEach(() => {
  cleanup()
  localStorage.clear()
  delete document.documentElement.dataset.tema
  delete document.documentElement.dataset.modo
})

describe('Tema', () => {
  it('começa no verde e troca a cor do app ao escolher outro', () => {
    render(<Tema />)

    expect(screen.getByRole('radio', { name: 'Verde' })).toBeChecked()

    fireEvent.click(screen.getByRole('radio', { name: 'Rosa' }))

    expect(screen.getByRole('radio', { name: 'Rosa' })).toBeChecked()
    expect(document.documentElement.dataset.tema).toBe('rosa')
    expect(lerTema()).toBe('rosa')
  })

  it('tema desconhecido volta para o verde', () => {
    expect(aplicarTema('roxo-neon')).toBe('verde')
    expect(document.documentElement.dataset.tema).toBe('verde')
  })

  it('começa claro e passa para o escuro ao escolher', () => {
    render(<Tema />)

    expect(screen.getByRole('radio', { name: /Claro/ })).toBeChecked()

    fireEvent.click(screen.getByRole('radio', { name: /Escuro/ }))

    expect(document.documentElement.dataset.modo).toBe('escuro')
    expect(lerModo()).toBe('escuro')
  })

  it('automático: escuro à noite (18h às 6h) e claro de dia', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 19, 21, 30))
    expect(aplicarModo('auto')).toBe('auto')
    expect(document.documentElement.dataset.modo).toBe('escuro')

    // Amanhece: no minuto seguinte às 6h, volta a ficar claro sozinho
    vi.setSystemTime(new Date(2026, 10, 20, 5, 59, 30))
    vi.advanceTimersByTime(60_000)
    expect(document.documentElement.dataset.modo).toBe('claro')

    aplicarModo('claro')
    vi.useRealTimers()
  })

  it('sabe quando é noite', () => {
    expect(ehNoite(new Date(2026, 10, 19, 18, 0))).toBe(true)
    expect(ehNoite(new Date(2026, 10, 19, 3, 0))).toBe(true)
    expect(ehNoite(new Date(2026, 10, 19, 6, 0))).toBe(false)
    expect(ehNoite(new Date(2026, 10, 19, 17, 59))).toBe(false)
  })
})
