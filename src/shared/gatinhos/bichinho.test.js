import { describe, expect, it } from 'vitest'
import {
  alimentar,
  anotarDia,
  brincar,
  cuidadoDoDia,
  novoBichinho,
  situacaoDoBichinho,
} from './bichinho'

const DIA = 24 * 60 * 60 * 1000
const NASCEU = new Date(2026, 10, 1, 12, 0).getTime()
const depois = (dias) => NASCEU + dias * DIA

/** Anota um valor por dia, do dia `de` em diante. */
function anotar(bichinho, valores, de) {
  return valores.reduce(
    (atual, pontos, indice) => anotarDia(atual, pontos, depois(de + indice)),
    bichinho,
  )
}

describe('bichinho virtual', () => {
  it('nasce de um ovo, é filhote na primeira semana e depois adulto', () => {
    const bichinho = novoBichinho(NASCEU)

    expect(situacaoDoBichinho(bichinho, NASCEU + 1000).fase).toBe('ovo')
    expect(situacaoDoBichinho(bichinho, depois(2)).fase).toBe('filhote')
    expect(situacaoDoBichinho(bichinho, depois(8)).fase).toBe('adulto')
  })

  it('adulto bem cuidado fica bonitinho; mal cuidado, largado', () => {
    const bem = anotar(novoBichinho(NASCEU), [90, 80, 70, 85], 5)
    const mal = anotar(novoBichinho(NASCEU), [40, 35, 50, 45], 5)

    expect(situacaoDoBichinho(bem, depois(8)).forma).toBe('bonitinho')
    expect(situacaoDoBichinho(mal, depois(8)).forma).toBe('largado')
  })

  it('dias seguidos tristinho: doente e depois estrelinha', () => {
    const doente = anotar(novoBichinho(NASCEU), [80, 20, 10], 1)
    const estrelinha = anotar(novoBichinho(NASCEU), [10, 5, 0, 10], 1)

    expect(situacaoDoBichinho(doente, depois(3)).doente).toBe(true)
    expect(situacaoDoBichinho(estrelinha, depois(4)).fase).toBe('estrelinha')
    // Melhorar depois não traz de volta: precisa chocar outro ovo
    expect(
      situacaoDoBichinho(anotar(estrelinha, [90], 5), depois(5)).fase,
    ).toBe('estrelinha')
  })

  it('um dia bom no meio cura o gatinho', () => {
    const curado = anotar(novoBichinho(NASCEU), [10, 20, 70], 1)

    expect(situacaoDoBichinho(curado, depois(3)).doente).toBe(false)
  })

  it('cuidado do dia: fome tira, comida e brincadeira somam', () => {
    const bichinho = novoBichinho(NASCEU)

    expect(cuidadoDoDia(bichinho, depois(2))).toEqual({
      pontos: -5,
      motivos: ['com fome'],
    })

    const cuidado = brincar(alimentar(bichinho, depois(2)), depois(2))

    expect(cuidadoDoDia(cuidado, depois(2) + 1000)).toEqual({
      pontos: 6,
      motivos: ['brincou hoje'],
    })
  })
})
