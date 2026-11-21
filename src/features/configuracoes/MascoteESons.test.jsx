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
  it('escolhe o mascote e liga ou desliga sons, gatinhos e o bichinho', () => {
    render(<MascoteESons />)

    expect(screen.getByRole('radio', { name: 'Gatinho marrom' })).toBeChecked()

    fireEvent.click(screen.getByRole('radio', { name: 'Gatinho preto' }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Bordões/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Miados/ }))
    fireEvent.click(
      screen.getByRole('checkbox', { name: /Gatinhos pela tela/ }),
    )
    fireEvent.click(screen.getByRole('checkbox', { name: /Bichinho virtual/ }))

    expect(screen.getByRole('radio', { name: 'Gatinho preto' })).toBeChecked()
    // Sem sons, os bordões ficam desligados também
    expect(screen.getByRole('checkbox', { name: /Bordões/ })).toBeDisabled()
    expect(lerPreferencias()).toEqual({
      mascote: 'gato05',
      sons: false,
      bordoes: false,
      gatinhos: false,
      tamagotchi: false,
    })
  })
})
