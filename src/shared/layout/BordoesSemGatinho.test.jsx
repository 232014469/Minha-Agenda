// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { EVENTO_CONCLUIU, EVENTO_FALTA } from '../gatinhos/gatos'
import { mudarPreferencia, recarregarPreferencias } from '../preferencias'
import { miar } from '../sons'
import BordoesSemGatinho from './BordoesSemGatinho'

vi.mock('../sons', () => ({ miar: vi.fn(() => Promise.resolve(true)) }))

afterEach(() => {
  cleanup()
  localStorage.clear()
  recarregarPreferencias()
  vi.clearAllMocks()
})

describe('Bordões sem o gatinho', () => {
  it('toca "É gata!" ao concluir e "Eu, hein!" ao anotar falta', () => {
    mudarPreferencia('cantinho', 'relogio')
    render(<BordoesSemGatinho />)

    window.dispatchEvent(new CustomEvent(EVENTO_CONCLUIU))
    window.dispatchEvent(new CustomEvent(EVENTO_FALTA))

    expect(miar).toHaveBeenNthCalledWith(1, 'e-gata', { volume: 0.8 })
    expect(miar).toHaveBeenNthCalledWith(2, 'eu-hein', { volume: 0.8 })
  })

  it('toca mesmo com os miados desligados, mas não com os bordões', () => {
    mudarPreferencia('cantinho', 'hoje')
    mudarPreferencia('sons', false)
    render(<BordoesSemGatinho />)

    window.dispatchEvent(new CustomEvent(EVENTO_CONCLUIU))
    expect(miar).toHaveBeenCalledOnce()

    // A tela precisa se atualizar com a chave desligada antes do próximo
    act(() => mudarPreferencia('bordoes', false))
    window.dispatchEvent(new CustomEvent(EVENTO_CONCLUIU))
    expect(miar).toHaveBeenCalledOnce()
  })
})
