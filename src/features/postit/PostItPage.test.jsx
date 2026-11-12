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
import PostItPage from './PostItPage'
import { CHAVE } from '../../dados/armazenamento'

function abrir() {
  return render(
    <MemoryRouter>
      <DadosProvider>
        <PostItPage />
      </DadosProvider>
    </MemoryRouter>,
  )
}

function guardar(tarefas = []) {
  localStorage.setItem(
    CHAVE,
    JSON.stringify({
      versao: 1,
      semestre: '2026.2',
      materias: [
        { id: 1, nome: 'Cálculo', periodo: '2026.2', cor: 'lilas' },
        { id: 2, nome: 'Física', periodo: '2026.2', cor: 'verde' },
      ],
      tarefas,
    }),
  )
}

function salvas() {
  return JSON.parse(localStorage.getItem(CHAVE)).tarefas
}

function area(nome) {
  return screen.getByRole('heading', { name: new RegExp(`^${nome}`) })
    .parentElement
}

/** Simula soltar algo arrastado (bloco ou post-it) numa área do mural. */
function soltarEm(elemento, valor) {
  fireEvent.drop(elemento, { dataTransfer: { getData: () => valor } })
}

const lista = {
  id: 1,
  materiaId: 1,
  titulo: 'Lista 3',
  tipo: 'Lista de exercícios',
  prazo: '2030-01-10T23:59:00',
  status: 'A_FAZER',
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('Post it', () => {
  it('pede uma matéria quando não há nenhuma', () => {
    abrir()

    expect(
      screen.getByRole('link', { name: 'Adicionar matéria' }),
    ).toHaveAttribute('href', '/adicionar-materia')
  })

  it('mostra um bloco por matéria e as três áreas', () => {
    guardar()
    abrir()

    expect(
      screen.getByRole('button', { name: 'Novo post-it de Cálculo' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Novo post-it de Física' }),
    ).toBeInTheDocument()
    expect(area('Atividades')).toBeInTheDocument()
    expect(area('Concluídas')).toBeInTheDocument()
    expect(area('Não realizadas')).toBeInTheDocument()
  })

  it('arrastar o bloco cria um post-it em branco que vira tarefa', () => {
    guardar()
    abrir()

    soltarEm(area('Atividades'), 'materia:2')

    fireEvent.click(
      screen.getByRole('button', { name: /Clique para escrever/ }),
    )

    const formulario = screen.getByRole('form', {
      name: 'Nova atividade de Física',
    })

    fireEvent.change(within(formulario).getByLabelText('Atividade'), {
      target: { value: 'Relatório do pêndulo' },
    })
    fireEvent.change(within(formulario).getByLabelText('Tipo'), {
      target: { value: 'Relatório' },
    })
    fireEvent.change(within(formulario).getByLabelText('Data de entrega'), {
      target: { value: '2030-03-05' },
    })
    fireEvent.click(within(formulario).getByRole('button', { name: 'Colar' }))

    expect(salvas()).toEqual([
      expect.objectContaining({
        materiaId: 2,
        titulo: 'Relatório do pêndulo',
        tipo: 'Relatório',
        prazo: '2030-03-05T23:59:00',
        status: 'A_FAZER',
      }),
    ])
    expect(
      within(area('Atividades')).getByText('Relatório do pêndulo'),
    ).toBeInTheDocument()
  })

  it('clicar no bloco também cria o post-it, e dá para descartar', () => {
    guardar()
    abrir()

    fireEvent.click(
      screen.getByRole('button', { name: 'Novo post-it de Cálculo' }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: /Clique para escrever/ }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }))

    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(salvas()).toEqual([])
  })

  it('arrastar o post-it entre as áreas muda a situação', () => {
    guardar([lista])
    abrir()

    soltarEm(area('Concluídas'), 'tarefa:1')
    expect(salvas()[0].status).toBe('CONCLUIDA')
    expect(within(area('Concluídas')).getByText('Lista 3')).toBeInTheDocument()

    soltarEm(area('Não realizadas'), 'tarefa:1')
    expect(salvas()[0].status).toBe('NAO_REALIZADA')
  })

  it('agrupa os post-its por matéria, na ordem dos blocos', () => {
    guardar([
      { ...lista, id: 1, materiaId: 2, titulo: 'Relatório 1' },
      { ...lista, id: 2, materiaId: 1, titulo: 'Lista 4' },
      { ...lista, id: 3, materiaId: 2, titulo: 'Relatório 2' },
    ])
    abrir()

    const grupos = within(area('Atividades')).getAllByRole('list')

    expect(grupos.map((grupo) => grupo.getAttribute('aria-label'))).toEqual([
      'Atividades: Cálculo',
      'Atividades: Física',
    ])
    expect(within(grupos[1]).getByText('Relatório 1')).toBeInTheDocument()
    expect(within(grupos[1]).getByText('Relatório 2')).toBeInTheDocument()
  })

  it('o seletor "Mover para" faz o mesmo sem arrastar', () => {
    guardar([lista])
    abrir()

    fireEvent.change(screen.getByLabelText('Mover Lista 3 para'), {
      target: { value: 'naorealizadas' },
    })

    expect(salvas()[0].status).toBe('NAO_REALIZADA')
    expect(
      within(area('Não realizadas')).getByText('Lista 3'),
    ).toBeInTheDocument()
  })
})
