import { describe, expect, it } from 'vitest'
import { avancar, iniciarRotina, proximaRotina } from './rotina'

describe('rotina do gatinho', () => {
  it('depois de qualquer rotina ele volta a ficar parado', () => {
    expect(proximaRotina('deitar')).toBe('parado')
    expect(proximaRotina('passear')).toBe('parado')
  })

  it('parado, sorteia entre sentar, deitar e passear', () => {
    expect(proximaRotina('parado', () => 0)).toBe('sentado')
    expect(proximaRotina('parado', () => 0.5)).toBe('deitar')
    expect(proximaRotina('parado', () => 0.99)).toBe('passear')
  })

  it('deitar: abaixa, deita e levanta, e depois volta a ficar parado', () => {
    let rotina = iniciarRotina('deitar', () => 0)

    expect(rotina.passos.map((passo) => passo.animacao)).toEqual([
      'crouch',
      'liedown',
      'crouch',
    ])
    expect(rotina.passos[2].reverso).toBe(true)

    rotina = avancar(avancar(avancar(rotina)))
    expect(rotina.nome).toBe('parado')
  })

  it('passear: sai pela esquerda virado, some e volta andando até o meio', () => {
    const passos = iniciarRotina('passear', () => 0).passos

    expect(passos.map((passo) => passo.onde)).toEqual(['fora', 'fora', 'meio'])
    expect(passos[0]).toMatchObject({ virado: true, anda: true })
    expect(passos[1].animacao).toBeNull()
    expect(passos[2]).toMatchObject({ animacao: 'walk', anda: true })
  })

  it('passeio pela tela: sai pela esquerda e espera fora até voltar', () => {
    const sair = iniciarRotina('sair').passos

    expect(sair[0]).toMatchObject({ onde: 'fora', virado: true, anda: true })
    expect(sair[1]).toMatchObject({ animacao: null, ms: null, onde: 'fora' })

    const voltar = iniciarRotina('voltar')

    expect(voltar.passos[0]).toMatchObject({ onde: 'meio', anda: true })
    expect(avancar(voltar).nome).toBe('parado')
  })
})
