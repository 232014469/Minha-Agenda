/**
 * Notas de uma matéria: as avaliações (atividades com nota e as avulsas que
 * a pessoa lançar direto na matéria), a regra do professor e o que sai
 * dela: média, menção da UnB e quanto falta para passar.
 *
 * Toda nota é guardada na escala dela (`nota` de `notaMaxima`, 10 se não
 * disser) e levada para 0 a 10 na conta.
 */

/** Menções da UnB, da maior para a menor (aprova a partir de MM). */
export const MENCOES = [
  { sigla: 'SS', nome: 'Superior', de: 9 },
  { sigla: 'MS', nome: 'Médio superior', de: 7 },
  { sigla: 'MM', nome: 'Médio', de: 5 },
  { sigla: 'MI', nome: 'Médio inferior', de: 3 },
  { sigla: 'II', nome: 'Inferior', de: 0.1 },
  { sigla: 'SR', nome: 'Sem rendimento', de: 0 },
]

export const MEDIA_PARA_PASSAR = 5

/** Como o professor calcula. `ponderada` é o padrão. */
export const MODOS = [
  { id: 'ponderada', nome: 'Média com pesos' },
  { id: 'simples', nome: 'Média simples' },
  { id: 'pontos', nome: 'Soma de pontos' },
]

/** Tipos que contam na nota sem precisar marcar (os outros, só com nota). */
const TIPOS_AVALIADOS = [
  'Prova',
  'Entrega de trabalho',
  'Projeto',
  'Apresentação',
  'Seminário',
  'Relatório',
  'Atividade',
  'Lista de exercícios',
  'Laboratório',
  'Questionário',
]

const numero = (valor) =>
  typeof valor === 'number' && Number.isFinite(valor) ? valor : null

/** A regra da matéria, com os padrões no que não foi escolhido. */
export function regraDa(materia) {
  const regra = materia?.regraDeNotas ?? {}

  return {
    modo: MODOS.some((modo) => modo.id === regra.modo)
      ? regra.modo
      : 'ponderada',
    descartarPior: Boolean(regra.descartarPior),
    extra: Math.max(0, numero(regra.extra) ?? 0),
  }
}

/** Menção da UnB para uma média (SR também quando reprovou por falta). */
export function mencaoDe(media, { reprovadoPorFalta = false } = {}) {
  if (reprovadoPorFalta || media === null || media <= 0) {
    return MENCOES.at(-1)
  }

  return MENCOES.find((mencao) => media >= mencao.de) ?? MENCOES.at(-1)
}

/**
 * As avaliações da matéria: as atividades que contam (pelo tipo, ou por
 * terem nota ou peso) e as avulsas. Peso 0 tira da conta.
 */
export function avaliacoesDa(materia, tarefas) {
  const daMateria = tarefas
    .filter((tarefa) => tarefa.materiaId === materia.id)
    .filter(
      (tarefa) =>
        numero(tarefa.nota) !== null ||
        numero(tarefa.peso) !== null ||
        TIPOS_AVALIADOS.includes(tarefa.tipo),
    )
    .map((tarefa) => ({
      id: `t${tarefa.id}`,
      tarefaId: tarefa.id,
      nome: tarefa.titulo,
      nota: numero(tarefa.nota),
      maxima: numero(tarefa.notaMaxima) ?? 10,
      peso: numero(tarefa.peso) ?? 1,
      substitutiva: Boolean(tarefa.substitutiva),
      perdida: tarefa.status === 'NAO_REALIZADA',
      prazo: tarefa.prazo,
    }))
    .sort((a, b) => String(a.prazo).localeCompare(String(b.prazo)))

  const avulsas = (materia.avaliacoes ?? []).map((avaliacao) => ({
    id: `a${avaliacao.id}`,
    avulsaId: avaliacao.id,
    nome: avaliacao.nome,
    nota: numero(avaliacao.nota),
    maxima: numero(avaliacao.maxima) ?? 10,
    peso: numero(avaliacao.peso) ?? 1,
    substitutiva: Boolean(avaliacao.substitutiva),
    perdida: false,
  }))

  return [...daMateria, ...avulsas]
}

const arredondar = (valor) => Math.round(valor * 100) / 100

