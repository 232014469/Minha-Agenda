import { APP } from '../config/app'

export const CHAVE = APP.chaveDosDados

export const CORES = [
  'lilas',
  'amarelo',
  'verde',
  'rosa',
  'azul',
  'laranja',
  'turquesa',
  'marrom',
]

/** Nome de cada cor, para mostrar na tela. */
export const NOMES_DAS_CORES = {
  lilas: 'Lilás',
  amarelo: 'Amarelo',
  verde: 'Verde',
  rosa: 'Rosa',
  azul: 'Azul',
  laranja: 'Laranja',
  turquesa: 'Turquesa',
  marrom: 'Marrom',
}
/** Tipos de entrega que aparecem no cadastro de tarefa. */
export const TIPOS = [
  'Entrega de trabalho',
  'Prova',
  'Lista de exercícios',
  'Apresentação',
  'Seminário',
  'Projeto',
  'Relatório',
  'Laboratório',
  'Questionário',
  'Fórum',
  'Leitura',
  'Outro',
]

export const STATUS = ['A_FAZER', 'EM_ANDAMENTO', 'CONCLUIDA', 'NAO_REALIZADA']

export const DADOS_VAZIOS = {
  versao: 1,
  semestre: null,
  materias: [],
  tarefas: [],
  cursadas: [],
}

/** Semestre de uma data: "2026.1" de janeiro a junho, "2026.2" de julho a dezembro. */
export function semestreDaData(data = new Date()) {
  return `${data.getFullYear()}.${data.getMonth() < 6 ? 1 : 2}`
}

/** Como o semestre aparece na tela. Matéria sem período fica em "Sem semestre". */
export function nomeDoSemestre(semestre) {
  return semestre ? semestre : 'Sem semestre'
}

const texto = (valor) => typeof valor === 'string'

/**
 * Confere a forma dos dados lidos do navegador ou de um arquivo de backup.
 * Devolve os dados limpos ou `null` se o conteúdo não for válido.
 */
export function validarDados(dados) {
  if (!dados || !Array.isArray(dados.materias) || !Array.isArray(dados.tarefas))
    return null

  const materias = dados.materias
    .filter(
      (materia) =>
        Number.isInteger(materia?.id) &&
        texto(materia.nome) &&
        CORES.includes(materia.cor),
    )
    .map((materia) => ({
      ...materia,
      periodo: texto(materia.periodo) ? materia.periodo.trim() : '',
    }))
  const semestre = texto(dados.semestre) ? dados.semestre : null
  const ids = new Set(materias.map((materia) => materia.id))
  const tarefas = dados.tarefas.filter(
    (tarefa) =>
      Number.isInteger(tarefa?.id) &&
      ids.has(tarefa.materiaId) &&
      texto(tarefa.titulo) &&
      !Number.isNaN(new Date(tarefa.prazo).getTime()) &&
      STATUS.includes(tarefa.status),
  )

  // Disciplinas do fluxograma marcadas como cursadas (pelo código).
  const cursadas = Array.isArray(dados.cursadas)
    ? [...new Set(dados.cursadas.filter(texto))]
    : []

  return { versao: 1, semestre, materias, tarefas, cursadas }
}

export function lerDados() {
  try {
    const salvo = window.localStorage.getItem(CHAVE)

    return (salvo && validarDados(JSON.parse(salvo))) || DADOS_VAZIOS
  } catch {
    return DADOS_VAZIOS
  }
}

/** Guarda no navegador. Devolve `false` se não foi possível (modo privado, cheio...). */
export function salvarDados(dados) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(dados))
    return true
  } catch {
    return false
  }
}

export function proximoId(lista) {
  return lista.reduce((maior, item) => Math.max(maior, item.id), 0) + 1
}
