import { describe, expect, it } from 'vitest'
import {
  alimentar,
  anotarDia,
  brincar,
  cuidadoDoDia,
  ehLetivo,
  novoBichinho,
  periodosLetivos,
  retomar,
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
  it('chega numa caixinha, é filhote na primeira semana e depois adulto', () => {
    const bichinho = novoBichinho(NASCEU)

    expect(situacaoDoBichinho(bichinho, NASCEU + 1000).fase).toBe('caixa')
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
    // Melhorar depois não traz de volta: precisa adotar outro
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

  it('dias de aula sem abrir o site contam como tristinhos', () => {
    const emAula = () => true
    const largado = anotarDia(
      anotarDia(novoBichinho(NASCEU), 80, depois(1), emAula),
      80,
      depois(6),
      emAula,
    )

    // Dias 2 a 5 sem abrir, em período de aula: virou estrelinha
    expect(situacaoDoBichinho(largado, depois(6)).fase).toBe('estrelinha')
  })

  it('nas férias, ficar sem abrir o site não conta', () => {
    const ferias = () => false
    const descansando = anotarDia(
      anotarDia(novoBichinho(NASCEU), 80, depois(1), ferias),
      80,
      depois(6),
      ferias,
    )

    expect(situacaoDoBichinho(descansando, depois(6), ferias).fase).toBe(
      'filhote',
    )
  })

  it('religado nas Configurações, a contagem recomeça dali', () => {
    const emAula = () => true
    const pausado = anotarDia(novoBichinho(NASCEU), 80, depois(1), emAula)
    const religado = anotarDia(
      retomar(pausado, depois(6)),
      80,
      depois(6),
      emAula,
    )

    expect(situacaoDoBichinho(religado, depois(6), emAula).fase).toBe('filhote')
  })

  it('período de aula: da 1ª matéria até uma semana depois do último prazo', () => {
    const periodos = periodosLetivos({
      materias: [{ id: 1, periodo: '2026.2', criadaEm: depois(0) }],
      tarefas: [{ materiaId: 1, prazo: new Date(depois(30)).toISOString() }],
    })

    expect(ehLetivo(periodos, depois(10))).toBe(true)
    expect(ehLetivo(periodos, depois(36))).toBe(true)
    expect(ehLetivo(periodos, depois(38))).toBe(false)
    expect(ehLetivo(periodos, depois(-2))).toBe(false)
  })
})
