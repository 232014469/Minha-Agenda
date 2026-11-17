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
  validarProgressoCurso,
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
      fluxogramaAtivo: false,
      removidos: [],
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

describe('validarProgressoCurso', () => {
  it('guarda só curso, horas e disciplinas, e descarta o que não serve', () => {
    const limpo = validarProgressoCurso({
      curso: 'CIÊNCIAS CONTÁBEIS',
      nome: 'NÃO DEVIA FICAR',
      exigido: { obrigatorias: 10, optativas: 5, complementares: 0, total: 15 },
      integralizado: { obrigatorias: -1 },
      cursadas: [{ codigo: 'CCA0015', nome: 'X' }, { codigo: 'errado' }],
      pendentes: [
        { codigo: 'CCA0077', nome: 'Y', ch: 60 },
        { codigo: 'CCA0078', nome: 'Z' },
      ],
      alteradoEm: 5,
    })

    expect(limpo).toEqual({
      curso: 'CIÊNCIAS CONTÁBEIS',
      exigido: { obrigatorias: 10, optativas: 5, complementares: 0, total: 15 },
      integralizado: null,
      cursadas: [{ codigo: 'CCA0015', nome: 'X', tipo: 'obrigatoria' }],
      pendentes: [{ codigo: 'CCA0077', nome: 'Y', ch: 60 }],
      oculto: false,
      alteradoEm: 5,
    })
    expect(validarProgressoCurso({ curso: 3 })).toBeNull()
    expect(validarDados({ materias: [], tarefas: [] }).progressoCurso).toBe(
      undefined,
    )
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
      fluxogramaAtivo: true,
      removidos: ['t:9'],
    }

    expect(salvarDados(dados)).toBe(true)
    expect(lerDados()).toEqual(dados)
  })

  it('traz os dados do Jeff Study ou do Study antigos e guarda na gaveta nova', () => {
    const antigos = { materias: [materia], tarefas: [tarefa] }

    localStorage.setItem('jeff-study.dados', JSON.stringify(antigos))

    expect(lerDados().materias).toEqual([materia])
    expect(JSON.parse(localStorage.getItem(CHAVE)).materias).toEqual([materia])
    // A gaveta antiga continua lá, intacta.
    expect(localStorage.getItem('jeff-study.dados')).not.toBeNull()
  })

  it('a gaveta nova tem prioridade sobre as antigas', () => {
    localStorage.setItem(
      'study.dados',
      JSON.stringify({ materias: [materia], tarefas: [] }),
    )
    localStorage.setItem(CHAVE, JSON.stringify({ materias: [], tarefas: [] }))

    expect(lerDados().materias).toEqual([])
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
  it('é sempre maior que os ids que já existem', () => {
    expect(proximoId([{ id: 3 }, { id: 7 }])).toBeGreaterThan(7)
    expect(proximoId([{ id: 9e15 }])).toBe(9e15 + 1)
  })

  it('dois aparelhos ao mesmo tempo dificilmente repetem o id', () => {
    const ids = new Set(
      Array.from({ length: 200 }, () => proximoId([], 1_700_000_000_000)),
    )

    expect(ids.size).toBeGreaterThan(150)
    expect([...ids].every(Number.isSafeInteger)).toBe(true)
  })
})
