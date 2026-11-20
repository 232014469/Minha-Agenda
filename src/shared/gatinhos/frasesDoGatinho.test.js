import { describe, expect, it } from 'vitest'
import { FRASES_DO_GATINHO, fraseDoGatinho } from './frasesDoGatinho'

describe('frases do gatinho', () => {
  it('cada humor tem as suas frases e elas se revezam', () => {
    const tristes = FRASES_DO_GATINHO.triste

    expect(fraseDoGatinho('triste', 0)).toBe(tristes[0])
    expect(fraseDoGatinho('triste', 1)).toBe(tristes[1])
    expect(fraseDoGatinho('triste', tristes.length)).toBe(tristes[0])
  })

  it('humor desconhecido usa as frases de feliz', () => {
    expect(fraseDoGatinho('???', 0)).toBe(FRASES_DO_GATINHO.feliz[0])
  })
})
