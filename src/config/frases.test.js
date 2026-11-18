import { describe, expect, it } from 'vitest'
import { FRASES, fraseDoDia } from './frases'

describe('fraseDoDia', () => {
  it('é a mesma o dia todo e muda no dia seguinte', () => {
    const manha = fraseDoDia(new Date(2026, 10, 18, 0, 5))
    const noite = fraseDoDia(new Date(2026, 10, 18, 23, 55))
    const amanha = fraseDoDia(new Date(2026, 10, 19, 0, 5))

    expect(noite).toBe(manha)
    expect(amanha).not.toBe(manha)
  })

  it('segue a ordem e recomeça depois da última', () => {
    const indice = (data) => FRASES.indexOf(fraseDoDia(data))
    const hoje = indice(new Date(2026, 10, 18))

    expect(indice(new Date(2026, 10, 19))).toBe((hoje + 1) % FRASES.length)
    expect(indice(new Date(2026, 10, 18 + FRASES.length))).toBe(hoje)
  })

  it('tem as 15 frases, cada uma com o seu grupo', () => {
    expect(FRASES).toHaveLength(15)
    expect(FRASES.every((frase) => frase.grupo && frase.texto)).toBe(true)
  })
})
