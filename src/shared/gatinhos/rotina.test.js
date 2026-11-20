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

  it('passear: pula do cesto, sai pela esquerda, some e volta pulando', () => {
    const passos = iniciarRotina('passear', () => 0).passos

    expect(passos.map((passo) => passo.onde)).toEqual([
      'chao',
      'fora',
      'fora',
      'chao',
      'meio',
    ])
    expect(passos.map((passo) => passo.animacao)).toEqual([
      'jump',
      'walk',
      null,
      'walk',
      'jump',
    ])
    expect(passos[1]).toMatchObject({ virado: true, anda: true })
  })

  it('passeio pela tela: pula do cesto, sai pela esquerda e espera fora', () => {
    const sair = iniciarRotina('sair').passos

    expect(sair[0]).toMatchObject({ animacao: 'jump', onde: 'chao' })
    expect(sair[1]).toMatchObject({ onde: 'fora', virado: true, anda: true })
    expect(sair[2]).toMatchObject({ animacao: null, ms: null, onde: 'fora' })

    const voltar = iniciarRotina('voltar')

    expect(voltar.passos.map((passo) => passo.animacao)).toEqual([
      'walk',
      'jump',
    ])
    expect(avancar(avancar(voltar)).nome).toBe('parado')
  })

  it('explorar só entra no sorteio quando há menu', () => {
    expect(proximaRotina('parado', () => 0.99)).toBe('passear')
    expect(proximaRotina('parado', () => 0.99, { links: 4 })).toBe('explorar')
  })

  it('explorar: pula até o Dashboard, sobe a parede e volta pra casa', () => {
    const passos = iniciarRotina('explorar', () => 0.5, { links: 4 }).passos

    expect(passos.map((passo) => passo.onde)).toEqual([
      'link:0',
      'link:0',
      'link:0',
      'parede:0',
      'parede:0',
      'parede-alto',
      'meio',
      'meio',
    ])
    expect(passos.map((passo) => passo.animacao)).toEqual([
      'jump',
      'land',
      'idle_blink',
      'run',
      'wallgrab',
      'wallclimb',
      'jump',
      'land',
    ])
  })

  it('rotina pedida no meio do caminho começa só quando esta termina', () => {
    let rotina = { ...iniciarRotina('explorar', () => 0, { links: 4 }) }

    rotina = { ...rotina, indice: rotina.passos.length - 1, depois: 'sair' }

    expect(avancar(rotina).nome).toBe('sair')
  })

  it('sair do menu: anda até a borda na altura do Dashboard', () => {
    const passos = iniciarRotina('sairDoMenu').passos

    expect(passos.map((passo) => passo.onde)).toEqual(['fora:0', 'fora:0'])
    expect(passos[0]).toMatchObject({ animacao: 'walk', virado: true })
  })
})
