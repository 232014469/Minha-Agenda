// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
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
  it('mostra os avisos de vazio nos cartões', () => {
    abrir()

    expect(
      screen.getByText('Cadastre as matérias para acompanhar as faltas.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/Nenhuma prova marcada/)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Entregas da semana' }),
    ).toBeInTheDocument()
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

  it('amplia as entregas da semana para o mês, sem sair da página', () => {
    abrir()

    fireEvent.click(
      screen.getByRole('button', { name: 'Ver as entregas do mês' }),
    )

    const janela = screen.getByRole('dialog')
    const titulo = within(janela).getByRole('heading').textContent

    expect(titulo).toMatch(/^Entregas de /)
    expect(within(janela).getAllByRole('listitem').length).toBeGreaterThan(27)

    fireEvent.click(within(janela).getByRole('button', { name: 'Próximo mês' }))
    expect(within(janela).getByRole('heading').textContent).not.toBe(titulo)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('avisa das atrasadas em Próximas tarefas', () => {
    abrir()

    expect(screen.getByText('1 tarefa atrasada')).toBeInTheDocument()
  })

  it('mostra a contagem até a próxima prova', () => {
    abrir()

    const cartao = screen
      .getByRole('heading', { name: 'Próxima prova' })
      .closest('section')

    expect(within(cartao).getByText('em 3 dias')).toBeInTheDocument()
    expect(within(cartao).getByText('Prova 1')).toBeInTheDocument()
  })

  it('registra falta pelo Dashboard e mostra quanto ainda pode faltar', () => {
    abrir()

    const barra = screen.getByRole('progressbar', {
      name: 'Faltas em Cálculo',
    })

    // 60 h → limite de 15 h → 7 encontros de 2 h.
    expect(barra).toHaveAttribute('aria-valuetext', '0 de 15 horas de falta')

    fireEvent.click(screen.getByRole('button', { name: '+1 falta em Cálculo' }))

    expect(barra).toHaveAttribute('aria-valuetext', '2 de 15 horas de falta')
    expect(JSON.parse(localStorage.getItem(CHAVE)).materias[0].faltas).toBe(2)
    expect(
      screen.getByText('Ainda pode faltar 6 encontros'),
    ).toBeInTheDocument()
  })

  it('mostra o progresso geral e o de cada matéria', () => {
    abrir()

    expect(
      screen.getByRole('img', { name: '33% das atividades concluídas' }),
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

describe('Dashboard sem sincronização nem backup', () => {
  it('eles ficam na tela Configurações', () => {
    abrir()

    expect(
      screen.queryByRole('heading', { name: 'Backup' }),
    ).not.toBeInTheDocument()
  })
})
