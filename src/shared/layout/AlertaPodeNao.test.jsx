// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import DadosProvider from '../../dados/DadosProvider'
import { CHAVE } from '../../dados/armazenamento'
import { mudarPreferencia, recarregarPreferencias } from '../preferencias'
import AlertaPodeNao from './AlertaPodeNao'
import { tarefasUrgentes } from './alerta'

// Quinta-feira, 19/11/2026, 10h
const HOJE = new Date(2026, 10, 19, 10, 0)

const tarefa = (id, titulo, prazo, status = 'A_FAZER') => ({
  id,
  materiaId: 1,
  titulo,
  tipo: 'Prova',
  prazo,
  status,
})

function guardar(tarefas) {
  localStorage.setItem(
    CHAVE,
    JSON.stringify({
      versao: 1,
      semestre: '2026.2',
      materias: [{ id: 1, nome: 'Cálculo', periodo: '2026.2', cor: 'verde' }],
      tarefas,
    }),
  )
}

function abrir() {
  return render(
    <DadosProvider>
      <AlertaPodeNao hoje={HOJE} />
    </DadosProvider>,
  )
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  localStorage.clear()
  sessionStorage.clear()
  recarregarPreferencias()
})

describe('tarefasUrgentes', () => {
  it('pega as pendentes atrasadas e as de hoje, da mais antiga à mais nova', () => {
    const tarefas = [
      tarefa(1, 'Amanhã', '2026-11-20T23:59:00'),
      tarefa(2, 'Hoje', '2026-11-19T23:59:00'),
      tarefa(3, 'Atrasada', '2026-11-17T23:59:00'),
      tarefa(4, 'Feita', '2026-11-18T23:59:00', 'CONCLUIDA'),
      tarefa(5, 'Não deu', '2026-11-18T23:59:00', 'NAO_REALIZADA'),
    ]

    expect(tarefasUrgentes(tarefas, HOJE).map((item) => item.titulo)).toEqual([
      'Atrasada',
      'Hoje',
    ])
  })
})

describe('AlertaPodeNao', () => {
  it('aparece ao entrar quando há atividade para hoje', () => {
    guardar([tarefa(2, 'Lista 3', '2026-11-19T23:59:00')])
    abrir()

    expect(screen.getByRole('alert')).toHaveTextContent('Pode não!')
    expect(screen.getByRole('alert')).toHaveTextContent('Lista 3')
  })

  it('não aparece sem atividade atrasada ou para hoje', () => {
    guardar([tarefa(1, 'Amanhã', '2026-11-20T23:59:00')])
    abrir()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('aparece só uma vez por dia na mesma aba', () => {
    guardar([tarefa(2, 'Lista 3', '2026-11-19T23:59:00')])
    abrir()
    cleanup()
    abrir()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('some sozinho depois de um tempo', async () => {
    vi.useFakeTimers()
    guardar([tarefa(2, 'Lista 3', '2026-11-19T23:59:00')])
    abrir()

    // Espera no meio da tela (sem som liberado, até 6 s) e depois voa
    await act(async () => vi.advanceTimersByTime(6000))
    await act(async () => vi.advanceTimersByTime(1000))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('um clique adianta a saída (sem sons ligados)', () => {
    vi.useFakeTimers()
    mudarPreferencia('sons', false)
    guardar([tarefa(2, 'Lista 3', '2026-11-19T23:59:00')])
    abrir()

    fireEvent.click(screen.getByRole('alert'))
    act(() => vi.advanceTimersByTime(1000))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
