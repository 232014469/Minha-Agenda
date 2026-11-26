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
  it('começa com o gatinho marrom, sons ligados e o gatinho no menu', () => {
    expect(lerPreferencias()).toEqual({
      mascote: 'gato01',
      sons: true,
      bordoes: true,
      cantinho: 'gatinho',
      ceu: true,
      vidro: true,
      fonte: 'normal',
    })
  })

  it('tamanho de texto desconhecido volta para o normal', () => {
    localStorage.setItem(
      'wolf-study.dados.preferencias',
      JSON.stringify({ fonte: 'gigante' }),
    )
    recarregarPreferencias()

    expect(lerPreferencias().fonte).toBe('normal')
  })

  it('quem tinha escolhido o lobinho fica com o gatinho marrom', () => {
    localStorage.setItem(
      'wolf-study.dados.preferencias',
      JSON.stringify({ mascote: 'lobo', sons: false }),
    )
    recarregarPreferencias()

    expect(lerPreferencias()).toMatchObject({ mascote: 'gato01', sons: false })
  })

  it('quem tinha desligado o gatinho fica com o relógio de estudo', () => {
    localStorage.setItem(
      'wolf-study.dados.preferencias',
      JSON.stringify({ gatinho: false }),
    )
    recarregarPreferencias()

    expect(lerPreferencias().cantinho).toBe('relogio')
    expect(lerPreferencias()).not.toHaveProperty('gatinho')
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
