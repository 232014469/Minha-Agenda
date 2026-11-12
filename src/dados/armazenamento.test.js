// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import {
  CHAVE,
  CORES,
  DADOS_VAZIOS,
  lerDados,
  proximoId,
  salvarDados,
  semestreDaData,
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
      semestre: null,
      materias: [materia],
      tarefas: [tarefa],
      cursadas: [],
    })
  })

  it('aceita a situação Não realizada', () => {
    const naoFeita = { ...tarefa, status: 'NAO_REALIZADA' }

    expect(
      validarDados({ materias: [materia], tarefas: [naoFeita] }).tarefas,
    ).toEqual([naoFeita])
  })

  it('aceita as 8 cores de matéria', () => {
    const materias = CORES.map((cor, indice) => ({
      ...materia,
      id: indice + 1,
      cor,
    }))

    expect(CORES).toHaveLength(8)
    expect(validarDados({ materias, tarefas: [] }).materias).toEqual(materias)
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
    const dados = {
      versao: 1,
      semestre: '2026.2',
      materias: [materia],
      tarefas: [tarefa],
      cursadas: ['MAT0025'],
    }

    expect(salvarDados(dados)).toBe(true)
    expect(lerDados()).toEqual(dados)
  })

  it('ignora um conteúdo salvo que está corrompido', () => {
    localStorage.setItem(CHAVE, '{não é json')

    expect(lerDados()).toEqual(DADOS_VAZIOS)
  })
})

describe('semestres', () => {
  it('calcula o semestre pela data', () => {
    expect(semestreDaData(new Date(2026, 0, 10))).toBe('2026.1')
    expect(semestreDaData(new Date(2026, 5, 30))).toBe('2026.1')
    expect(semestreDaData(new Date(2026, 6, 1))).toBe('2026.2')
    expect(semestreDaData(new Date(2026, 11, 31))).toBe('2026.2')
  })

  it('guarda o semestre escolhido e limpa o período da matéria', () => {
    const resultado = validarDados({
      semestre: '2026.2',
      materias: [{ ...materia, periodo: ' 2026.1 ' }],
      tarefas: [],
      notas: [{ id: 1, texto: 'antigo', cor: 'rosa' }],
    })

    expect(resultado.semestre).toBe('2026.2')
    expect(resultado.materias[0].periodo).toBe('2026.1')
    expect(resultado).not.toHaveProperty('notas')
  })
})

describe('cursadas', () => {
  it('guarda os códigos sem repetir e ignora o que não é texto', () => {
    expect(
      validarDados({
        materias: [],
        tarefas: [],
        cursadas: ['MAT0025', 'MAT0025', 42, 'OPT-7-1'],
      }).cursadas,
    ).toEqual(['MAT0025', 'OPT-7-1'])
  })

  it('backup antigo sem cursadas vira lista vazia', () => {
    expect(validarDados({ materias: [], tarefas: [] }).cursadas).toEqual([])
  })
})

describe('proximoId', () => {
  it('começa em 1 e segue o maior id', () => {
    expect(proximoId([])).toBe(1)
    expect(proximoId([{ id: 3 }, { id: 7 }])).toBe(8)
  })
})
