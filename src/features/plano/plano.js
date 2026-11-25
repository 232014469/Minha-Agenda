import {
  EVENTO_EXTRAS_RECEBIDOS,
  ITENS_EXTRAS,
  marcarExtra,
} from '../../sync/extras'
import { cargaHorariaDe } from '../faltas/faltas'
import { DISCIPLINAS } from '../materias/dadosFluxograma'
import { nomeBonito } from '../materias/historico'
import { somarSemestres, vagasDeOptativas } from '../materias/previsao'

export { EVENTO_EXTRAS_RECEBIDOS }

/** Acima disso (em créditos), o semestre ganha o aviso de puxado. */
export const CREDITOS_PUXADO = 30

const CHAVE = ITENS_EXTRAS.plano
const SEMESTRE = /^\d{4}\.[12]$/
const PLANO_VAZIO = { semestres: [], itens: [] }

export const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()

/** "2026.2" → número que cresce com o tempo (para ordenar e comparar). */
export function ordemDoSemestre(semestre) {
  const [ano, periodo] = String(semestre).split('.').map(Number)

  return ano * 2 + (periodo - 1)
}

const porOrdem = (a, b) => ordemDoSemestre(a) - ordemDoSemestre(b)

function novoId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Só o que tem cara de plano: semestres "2027.1" e disciplinas com nome. */
export function validarPlano(plano) {
  if (!plano || typeof plano !== 'object') return PLANO_VAZIO

  const semestres = [
    ...new Set(
      (Array.isArray(plano.semestres) ? plano.semestres : []).filter(
        (semestre) => SEMESTRE.test(semestre),
      ),
    ),
  ].sort(porOrdem)

  const itens = (Array.isArray(plano.itens) ? plano.itens : [])
    .filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.nome === 'string' &&
        item.nome.trim() &&
        SEMESTRE.test(item.semestre) &&
        Number.isFinite(item.horas) &&
        item.horas > 0,
    )
    .map((item) => ({
      id: item.id,
      nome: item.nome.trim().slice(0, 80),
      codigo: typeof item.codigo === 'string' ? item.codigo : '',
      tipo: item.tipo === 'optativa' ? 'optativa' : 'obrigatoria',
      horas: Math.min(240, Math.round(item.horas)),
      semestre: item.semestre,
    }))

  // Toda disciplina mora num semestre que aparece no plano
  for (const item of itens) {
    if (!semestres.includes(item.semestre)) semestres.push(item.semestre)
  }

  return { semestres: semestres.sort(porOrdem), itens }
}

export function lerPlano() {
  try {
    return validarPlano(JSON.parse(localStorage.getItem(CHAVE) ?? 'null'))
  } catch {
    return PLANO_VAZIO
  }
}

/** Guarda e avisa a sincronização, só se mudou de verdade. */
export function guardarPlano(plano) {
  const vazio = !plano.semestres.length && !plano.itens.length
  const texto = vazio ? '' : JSON.stringify(plano)

  try {
    const guardado = localStorage.getItem(CHAVE) ?? ''

    // Igual ao que já está guardado (mesmo escrito de outro jeito): nada a fazer
    if (guardado === texto) return
    if (guardado && JSON.stringify(lerPlano()) === JSON.stringify(plano)) return
    if (!guardado && vazio) return
    localStorage.setItem(CHAVE, texto)
    marcarExtra('plano')
  } catch {
    // Sem armazenamento: o plano vale só até fechar a página.
  }
}

/** O semestre logo depois do último do plano (ou do atual). */
export function proximoSemestre(plano, atual) {
  const ultimo = [atual, ...plano.semestres].sort(porOrdem).at(-1)

  return somarSemestres(ultimo, 1)
}

export function adicionarSemestre(plano, atual) {
  const novo = proximoSemestre(plano, atual)

  return novo ? { ...plano, semestres: [...plano.semestres, novo] } : plano
}

/** Tira um semestre; o que estava nele volta para "Para encaixar". */
export function removerSemestre(plano, semestre) {
  return {
    semestres: plano.semestres.filter((item) => item !== semestre),
    itens: plano.itens.filter((item) => item.semestre !== semestre),
  }
}

export function encaixar(plano, disciplina, semestre) {
  const semestres = plano.semestres.includes(semestre)
    ? plano.semestres
    : [...plano.semestres, semestre].sort(porOrdem)

  return {
    semestres,
    itens: [
      ...plano.itens,
      {
        id: novoId(),
        nome: disciplina.nome.trim(),
        codigo: disciplina.codigo ?? '',
        tipo: disciplina.tipo === 'optativa' ? 'optativa' : 'obrigatoria',
        horas: disciplina.horas,
        semestre,
      },
    ],
  }
}

