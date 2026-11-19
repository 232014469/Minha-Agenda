// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { aplicarModo, aplicarTema, lerModo, lerTema } from '../../config/tema'
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

  it('automático segue o sistema do aparelho', () => {
    window.matchMedia = () => ({ matches: true })
    expect(aplicarModo('auto')).toBe('auto')
    expect(document.documentElement.dataset.modo).toBe('escuro')

    window.matchMedia = () => ({ matches: false })
    aplicarModo('auto')
    expect(document.documentElement.dataset.modo).toBe('claro')

    delete window.matchMedia
  })
})
