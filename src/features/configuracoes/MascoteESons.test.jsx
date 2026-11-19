// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import {
  lerPreferencias,
  recarregarPreferencias,
} from '../../shared/preferencias'
import MascoteESons from './MascoteESons'

afterEach(() => {
  cleanup()
  localStorage.clear()
  recarregarPreferencias()
})

describe('Mascote e sons', () => {
  it('escolhe o mascote e liga ou desliga sons e gatinhos', () => {
    render(<MascoteESons />)

    expect(screen.getByRole('radio', { name: 'Lobinho' })).toBeChecked()

    fireEvent.click(screen.getByRole('radio', { name: 'Gatinho preto' }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Sons/ }))
    fireEvent.click(
      screen.getByRole('checkbox', { name: /Gatinhos pela tela/ }),
    )

    expect(screen.getByRole('radio', { name: 'Gatinho preto' })).toBeChecked()
    expect(lerPreferencias()).toEqual({
      mascote: 'gato05',
      sons: false,
      gatinhos: false,
    })
  })
})
