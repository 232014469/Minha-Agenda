import { describe, expect, it } from 'vitest'
import { avancar, iniciarRotina, proximaRotina } from './rotina'

describe('rotina do gatinho', () => {
  it('depois de qualquer rotina ele volta a ficar parado', () => {
    expect(proximaRotina('deitar')).toBe('parado')
    expect(proximaRotina('brincar')).toBe('parado')
  })

  it('parado, sorteia entre sentar e deitar (sem sair do lugar)', () => {
    expect(proximaRotina('parado', () => 0)).toBe('sentado')
    expect(proximaRotina('parado', () => 0.99)).toBe('deitar')
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

  it('parede, potinhos e brincadeira só entram no sorteio quando há menu', () => {
    // sentado 2 · deitar 2 · explorar 2 · comer 1,5 · brincar 2,5 (total 10)
    expect(proximaRotina('parado', () => 0.99)).toBe('deitar')
    expect(proximaRotina('parado', () => 0.5, { links: 4 })).toBe('explorar')
    expect(proximaRotina('parado', () => 0.7, { links: 4 })).toBe('comer')
    expect(proximaRotina('parado', () => 0.99, { links: 4 })).toBe('brincar')
  })

  it('brincar: corre, dá patada, corre para o outro lado, pula e volta', () => {
    const passos = iniciarRotina('brincar').passos

    expect(passos.map((passo) => passo.animacao)).toEqual([
      'run',
      'attack',
      'run',
      'jump',
      'walk',
    ])
    expect(passos.at(-1).onde).toBe('meio')
    // Dura o mesmo que a fuga da borboleta no quintal (4,2 s)
    expect(passos.reduce((soma, passo) => soma + passo.ms, 0)).toBe(4200)
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

    rotina = { ...rotina, indice: rotina.passos.length - 1, depois: 'sentado' }

    expect(avancar(rotina).nome).toBe('sentado')
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
