const CHAVE = 'minha-agenda.dados'

export const CORES = ['lilas', 'amarelo', 'verde', 'rosa', 'azul']
export const STATUS = ['A_FAZER', 'EM_ANDAMENTO', 'CONCLUIDA']

export const DADOS_VAZIOS = { versao: 1, materias: [], tarefas: [] }

const texto = (valor) => typeof valor === 'string'

/**
 * Confere a forma dos dados lidos do navegador ou de um arquivo de backup.
 * Devolve os dados limpos ou `null` se o conteúdo não for válido.
 */
export function validarDados(dados) {
  if (!dados || !Array.isArray(dados.materias) || !Array.isArray(dados.tarefas))
    return null

  const materias = dados.materias.filter(
    (materia) =>
      Number.isInteger(materia?.id) &&
      texto(materia.nome) &&
      CORES.includes(materia.cor),
  )
  const ids = new Set(materias.map((materia) => materia.id))
  const tarefas = dados.tarefas.filter(
    (tarefa) =>
      Number.isInteger(tarefa?.id) &&
      ids.has(tarefa.materiaId) &&
      texto(tarefa.titulo) &&
      !Number.isNaN(new Date(tarefa.prazo).getTime()) &&
      STATUS.includes(tarefa.status),
  )

  return { versao: 1, materias, tarefas }
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
