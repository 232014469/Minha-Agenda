// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import DadosProvider from '../../dados/DadosProvider'
import AgendaPage from './AgendaPage'

function guardar(dados) {
  localStorage.setItem('minha-agenda.dados', JSON.stringify(dados))
}

function abrir() {
  return render(
    <MemoryRouter>
      <DadosProvider>
        <AgendaPage />
      </DadosProvider>
    </MemoryRouter>,
  )
}

function iso(dias) {
  const data = new Date()

  data.setDate(data.getDate() + dias)

  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')

  return `${data.getFullYear()}-${mes}-${dia}T12:00:00`
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('Agenda sem matérias', () => {
  it('pede para cadastrar uma matéria antes de adicionar tarefas', () => {
    abrir()

    expect(screen.getByRole('link', { name: 'Matérias' })).toHaveAttribute(
      'href',
      '/materias',
    )
    expect(
      screen.queryByRole('button', { name: 'Adicionar' }),
    ).not.toBeInTheDocument()
  })
})

describe('Agenda com dados', () => {
  beforeEach(() => {
    guardar({
      versao: 1,
      materias: [{ id: 1, nome: 'Cálculo', periodo: '', cor: 'verde' }],
      tarefas: [
        {
          id: 1,
          materiaId: 1,
          titulo: 'Lista 1',
          tipo: 'Lista',
          prazo: iso(0),
          status: 'A_FAZER',
        },
      ],
    })
  })

  it('mostra a tarefa no calendário e na lista', () => {
    abrir()

    expect(screen.getAllByText(/Lista 1/).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Lista' }))
    expect(screen.getAllByText(/Lista 1/).length).toBeGreaterThan(0)
  })

  it('cadastra uma nova tarefa e guarda no navegador', () => {
    abrir()

    fireEvent.change(screen.getByLabelText('Matéria'), {
      target: { value: '1' },
    })
    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Prova 2' },
    })
    fireEvent.change(screen.getByLabelText('Data de entrega'), {
      target: { value: iso(0).slice(0, 10) },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))

    const salvo = JSON.parse(localStorage.getItem('minha-agenda.dados'))

    expect(salvo.tarefas.map((tarefa) => tarefa.titulo)).toContain('Prova 2')
  })

  it('avisa quando faltam campos', () => {
    abrir()

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Preencha a matéria')
  })

  it('muda a situação pelo seletor do Quadro', () => {
    abrir()

    fireEvent.click(screen.getByRole('button', { name: 'Quadro' }))
    fireEvent.change(screen.getByLabelText('Mover Lista 1 para'), {
      target: { value: 'CONCLUIDA' },
    })

    const salvo = JSON.parse(localStorage.getItem('minha-agenda.dados'))

    expect(salvo.tarefas[0].status).toBe('CONCLUIDA')
  })
})
