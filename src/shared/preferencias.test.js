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
  it('começa com o gatinho marrom, sons, gatinhos e bichinho ligados', () => {
    expect(lerPreferencias()).toEqual({
      mascote: 'gato01',
      sons: true,
      bordoes: true,
      gatinhos: true,
      tamagotchi: true,
    })
  })

  it('quem tinha escolhido o lobinho fica com o gatinho marrom', () => {
    localStorage.setItem(
      'wolf-study.dados.preferencias',
      JSON.stringify({ mascote: 'lobo', sons: false }),
    )
    recarregarPreferencias()

    expect(lerPreferencias()).toMatchObject({ mascote: 'gato01', sons: false })
  })

  it('guarda a escolha e relê do armazenamento', () => {
    mudarPreferencia('mascote', 'gato03')
    mudarPreferencia('sons', false)
    recarregarPreferencias()

    expect(lerPreferencias()).toMatchObject({ mascote: 'gato03', sons: false })
  })
})
