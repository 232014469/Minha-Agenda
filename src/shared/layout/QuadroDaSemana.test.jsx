// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import DadosProvider from '../../dados/DadosProvider'
import QuadroDaSemana from './QuadroDaSemana'
import { atividadesDaSemana, rotuloDoDia } from './semana'
import { CHAVE } from '../../dados/armazenamento'

// Quinta-feira, 12/11/2026: a semana vai de segunda 09/11 a domingo 15/11.
const HOJE = new Date(2026, 10, 12, 10, 0)

const tarefa = (id, titulo, prazo, status = 'A_FAZER') => ({
  id,
  materiaId: 1,
  titulo,
  tipo: 'Prova',
  prazo,
  status,
})

const TAREFAS = [
  tarefa(1, 'Semana passada', '2026-11-08T23:59:00'),
  tarefa(2, 'Segunda', '2026-11-09T23:59:00'),
  tarefa(3, 'Hoje', '2026-11-12T23:59:00'),
  tarefa(4, 'Feita', '2026-11-13T23:59:00', 'CONCLUIDA'),
  tarefa(5, 'Não deu', '2026-11-13T23:59:00', 'NAO_REALIZADA'),
  tarefa(6, 'Domingo', '2026-11-15T23:59:00'),
  tarefa(7, 'Semana que vem', '2026-11-16T23:59:00'),
]

describe('atividadesDaSemana', () => {
  it('pega só as pendentes de segunda a domingo, em ordem', () => {
    expect(
      atividadesDaSemana(TAREFAS, HOJE).map((item) => item.titulo),
    ).toEqual(['Segunda', 'Hoje', 'Domingo'])
  })
})

describe('rotuloDoDia', () => {
  it('diz Hoje, Amanhã ou o dia da semana', () => {
    expect(rotuloDoDia('2026-11-12T23:59:00', HOJE)).toBe('Hoje')
    expect(rotuloDoDia('2026-11-13T23:59:00', HOJE)).toBe('Amanhã')
    expect(rotuloDoDia('2026-11-15T23:59:00', HOJE)).toBe('Dom 15/11')
  })
})

describe('QuadroDaSemana', () => {
  beforeEach(() => {
    localStorage.setItem(
      CHAVE,
      JSON.stringify({
        versao: 1,
        semestre: '2026.2',
        materias: [{ id: 1, nome: 'Cálculo', periodo: '2026.2', cor: 'verde' }],
        tarefas: TAREFAS,
      }),
    )
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('mostra os post-its da semana, sem links nem botões', () => {
    render(
      <DadosProvider>
        <QuadroDaSemana hoje={HOJE} />
      </DadosProvider>,
    )

    const quadro = screen.getByRole('region', { name: 'Esta semana' })
    const itens = within(quadro).getAllByRole('listitem')

    expect(itens).toHaveLength(3)
    expect(itens[1]).toHaveTextContent('Hoje')
    expect(itens[1]).toHaveTextContent('Cálculo')
    expect(within(quadro).queryByRole('link')).not.toBeInTheDocument()
    expect(within(quadro).queryByRole('button')).not.toBeInTheDocument()
  })

  it('avisa quando não há nada na semana', () => {
    localStorage.clear()
    render(
      <DadosProvider>
        <QuadroDaSemana hoje={HOJE} />
      </DadosProvider>,
    )

    expect(screen.getByText('Nada pendente nesta semana.')).toBeInTheDocument()
  })
})
