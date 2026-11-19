// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import {
  lerPreferencias,
  mudarPreferencia,
  recarregarPreferencias,
} from './preferencias'

afterEach(() => {
  localStorage.clear()
  recarregarPreferencias()
})

describe('preferências do aparelho', () => {
  it('começa com o lobinho, sons e gatinhos ligados', () => {
    expect(lerPreferencias()).toEqual({
      mascote: 'lobo',
      sons: true,
      gatinhos: true,
    })
  })

  it('guarda a escolha e relê do armazenamento', () => {
    mudarPreferencia('mascote', 'gato03')
    mudarPreferencia('sons', false)
    recarregarPreferencias()

    expect(lerPreferencias()).toMatchObject({ mascote: 'gato03', sons: false })
  })
})