export function moverItem(plano, id, semestre) {
  const semestres = plano.semestres.includes(semestre)
    ? plano.semestres
    : [...plano.semestres, semestre].sort(porOrdem)

  return {
    semestres,
    itens: plano.itens.map((item) =>
      item.id === id ? { ...item, semestre } : item,
    ),
  }
}

export function tirarItem(plano, id) {
  return { ...plano, itens: plano.itens.filter((item) => item.id !== id) }
}

/**
 * O que ainda falta pôr no plano: as obrigatórias pendentes do histórico do
 * SIGAA (ou, sem ele, as do fluxograma ainda não cursadas) e as optativas
 * que faltam, em vagas. Sai da lista o que já está no plano ou sendo
 * cursado agora.
 */
export function paraEncaixar({
  plano,
  materias = [],
  progresso = null,
  fluxogramaAtivo = false,
  cursadas = [],
}) {
  const noPlano = new Set(
    plano.itens.flatMap((item) => [item.codigo, normalizar(item.nome)]),
  )
  noPlano.delete('')
  const cursando = new Set(materias.map((materia) => normalizar(materia.nome)))
  const fora = (disciplina) =>
    noPlano.has(disciplina.codigo) ||
    noPlano.has(normalizar(disciplina.nome)) ||
    cursando.has(normalizar(disciplina.nome))

  const lista = []

  if (progresso) {
    for (const pendente of progresso.pendentes ?? []) {
      lista.push({
        chave: pendente.codigo,
        codigo: pendente.codigo,
        nome: nomeBonito(pendente.nome),
        horas: pendente.ch,
        tipo: 'obrigatoria',
      })
    }
  } else if (fluxogramaAtivo) {
    for (const disciplina of DISCIPLINAS) {
      if (!disciplina.codigo || cursadas.includes(disciplina.id)) continue
      lista.push({
        chave: disciplina.id,
        codigo: disciplina.codigo,
        nome: disciplina.nome,
        horas: disciplina.creditos * 15,
        tipo: 'obrigatoria',
      })
    }
  }

  const obrigatorias = lista.filter((disciplina) => !fora(disciplina))

  // Optativas: as horas que faltam, menos as já planejadas e as matérias do
  // semestre que não são obrigatórias pendentes
  let horasDeOptativa = 0

  if (progresso?.exigido) {
    horasDeOptativa = Math.max(
      0,
      progresso.exigido.optativas - (progresso.integralizado?.optativas ?? 0),
    )
  } else if (fluxogramaAtivo) {
    horasDeOptativa = DISCIPLINAS.filter(
      (disciplina) => !disciplina.codigo && !cursadas.includes(disciplina.id),
    ).reduce((total, disciplina) => total + disciplina.creditos * 15, 0)
  }

  const nomesObrigatorios = new Set(lista.map((item) => normalizar(item.nome)))
  const optativasCursando = materias
    .filter((materia) => !nomesObrigatorios.has(normalizar(materia.nome)))
    .reduce((total, materia) => total + cargaHorariaDe(materia), 0)
  const optativasPlanejadas = plano.itens
    .filter((item) => item.tipo === 'optativa')
    .reduce((total, item) => total + item.horas, 0)

  const vagas = vagasDeOptativas(
    Math.max(0, horasDeOptativa - optativasCursando - optativasPlanejadas),
  ).map((horas, indice) => ({
    chave: `optativa-${indice}`,
    codigo: '',
    nome: 'Optativa',
    horas,
    tipo: 'optativa',
  }))

  return [...obrigatorias, ...vagas]
}

/**
 * Números do plano: horas por semestre, quando seria a formatura (o último
 * semestre com alguma coisa, se não sobrou nada para encaixar) e quantas
 * horas ainda estão sem semestre.
 */
export function resumirPlano({ plano, materias = [], semestre, faltando }) {
  const horasPorSemestre = {}

  for (const item of plano.itens) {
    horasPorSemestre[item.semestre] =
      (horasPorSemestre[item.semestre] ?? 0) + item.horas
  }

  const horasCursando = materias.reduce(
    (total, materia) => total + cargaHorariaDe(materia),
    0,
  )
  horasPorSemestre[semestre] = (horasPorSemestre[semestre] ?? 0) + horasCursando

  const comAlgo = Object.keys(horasPorSemestre)
    .filter((chave) => horasPorSemestre[chave] > 0)
    .sort(porOrdem)
  const horasSemSemestre = faltando.reduce(
    (total, disciplina) => total + disciplina.horas,
    0,
  )

  return {
    horasPorSemestre,
    horasSemSemestre,
    formatura: faltando.length === 0 ? (comAlgo.at(-1) ?? null) : null,
    semestresAte: comAlgo.length,
  }
}
