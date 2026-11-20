// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import DadosProvider from '../../dados/DadosProvider'
import { CHAVE } from '../../dados/armazenamento'
import CeuDoDia from './CeuDoDia'
import { temAtrasadas } from './alerta'

const tarefa = (id, prazo, status = 'A_FAZER') => ({
  id,
  materiaId: 1,
  titulo: `Tarefa ${id}`,
  tipo: 'Prova',
  prazo,
  status,
})

function abrir(tarefas) {
  localStorage.setItem(
    CHAVE,
    JSON.stringify({
      versao: 1,
      semestre: '2026.2',
      materias: [{ id: 1, nome: 'Cálculo', periodo: '2026.2', cor: 'verde' }],
      tarefas,
    }),
  )

  return render(
    <DadosProvider>
      <CeuDoDia />
    </DadosProvider>,
  )
}

// Atrasada há 2 dias (com uma semana ela já vira "não realizada")
const ANTEONTEM = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('céu do modo claro', () => {
  it('faz sol quando nada está atrasado', () => {
    const { container } = abrir([tarefa(1, '2099-01-01T23:59:00')])

    expect(container.querySelector('.ceu-dia')).toHaveAttribute(
      'data-tempo',
      'sol',
    )
  })

  it('chove com atividade atrasada', () => {
    const { container } = abrir([tarefa(1, ANTEONTEM)])

    expect(container.querySelector('.ceu-dia')).toHaveAttribute(
      'data-tempo',
      'chuva',
    )
  })

  it('atrasada que já foi concluída (ou não realizada) não traz chuva', () => {
    expect(
      temAtrasadas([
        tarefa(1, '2020-01-01T23:59:00', 'CONCLUIDA'),
        tarefa(2, '2020-01-01T23:59:00', 'NAO_REALIZADA'),
      ]),
    ).toBe(false)
  })
})
