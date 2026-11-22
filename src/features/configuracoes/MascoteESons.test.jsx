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
  it('escolhe o mascote e liga ou desliga os sons', () => {
    render(<MascoteESons />)

    expect(screen.getByRole('radio', { name: 'Gatinho marrom' })).toBeChecked()

    fireEvent.click(screen.getByRole('radio', { name: 'Gatinho preto' }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Bordões/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Miados/ }))

    expect(screen.getByRole('radio', { name: 'Gatinho preto' })).toBeChecked()
    // Sem sons, os bordões ficam desligados também
    expect(screen.getByRole('checkbox', { name: /Bordões/ })).toBeDisabled()
    expect(lerPreferencias()).toEqual({
      mascote: 'gato05',
      sons: false,
      bordoes: false,
      cantinho: 'gatinho',
      ceu: true,
      vidro: true,
    })
  })

  it('escolhe o que fica no alto do menu; sem o gatinho, as opções dele desligam', () => {
    render(<MascoteESons />)

    expect(
      screen.getByRole('radio', { name: /^Gatinho bichinho/ }),
    ).toBeChecked()

    fireEvent.click(screen.getByRole('radio', { name: /^Hoje/ }))
    expect(lerPreferencias().cantinho).toBe('hoje')

    fireEvent.click(screen.getByRole('radio', { name: /^Lembrete/ }))
    expect(lerPreferencias().cantinho).toBe('lembrete')

    fireEvent.click(screen.getByRole('radio', { name: /^Relógio de estudo/ }))
    expect(lerPreferencias().cantinho).toBe('relogio')
    expect(screen.getByRole('radio', { name: 'Gatinho marrom' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: /Miados/ })).toBeDisabled()
    // Só sobraram as chaves de miados e bordões
    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
  })
})
