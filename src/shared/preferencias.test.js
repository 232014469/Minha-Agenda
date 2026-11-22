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
  it('começa com o gatinho marrom, sons e gatinho na tela ligados', () => {
    expect(lerPreferencias()).toEqual({
      mascote: 'gato01',
      sons: true,
      bordoes: true,
      gatinho: true,
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

  it('esquece opções que saíram do app', () => {
    localStorage.setItem(
      'wolf-study.dados.preferencias',
      JSON.stringify({ gatinhos: false, tamagotchi: false, sons: false }),
    )
    recarregarPreferencias()

    expect(lerPreferencias()).not.toHaveProperty('gatinhos')
    expect(lerPreferencias()).not.toHaveProperty('tamagotchi')
    expect(lerPreferencias().sons).toBe(false)
  })

  it('guarda a escolha e relê do armazenamento', () => {
    mudarPreferencia('mascote', 'gato03')
    mudarPreferencia('sons', false)
    recarregarPreferencias()

    expect(lerPreferencias()).toMatchObject({ mascote: 'gato03', sons: false })
  })
})
