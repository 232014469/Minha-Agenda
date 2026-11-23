import { describe, expect, it } from 'vitest'
import { calcularNotas, formatarNota, lerNota, mencaoDe } from './notas'

const materia = (regraDeNotas, avaliacoes) => ({
  id: 1,
  nome: 'Cálculo',
  regraDeNotas,
  avaliacoes,
})
const tarefa = (id, tipo, extra = {}) => ({
  id,
  materiaId: 1,
  titulo: `${tipo} ${id}`,
  tipo,
  prazo: `2026-11-${10 + id}T23:59:00`,
  status: 'A_FAZER',
  avaliativa: tipo !== 'Leitura',
  ...extra,
})

describe('notas', () => {
  it('dá a menção da UnB pela média', () => {
    expect(mencaoDe(9.5).sigla).toBe('SS')
    expect(mencaoDe(7).sigla).toBe('MS')
    expect(mencaoDe(5).sigla).toBe('MM')
    expect(mencaoDe(4.9).sigla).toBe('MI')
    expect(mencaoDe(1).sigla).toBe('II')
    expect(mencaoDe(0).sigla).toBe('SR')
    expect(mencaoDe(9, { reprovadoPorFalta: true }).sigla).toBe('SR')
  })

  it('média com pesos e quanto precisa na que falta', () => {
    const tarefas = [
      tarefa(1, 'Prova', { nota: 4, peso: 3 }),
      tarefa(2, 'Prova', { peso: 3 }),
      tarefa(3, 'Projeto', { nota: 8, peso: 4 }),
      tarefa(4, 'Leitura'),
    ]
    const r = calcularNotas(materia(), tarefas)

    // (4·3 + 8·4) / 7 = 6,29
    expect(r.media).toBe(6.29)
    expect(r.mencao.sigla).toBe('MM')
    // Precisa de (5·10 − 44) / 3 = 2 na P2
    expect(r.situacao).toBe('precisa')
    expect(r.precisa).toBe(2)
    expect(r.falta).toBeCloseTo(0.3)
    // Leitura não conta
    expect(r.itens).toHaveLength(3)
  })

  it('soma de pontos: cada avaliação vale o seu máximo', () => {
    const tarefas = [
      tarefa(1, 'Prova', { nota: 24, notaMaxima: 30 }),
      tarefa(2, 'Prova', { nota: 15, notaMaxima: 30 }),
      tarefa(3, 'Projeto', { notaMaxima: 40 }),
    ]
    const r = calcularNotas(materia({ modo: 'pontos' }), tarefas)

    // 39 de 60 → 6,5
    expect(r.media).toBe(6.5)
    expect(r.garantida).toBe(3.9)
    // Faltam 11 pontos de 40 → 2,8
    expect(r.precisa).toBe(2.8)
  })

  it('substitutiva troca a menor e "descartar a pior" tira a pior', () => {
    const tarefas = [
      tarefa(1, 'Prova', { nota: 3 }),
      tarefa(2, 'Prova', { nota: 7 }),
      tarefa(3, 'Prova', { nota: 6, substitutiva: true }),
    ]

    expect(calcularNotas(materia(), tarefas).media).toBe(6.5)

    const semSub = tarefas.slice(0, 2).concat(tarefa(4, 'Lista', { nota: 9 }))

    expect(calcularNotas(materia({ descartarPior: true }), semSub).media).toBe(
      8,
    )
  })

  it('avulsas, ponto extra, não realizada vale zero e situações', () => {
    const tarefas = [tarefa(1, 'Prova', { status: 'NAO_REALIZADA' })]
    const r = calcularNotas(
      materia({ extra: 1 }, [{ id: 9, nome: 'Participação', nota: 10 }]),
      tarefas,
    )

    // (0 + 10) / 2 + 1 = 6
    expect(r.media).toBe(6)
    expect(r.situacao).toBe('fechada')
    expect(calcularNotas(materia(), []).situacao).toBe('sem-notas')
    expect(
      calcularNotas(materia(), [
        tarefa(1, 'Prova', { nota: 10 }),
        tarefa(2, 'Prova'),
      ]).situacao,
    ).toBe('aprovado')
    expect(
      calcularNotas(materia(), [
        tarefa(1, 'Prova', { nota: 0, peso: 9 }),
        tarefa(2, 'Prova'),
      ]).situacao,
    ).toBe('impossivel')
  })

  it('lê e escreve notas com vírgula', () => {
    expect(lerNota('7,5')).toBe(7.5)
    expect(lerNota('')).toBeNull()
    expect(lerNota('abc')).toBeNull()
    expect(formatarNota(6.25)).toBe('6,3')
  })
})
