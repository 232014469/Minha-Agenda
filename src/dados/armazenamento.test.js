// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import {
  DADOS_VAZIOS,
  lerDados,
  proximoId,
  salvarDados,
  validarDados,
} from './armazenamento'

const materia = { id: 1, nome: 'Cálculo', periodo: '2026.2', cor: 'lilas' }
const tarefa = {
  id: 1,
  materiaId: 1,
  titulo: 'Lista 1',
  tipo: 'Lista de exercícios',
  prazo: '2026-11-20T23:59:00',
  status: 'A_FAZER',
}

afterEach(() => {
  localStorage.clear()
})

describe('validarDados', () => {
  it('aceita dados corretos', () => {
    expect(validarDados({ materias: [materia], tarefas: [tarefa] })).toEqual({
      versao: 1,
      materias: [materia],
      tarefas: [tarefa],
    })
  })

  it('rejeita o que não tem a forma esperada', () => {
    expect(validarDados(null)).toBeNull()
    expect(validarDados({ materias: [] })).toBeNull()
    expect(validarDados('texto')).toBeNull()
  })

  it('descarta tarefas de matéria que não existe e itens inválidos', () => {
    const resultado = validarDados({
      materias: [materia, { id: 2, nome: 'Sem cor' }],
      tarefas: [
        tarefa,
        { ...tarefa, id: 2, materiaId: 9 },
        { ...tarefa, id: 3, status: 'XYZ' },
        { ...tarefa, id: 4, prazo: 'ontem' },
      ],
    })

    expect(resultado.materias).toEqual([materia])
    expect(resultado.tarefas).toEqual([tarefa])
  })
})

describe('lerDados e salvarDados', () => {
  it('começa vazio', () => {
    expect(lerDados()).toEqual(DADOS_VAZIOS)
  })

  it('devolve o que foi salvo', () => {
    const dados = { versao: 1, materias: [materia], tarefas: [tarefa] }

    expect(salvarDados(dados)).toBe(true)
    expect(lerDados()).toEqual(dados)
  })

  it('ignora um conteúdo salvo que está corrompido', () => {
    localStorage.setItem('minha-agenda.dados', '{não é json')

    expect(lerDados()).toEqual(DADOS_VAZIOS)
  })
})

describe('proximoId', () => {
  it('começa em 1 e segue o maior id', () => {
    expect(proximoId([])).toBe(1)
    expect(proximoId([{ id: 3 }, { id: 7 }])).toBe(8)
  })
})
