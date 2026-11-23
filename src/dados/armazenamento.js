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
  'Atividade',
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
  fluxogramaAtivo: false,
  removidos: [],
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

const CODIGO_DE_DISCIPLINA = /^[A-Z]{3}\d{4}$/
const TIPOS_DE_DISCIPLINA = [
  'obrigatoria',
  'optativa',
  'eletiva',
  'complementar',
]
const horas = (valor) =>
  Number.isInteger(valor) && valor >= 0 && valor <= 100000

function totaisValidos(totais) {
  if (!totais || typeof totais !== 'object') return null

  const campos = ['obrigatorias', 'optativas', 'complementares', 'total']

  return campos.every((campo) => horas(totais[campo]))
    ? Object.fromEntries(campos.map((campo) => [campo, totais[campo]]))
    : null
}

function disciplinasValidas(lista, comCarga) {
  if (!Array.isArray(lista)) return []

  return lista
    .filter(
      (item) =>
        CODIGO_DE_DISCIPLINA.test(item?.codigo) &&
        texto(item.nome) &&
        (!comCarga || horas(item.ch)),
    )
    .slice(0, 400)
    .map((item) => ({
      codigo: item.codigo,
      nome: item.nome.slice(0, 200),
      ...(comCarga && { ch: item.ch }),
      ...(!comCarga && {
        tipo: TIPOS_DE_DISCIPLINA.includes(item.tipo)
          ? item.tipo
          : 'obrigatoria',
      }),
    }))
}

/**
 * Progresso no curso lido do histórico (qualquer curso): só o nome do curso,
 * os totais de horas e as disciplinas. Devolve `null` se não servir.
 */
export function validarProgressoCurso(valor) {
  if (!valor || typeof valor !== 'object' || !texto(valor.curso)) return null

  return {
    curso: valor.curso.slice(0, 120),
    exigido: totaisValidos(valor.exigido),
    integralizado: totaisValidos(valor.integralizado),
    cursadas: disciplinasValidas(valor.cursadas, false),
    pendentes: disciplinasValidas(valor.pendentes, true),
    oculto: valor.oculto === true,
    alteradoEm: Number.isFinite(valor.alteradoEm) ? valor.alteradoEm : 0,
  }
}

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
    .map((materia) => {
      const limpa = {
        ...materia,
        periodo: texto(materia.periodo) ? materia.periodo.trim() : '',
      }

      // Faltas (em horas) e carga horária: valores estranhos são ignorados.
      if (!(Number.isInteger(limpa.faltas) && limpa.faltas >= 0)) {
        delete limpa.faltas
      }
      if (!(
        Number.isInteger(limpa.cargaHoraria) &&
        limpa.cargaHoraria >= 15 &&
        limpa.cargaHoraria <= 300
      )) {
        delete limpa.cargaHoraria
      }

      return limpa
    })
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

  // O fluxograma só aparece depois de importar um histórico do curso.
  const fluxogramaAtivo = dados.fluxogramaAtivo === true

  // O que foi excluído ("m:12" matéria, "t:40" tarefa), para a sincronização
  // não trazer de volta de outro aparelho. Guarda só os mais recentes.
  const removidos = Array.isArray(dados.removidos)
    ? [...new Set(dados.removidos.filter(texto))].slice(-2000)
    : []

  const progressoCurso = validarProgressoCurso(dados.progressoCurso)

  return {
    versao: 1,
    semestre,
    materias,
    tarefas,
    cursadas,
    fluxogramaAtivo,
    removidos,
    ...(progressoCurso && { progressoCurso }),
  }
}

function lerGaveta(chave) {
  const salvo = window.localStorage.getItem(chave)

  return salvo ? validarDados(JSON.parse(salvo)) : null
}

/**
 * Lê os dados do navegador. Se a gaveta atual estiver vazia, traz os dados
 * de uma versão anterior do app (Jeff Study, Study) para ela. A gaveta
 * antiga fica como estava.
 */
export function lerDados() {
  try {
    const atuais = lerGaveta(CHAVE)

    if (atuais) return atuais

    for (const antiga of APP.chavesAntigas ?? []) {
      const dados = lerGaveta(antiga)

      if (dados) {
        salvarDados(dados)
        return dados
      }
    }

    return DADOS_VAZIOS
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

/**
 * Id novo para matéria ou tarefa. Usa a hora atual com um sorteio no fim,
 * para dois aparelhos sincronizados não criarem o mesmo id. Continua
 * sendo um número inteiro e sempre maior que os ids que já existem.
 */
export function proximoId(lista, agora = Date.now()) {
  const maior = lista.reduce((atual, item) => Math.max(atual, item.id), 0)
  const unico = agora * 1000 + Math.floor(Math.random() * 1000)

  return Math.max(maior + 1, unico)
}