/**
 * A conta da matéria. Devolve:
 *
 * - `media`: com o que já saiu (null se nada saiu), de 0 a 10;
 * - `garantida`: o mínimo que já está garantido (o que falta valendo zero);
 * - `mencao`: a menção da UnB da média;
 * - `falta`: quanto da nota ainda não saiu (0 a 1);
 * - `precisa`: a nota (0 a 10) que precisa tirar em cada avaliação que falta
 *   para fechar com 5 (null se não falta nada); `situacao` diz o resto:
 *   'sem-notas', 'aprovado', 'precisa', 'impossivel', 'fechada' ou
 *   'reprovado';
 * - `itens`: as avaliações, com `normal` (a nota de 0 a 10) e `conta`.
 */
export function calcularNotas(
  materia,
  tarefas,
  { reprovadoPorFalta = false } = {},
) {
  const regra = regraDa(materia)
  let itens = avaliacoesDa(materia, tarefas).map((item) => ({
    ...item,
    // Não realizada sem nota conta como zero
    nota: item.nota === null && item.perdida ? 0 : item.nota,
  }))

  itens = itens.map((item) => ({
    ...item,
    normal:
      item.nota === null ? null : Math.min(10, (item.nota / item.maxima) * 10),
    conta: !item.substitutiva && (regra.modo === 'pontos' || item.peso > 0),
    peso: regra.modo === 'simples' ? 1 : item.peso,
  }))

  // Substitutiva: troca a menor nota, se for maior que ela
  for (const sub of itens.filter(
    (item) => item.substitutiva && item.normal !== null,
  )) {
    const menor = itens
      .filter((item) => item.conta && item.normal !== null)
      .sort((a, b) => a.normal - b.normal)[0]

    if (menor && sub.normal > menor.normal) {
      menor.normal = sub.normal
      menor.nota = (sub.normal / 10) * menor.maxima
      menor.substituida = true
    }
  }

  // Descartar a pior: só quando já tem mais de uma nota
  if (regra.descartarPior) {
    const comNota = itens.filter((item) => item.conta && item.normal !== null)

    if (comNota.length > 1) {
      const pior = comNota.sort((a, b) => a.normal - b.normal)[0]

      pior.conta = false
      pior.descartada = true
    }
  }

  const contam = itens.filter((item) => item.conta)
  const saiu = contam.filter((item) => item.normal !== null)
  const falta = contam.filter((item) => item.normal === null)

  // Peso de cada uma na nota final (na soma de pontos, quanto ela vale)
  const pesoDe = (item) => (regra.modo === 'pontos' ? item.maxima : item.peso)
  const pesoTotal = contam.reduce((soma, item) => soma + pesoDe(item), 0)
  const pesoSaiu = saiu.reduce((soma, item) => soma + pesoDe(item), 0)
  const pontos = saiu.reduce(
    (soma, item) => soma + item.normal * pesoDe(item),
    0,
  )

  const comExtra = (valor) => Math.min(10, valor + regra.extra)
  const media = pesoSaiu > 0 ? arredondar(comExtra(pontos / pesoSaiu)) : null
  const garantida =
    pesoTotal > 0 ? arredondar(comExtra(pontos / pesoTotal)) : null
  const pesoFalta = pesoTotal - pesoSaiu

  let precisa = null
  let situacao

  if (reprovadoPorFalta) situacao = 'reprovado'
  else if (pesoTotal === 0 || (saiu.length === 0 && falta.length === 0)) {
    situacao = 'sem-notas'
  } else if (pesoFalta === 0) situacao = 'fechada'
  else {
    // A mesma nota em todas as que faltam, para fechar com 5
    const necessaria =
      ((MEDIA_PARA_PASSAR - regra.extra) * pesoTotal - pontos) / pesoFalta

    if (necessaria <= 0) situacao = 'aprovado'
    else if (necessaria > 10) situacao = 'impossivel'
    else {
      situacao = 'precisa'
      precisa = Math.ceil(necessaria * 10) / 10
    }
  }

  return {
    regra,
    media,
    garantida,
    mencao: media === null ? null : mencaoDe(media, { reprovadoPorFalta }),
    falta: pesoTotal > 0 ? pesoFalta / pesoTotal : 0,
    precisa,
    situacao,
    itens,
  }
}

/** "7,5" (vírgula, até uma casa). */
export function formatarNota(valor) {
  if (valor === null || valor === undefined) return '–'

  return (Math.round(valor * 10) / 10).toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  })
}

/** Lê "7,5" ou "7.5"; vazio é null (sem nota). */
export function lerNota(texto) {
  const limpo = String(texto ?? '')
    .trim()
    .replace(',', '.')

  if (limpo === '') return null

  const valor = Number(limpo)

  return Number.isFinite(valor) && valor >= 0 ? valor : null
}
