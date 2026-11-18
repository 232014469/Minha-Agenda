import { describe, expect, it } from 'vitest'
import {
  corDoTipo,
  formatarPrazoCurto,
  proximasTarefas,
  proximaProva,
  diasAte,
  textoDosDias,
  entregasDoMes,
  entregasPorDia,
  resumirEntregas,
} from './inicioUtils'

const entregas = [
  { id: 1, titulo: 'C', prazo: '2026-11-12T10:00:00', status: 'A_FAZER' },
  { id: 2, titulo: 'A', prazo: '2026-11-10T10:00:00', status: 'EM_ANDAMENTO' },
  { id: 3, titulo: 'B', prazo: '2026-11-11T10:00:00', status: 'CONCLUIDA' },
  { id: 4, titulo: 'D', prazo: '2026-11-13T10:00:00', status: 'A_FAZER' },
  { id: 5, titulo: 'E', prazo: '2026-11-09T10:00:00', status: 'NAO_REALIZADA' },
]

describe('resumirEntregas', () => {
  it('conta concluídas e pendentes e arredonda o percentual', () => {
    expect(resumirEntregas(entregas)).toEqual({
      total: 5,
      concluidas: 1,
      pendentes: 3,
      percentual: 20,
    })
  })

  it('não divide por zero quando não há entregas', () => {
    expect(resumirEntregas([])).toEqual({
      total: 0,
      concluidas: 0,
      pendentes: 0,
      percentual: 0,
    })
  })
})

describe('proximasTarefas', () => {
  const materias = [{ id: 7, nome: 'Cálculo' }]
  const tarefas = entregas.map((item) => ({ ...item, materiaId: 7 }))

  it('deixa de fora as concluídas e ordena pelo prazo', () => {
    expect(proximasTarefas(tarefas, materias).map((t) => t.titulo)).toEqual([
      'A',
      'C',
      'D',
    ])
  })

  it('respeita o limite e traz o nome da matéria', () => {
    const [primeira] = proximasTarefas(tarefas, materias, 1)

    expect(primeira.titulo).toBe('A')
    expect(primeira.materiaNome).toBe('Cálculo')
  })
})

describe('formatarPrazoCurto', () => {
  const agora = new Date(2026, 9, 22, 8, 0)

  it('diz "Hoje" e "Amanhã"', () => {
    expect(formatarPrazoCurto('2026-10-22T23:59:00', agora)).toBe('Hoje, 23:59')
    expect(formatarPrazoCurto('2026-10-23T09:05:00', agora)).toBe(
      'Amanhã, 09:05',
    )
  })

  it('usa dia/mês nas outras datas e ignora data inválida', () => {
    expect(formatarPrazoCurto('2026-10-29T23:59:00', agora)).toBe(
      '29/10, 23:59',
    )
    expect(formatarPrazoCurto(undefined, agora)).toBe('')
    expect(formatarPrazoCurto('abc', agora)).toBe('')
  })
})

describe('corDoTipo', () => {
  it('escolhe a cor pelo tipo, sem depender de acento ou maiúscula', () => {
    expect(corDoTipo('Lista')).toBe('azul')
    expect(corDoTipo('Prova')).toBe('azul')
    expect(corDoTipo('Projeto')).toBe('verde')
    expect(corDoTipo('Exercício')).toBe('amarelo')
    expect(corDoTipo('Questionário')).toBe('azul')
    expect(corDoTipo('Laboratório')).toBe('verde')
    expect(corDoTipo('Relatório')).toBe('amarelo')
    expect(corDoTipo('Apresentação')).toBe('rosa')
    expect(corDoTipo('Seminário')).toBe('rosa')
    expect(corDoTipo('Trabalho')).toBe('lilas')
    expect(corDoTipo(undefined)).toBe('lilas')
  })
})

describe('cartões do Dashboard', () => {
  // Quinta-feira, 12/11/2026.
  const agora = new Date(2026, 10, 12, 10, 0)
  const tarefa = (id, tipo, prazo, status = 'A_FAZER') => ({
    id,
    titulo: `T${id}`,
    tipo,
    prazo,
    status,
  })

  it('próxima prova: a pendente mais próxima de hoje em diante', () => {
    const tarefas = [
      tarefa(1, 'Prova', '2026-11-10T23:59:00'),
      tarefa(2, 'Prova', '2026-11-20T23:59:00'),
      tarefa(3, 'Prova', '2026-11-13T23:59:00', 'CONCLUIDA'),
      tarefa(4, 'Lista de exercícios', '2026-11-12T23:59:00'),
      tarefa(5, 'Prova', '2026-11-16T23:59:00'),
    ]

    expect(proximaProva(tarefas, agora).id).toBe(5)
    expect(proximaProva([], agora)).toBeNull()
  })

  it('conta os dias por data do calendário', () => {
    expect(textoDosDias(diasAte('2026-11-12T23:59:00', agora))).toBe('hoje')
    expect(textoDosDias(diasAte('2026-11-13T08:00:00', agora))).toBe('amanhã')
    expect(textoDosDias(diasAte('2026-11-16T23:59:00', agora))).toBe(
      'em 4 dias',
    )
  })

  it('entregas pendentes por dia, de segunda a domingo', () => {
    const dias = entregasPorDia(
      [
        tarefa(1, 'Prova', '2026-11-09T23:59:00'),
        { ...tarefa(2, 'Prova', '2026-11-12T10:00:00'), materiaId: 7 },
        { ...tarefa(3, 'Prova', '2026-11-12T23:59:00'), materiaId: 8 },
        tarefa(4, 'Prova', '2026-11-13T23:59:00', 'CONCLUIDA'),
        tarefa(5, 'Prova', '2026-11-16T23:59:00'),
      ],
      agora,
    )

    expect(dias.map((dia) => dia.total)).toEqual([1, 0, 0, 2, 0, 0, 0])
    expect(dias[3].porMateria).toEqual([
      { materiaId: 7, total: 1 },
      { materiaId: 8, total: 1 },
    ])
    expect(dias[1].porMateria).toEqual([])
    expect(dias.find((dia) => dia.hoje).dia).toBe('Qui')
  })
})

describe('entregasDoMes', () => {
  const tarefa = (id, materiaId, prazo, status = 'A_FAZER') => ({
    id,
    materiaId,
    titulo: `T${id}`,
    prazo,
    status,
  })

  it('um item por dia do mês, com as entregas de cada matéria', () => {
    const dias = entregasDoMes(
      [
        tarefa(1, 1, '2026-11-05T23:59:00'),
        tarefa(2, 2, '2026-11-05T10:00:00'),
        tarefa(3, 1, '2026-11-05T12:00:00'),
        tarefa(4, 1, '2026-11-20T23:59:00', 'CONCLUIDA'),
        tarefa(5, 1, '2026-12-01T23:59:00'),
      ],
      2026,
      10,
      new Date(2026, 10, 18, 9),
    )

    expect(dias).toHaveLength(30)
    expect(dias[4]).toMatchObject({
      dia: 5,
      inicial: 'Q',
      total: 3,
      porMateria: [
        { materiaId: 1, total: 2 },
        { materiaId: 2, total: 1 },
      ],
    })
    expect(dias[19].total).toBe(0)
    expect(dias[17].hoje).toBe(true)
    expect(dias[0].fimDeSemana).toBe(true)
  })

  it('fevereiro de ano bissexto tem 29 dias', () => {
    expect(entregasDoMes([], 2028, 1)).toHaveLength(29)
  })
})
