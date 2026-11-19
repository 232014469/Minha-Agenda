// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { mudarPreferencia, recarregarPreferencias } from '../preferencias'
import GatinhosNaTela from './GatinhosNaTela'
import { EVENTO_CONCLUIU } from './gatos'

afterEach(() => {
  cleanup()
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
})
