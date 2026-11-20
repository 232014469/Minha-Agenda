import { describe, expect, it } from 'vitest'
import { FRASES_DO_GATINHO, fraseDoGatinho } from './frasesDoGatinho'

describe('frases do gatinho', () => {
  it('uma frase por dia, a mesma o dia inteiro', () => {
    const manha = new Date(2026, 10, 20, 8, 0)
    const noite = new Date(2026, 10, 20, 23, 30)
    const amanha = new Date(2026, 10, 21, 8, 0)

    expect(fraseDoGatinho('triste', manha)).toBe(
      fraseDoGatinho('triste', noite),
    )
    expect(fraseDoGatinho('triste', amanha)).not.toBe(
      fraseDoGatinho('triste', manha),
    )
    expect(FRASES_DO_GATINHO.triste).toContain(fraseDoGatinho('triste', manha))
  })

  it('humor desconhecido usa as frases de feliz', () => {
    expect(FRASES_DO_GATINHO.feliz).toContain(fraseDoGatinho('???'))
  })
})
