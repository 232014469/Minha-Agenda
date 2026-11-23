import { describe, expect, it } from 'vitest'
import { relatorioDeEntregas } from './relatorio'

const AGORA = new Date(2026, 10, 23, 12, 0)
const materias = [
  { id: 1, nome: 'Cálculo', cor: 'verde' },
  { id: 2, nome: 'Física', cor: 'azul' },
]
const tarefa = (id, materiaId, tipo, prazo, status, alteradoEm) => ({
  id,
  materiaId,
  titulo: `T${id}`,
  tipo,
  prazo,
  status,
  alteradoEm,
})
const tarefas = [
  // Concluída antes do prazo
  tarefa(
    1,
    1,
    'Prova',
    '2026-11-10T23:59:00',
    'CONCLUIDA',
    new Date(2026, 10, 9).getTime(),
  ),
  // Concluída depois do prazo
  tarefa(
    2,
    1,
    'Lista',
    '2026-11-12T23:59:00',
    'CONCLUIDA',
    new Date(2026, 10, 14).getTime(),
  ),
  // Atrasada
  tarefa(3, 2, 'Lista', '2026-11-20T23:59:00', 'A_FAZER', 1),
  // Não realizada
  tarefa(4, 2, 'Prova', '2026-11-05T23:59:00', 'NAO_REALIZADA', 1),
  // Vence em 3 dias
  tarefa(5, 2, 'Lista', '2026-11-26T23:59:00', 'A_FAZER', 1),
]

describe('relatório de entregas', () => {
  const relatorio = relatorioDeEntregas(tarefas, materias, AGORA)

  it('resume o semestre', () => {
    expect(relatorio.resumo).toEqual({
      total: 5,
      concluidas: 2,
      pendentes: 2,
      atrasadas: 1,
      naoRealizadas: 1,
      percentual: 40,
    })
    expect(relatorio.proximos7Dias).toBe(1)
  })

  it('conta as concluídas no prazo pela data em que foram marcadas', () => {
    expect(relatorio.pontualidade).toEqual({
      noPrazo: 1,
      comAtraso: 1,
      avaliadas: 2,
      percentual: 50,
    })
  })

  it('separa por matéria e por tipo, das que têm mais tarefas', () => {
    expect(
      relatorio.porMateria.map(({ nome, total, concluidas }) => [
        nome,
        total,
        concluidas,
      ]),
    ).toEqual([
      ['Física', 3, 0],
      ['Cálculo', 2, 2],
    ])
    expect(relatorio.porTipo.map(({ chave, total }) => [chave, total])).toEqual(
      [
        ['Lista', 3],
        ['Prova', 2],
      ],
    )
  })

  it('mostra o ritmo das últimas 6 semanas, terminando na atual', () => {
    expect(relatorio.ritmo).toHaveLength(6)
    expect(relatorio.ritmo.at(-1).atual).toBe(true)
    expect(relatorio.ritmo.reduce((soma, s) => soma + s.total, 0)).toBe(5)
  })
})
