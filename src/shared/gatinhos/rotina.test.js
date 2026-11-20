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

  it('passear: sai andando pela esquerda, some e volta andando', () => {
    const passos = iniciarRotina('passear', () => 0).passos

    expect(passos.map((passo) => passo.onde)).toEqual(['fora', 'fora', 'meio'])
    expect(passos.map((passo) => passo.animacao)).toEqual([
      'walk',
      null,
      'walk',
    ])
    expect(passos[0]).toMatchObject({ virado: true, anda: true })
  })

  it('passeio pela tela: sai andando pela esquerda e espera fora', () => {
    const sair = iniciarRotina('sair').passos

    expect(sair[0]).toMatchObject({ onde: 'fora', virado: true, anda: true })
    expect(sair[1]).toMatchObject({ animacao: null, ms: null, onde: 'fora' })

    const voltar = iniciarRotina('voltar')

    expect(voltar.passos[0]).toMatchObject({ animacao: 'walk', onde: 'meio' })
    expect(avancar(voltar).nome).toBe('parado')
  })

  it('explorar só entra no sorteio quando há menu', () => {
    expect(proximaRotina('parado', () => 0.99)).toBe('passear')
    expect(proximaRotina('parado', () => 0.8, { links: 4 })).toBe('explorar')
    expect(proximaRotina('parado', () => 0.99, { links: 4 })).toBe('comer')
  })

  it('explorar: corre até a parede, sobe e pula de volta pra casa', () => {
    const passos = iniciarRotina('explorar', () => 0.5, { links: 4 }).passos

    expect(passos.map((passo) => passo.onde)).toEqual([
      'parede',
      'parede',
      'parede-alto',
      'meio',
      'meio',
    ])
    expect(passos.map((passo) => passo.animacao)).toEqual([
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

  it('na chuva entra na casinha e dorme; quando para, acorda', () => {
    expect(proximaRotina('parado', () => 0.5, { chuva: true })).toBe('dormir')
    expect(proximaRotina('dormir', () => 0.5, { chuva: true })).toBe('dormindo')
    expect(proximaRotina('dormindo', () => 0.5, { chuva: true })).toBe(
      'dormindo',
    )
    expect(proximaRotina('dormindo', () => 0.5)).toBe('acordar')
    expect(proximaRotina('acordar', () => 0.5)).toBe('parado')

    const dormir = iniciarRotina('dormir').passos

    expect(dormir.map((passo) => passo.onde)).toEqual([
      'frente-porta',
      'dentro',
      'dentro',
    ])
    expect(dormir[1]).toMatchObject({ animacao: 'walk', atras: true })
    expect(dormir[2]).toMatchObject({ animacao: null, dorme: true })
  })
})
