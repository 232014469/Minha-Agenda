// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import DadosProvider from '../../dados/DadosProvider'
import InicioPage from './InicioPage'
import { CHAVE } from '../../dados/armazenamento'

function guardar(dados) {
  localStorage.setItem(CHAVE, JSON.stringify(dados))
}

function abrir() {
  return render(
    <MemoryRouter>
      <DadosProvider>
        <InicioPage />
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

describe('Dashboard sem dados', () => {
  it('mostra zero nos resumos e os avisos de vazio', () => {
    abrir()

    expect(
      screen.getByRole('link', { name: 'Matérias: 0 cursando' }),
    ).toHaveAttribute('href', '/adicionar-materia')
    expect(
      screen.getByRole('link', { name: 'Tarefas: 0 pendentes' }),
    ).toHaveAttribute('href', '/agenda')
    expect(screen.getByText('Você ainda não tem matérias.')).toBeInTheDocument()
    expect(
      screen.getByText('Nenhuma entrega pendente. Bom trabalho!'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Adicionar →' })).toHaveAttribute(
      'href',
      '/adicionar-materia',
    )
  })
})

describe('Dashboard com dados', () => {
  beforeEach(() => {
    guardar({
      versao: 1,
      semestre: '2026.2',
      materias: [
        { id: 1, nome: 'Cálculo', periodo: '2026.2', cor: 'lilas' },
        { id: 2, nome: 'Física', periodo: '2026.2', cor: 'verde' },
        { id: 3, nome: 'Química', periodo: '2026.1', cor: 'rosa' },
      ],
      tarefas: [
        {
          id: 1,
          materiaId: 1,
          titulo: 'Lista 3',
          tipo: 'Lista de exercícios',
          prazo: iso(-2),
          status: 'A_FAZER',
        },
        {
          id: 2,
          materiaId: 1,
          titulo: 'Prova 1',
          tipo: 'Prova',
          prazo: iso(3),
          status: 'EM_ANDAMENTO',
        },
        {
          id: 3,
          materiaId: 2,
          titulo: 'Relatório',
          tipo: 'Entrega de trabalho',
          prazo: iso(1),
          status: 'CONCLUIDA',
        },
        {
          id: 4,
          materiaId: 3,
          titulo: 'Titulação',
          prazo: iso(-1),
          status: 'A_FAZER',
        },
      ],
    })
  })

  it('mostra só o semestre escolhido', () => {
    abrir()

    expect(screen.getByText('Semestre 2026.2')).toBeInTheDocument()
    expect(screen.queryByText('Química')).not.toBeInTheDocument()
    expect(screen.queryByText('Titulação')).not.toBeInTheDocument()
  })

  it('conta matérias, pendentes e atrasadas', () => {
    abrir()

    expect(
      screen.getByRole('link', { name: 'Matérias: 2 cursando' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Tarefas: 2 pendentes' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Atrasadas: 1' }),
    ).toBeInTheDocument()
  })

  it('mostra o progresso geral e o de cada matéria', () => {
    abrir()

    expect(
      screen.getByRole('img', { name: '33% do semestre concluído' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Progresso em Cálculo' }),
    ).toHaveAttribute('aria-valuenow', '0')
    expect(
      screen.getByRole('progressbar', { name: 'Progresso em Física' }),
    ).toHaveAttribute('aria-valuenow', '100')
  })

  it('lista as próximas tarefas pendentes, a atrasada primeiro', () => {
    abrir()

    const lista = screen
      .getByRole('heading', { name: 'Próximas tarefas' })
      .closest('section')
    const itens = within(lista).getAllByRole('listitem')

    expect(itens).toHaveLength(2)
    expect(itens[0]).toHaveTextContent('Lista 3')
    expect(itens[0]).toHaveTextContent('(atrasada)')
    expect(itens[1]).toHaveTextContent('Prova 1')
    expect(within(lista).queryByText('Relatório')).not.toBeInTheDocument()
    expect(within(itens[0]).getByRole('link')).toHaveAttribute(
      'href',
      '/materias/1',
    )
  })
})

describe('Backup no Dashboard', () => {
  it('mostra os botões de baixar e restaurar', () => {
    abrir()

    expect(screen.getByRole('heading', { name: 'Backup' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Baixar backup' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Restaurar backup' }),
    ).toBeInTheDocument()
  })
})
