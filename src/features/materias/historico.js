import { CODIGOS_ANTIGOS, NOME_NO_HISTORICO } from '../../config/curso'
import { DISCIPLINAS } from './dadosFluxograma'

/** Situações do SIGAA: só as primeiras contam como cursada. */
const CONTA_COMO_CURSADA = new Set(['APR', 'CUMP', 'DISP'])
const OUTRAS_SITUACOES = new Set([
  'REP',
  'REPF',
  'REPMF',
  'TRANC',
  'MATR',
  'CANC',
])

const CODIGO = /^[A-Z]{3}\d{4}$/

/**
 * Cada leitor de PDF copia de um jeito: espaços invisíveis ou duplos,
 * acentos decompostos. Tudo vira espaço simples e acento composto.
 */
export function limparTexto(texto) {
  return String(texto ?? '')
    .normalize('NFC')
    .replace(/[\u00a0\u2000-\u200b\u202f\u205f\u3000]/g, ' ')
}

/** A tabela de disciplinas cursadas, sem o resto do histórico. */
function tabelaDeCursadas(texto) {
  const inicio = texto.indexOf('Cursados/Cursando')
  const fim = texto.indexOf('Legenda', inicio)

  if (inicio < 0) return texto
  return texto.slice(inicio, fim < 0 ? undefined : fim)
}

/**
 * Lê o texto copiado do histórico do SIGAA (PDF → Cmd+A, Cmd+C) e devolve:
 * - `cursadas`: ids do fluxograma aprovados, dispensados ou cumpridos
 *   (inclusive por equivalência, "Cumpriu FGA0157 ... através de ...");
 * - `fora`: códigos aprovados que não estão no fluxograma (optativas,
 *   eletivas...), para a tela avisar;
 * - `doCurso`: se o histórico é de um aluno do curso do fluxograma. O SIGAA
 *   escreve "Curso: ENGENHARIA DE SOFTWARE/FCTE - ..."; a barra depois do
 *   nome separa o curso de uma disciplina com o mesmo nome.
 *
 * Cada linha da tabela tem um código e uma situação. Dependendo de onde o PDF
 * é copiado, as colunas vêm lado a lado ou uma depois da outra, mas sempre na
 * mesma ordem: por isso o n-ésimo código combina com a n-ésima situação.
 * Nada além dos códigos e das situações é usado.
 */
export function lerHistorico(texto) {
  const doFluxograma = new Set(DISCIPLINAS.map((item) => item.id))
  const conteudo = limparTexto(texto)
  const { aprovados, usadosEmEquivalencia } = aprovadosDe(conteudo)

  const cursadas = new Set()
  const fora = []

  for (const codigo of aprovados) {
    const novo = CODIGOS_ANTIGOS[codigo] ?? codigo

    if (doFluxograma.has(novo)) cursadas.add(novo)
    else if (!usadosEmEquivalencia.has(codigo)) fora.push(codigo)
  }

  // O nome do curso, aceitando qualquer espaço ou quebra de linha entre as
  // palavras e maiúsculas ou minúsculas.
  const nome = NOME_NO_HISTORICO.trim().split(/\s+/).join('\\s+')
  const pelaLinhaDoCurso = new RegExp(
    `Curso:?\\s*${nome}|${nome}\\s*/`,
    'i',
  ).test(conteudo)

  // Se a linha do curso veio embaralhada na cópia: várias disciplinas
  // próprias do curso (FGA) aprovadas também mostram que é dele.
  const proprias = [...cursadas].filter((id) => id.startsWith('FGA')).length
  const doCurso = pelaLinhaDoCurso || proprias >= 5

  return { cursadas: [...cursadas], fora: fora.sort(), doCurso }
}

/**
 * Códigos aprovados, dispensados ou cumpridos no histórico (inclusive por
 * equivalência), e os usados para cumprir outra disciplina.
 */
function aprovadosDe(conteudo) {
  const aprovados = new Set()
  const usadosEmEquivalencia = new Set()

  for (const [, cumprido, atraves] of conteudo.matchAll(
    /Cumpriu\s+([A-Z]{3}\d{4})\b[\s\S]*?através de\s+([A-Z]{3}\d{4})/g,
  )) {
    aprovados.add(cumprido)
    usadosEmEquivalencia.add(atraves)
  }

  const palavras = tabelaDeCursadas(conteudo).split(/\s+/)
  const codigos = palavras.filter((palavra) => CODIGO.test(palavra))
  const situacoes = palavras.filter(
    (palavra) =>
      CONTA_COMO_CURSADA.has(palavra) || OUTRAS_SITUACOES.has(palavra),
  )

  if (codigos.length === situacoes.length) {
    codigos.forEach((codigo, indice) => {
      if (CONTA_COMO_CURSADA.has(situacoes[indice])) aprovados.add(codigo)
    })
  } else {
    // Se as contas não fecham, cada código vale até a próxima situação.
    let atual = null

    for (const palavra of palavras) {
      if (CODIGO.test(palavra)) {
        atual = palavra
      } else if (atual && CONTA_COMO_CURSADA.has(palavra)) {
        aprovados.add(atual)
        atual = null
      } else if (OUTRAS_SITUACOES.has(palavra)) {
        atual = null
      }
    }
  }

  return { aprovados, usadosEmEquivalencia }
}

/** Palavras que ficam minúsculas no meio do nome de uma disciplina. */
const MINUSCULAS = new Set(
  'a à às ao aos da das de do dos e em na nas no nos o os ou para por com'.split(
    ' ',
  ),
)

const ROMANO = /^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i

/** "CONTABILIDADE GERAL 2" → "Contabilidade Geral 2". */
export function nomeBonito(texto) {
  return String(texto ?? '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((palavra, indice) => {
      if (ROMANO.test(palavra)) return palavra.toUpperCase()
      if (indice > 0 && MINUSCULAS.has(palavra)) return palavra

      return palavra.charAt(0).toUpperCase() + palavra.slice(1)
    })
    .join(' ')
}

/** Tira do nome o que vem depois dele na mesma linha (CH, turma, notas...). */
function limparNome(texto) {
  return texto
    .split(/\s{2,}/)[0]
    .replace(/\s+\d+\s+(?:\d{2}|--)\s.*$/, '')
    .replace(/^[-–\s]+/, '')
    .trim()
}

const TOTAIS = ['obrigatorias', 'optativas', 'complementares', 'total']

/** Marcas da legenda do SIGAA antes do código da disciplina. */
const TIPO_PELA_MARCA = {
  '*': 'optativa',
  '&': 'optativa',
  '§': 'optativa',
  '#': 'eletiva',
  '%': 'complementar',
  '@': 'obrigatoria',
}

/** "Exigido 2130 h 930 h 0 h 3060 h" → { obrigatorias: 2130, ... }. */
function lerTotais(texto, rotulo) {
  const inicio = texto.search(new RegExp(`\\b${rotulo}\\b`))

  if (inicio < 0) return null

  const numeros = [...texto.slice(inicio).matchAll(/(\d+)\s*h\b/g)]
    .slice(0, 4)
    .map((achado) => Number(achado[1]))

  if (numeros.length < 4) return null
  if (numeros[0] + numeros[1] + numeros[2] !== numeros[3]) return null

  return Object.fromEntries(TOTAIS.map((nome, i) => [nome, numeros[i]]))
}

/**
 * Lê o histórico do SIGAA (UnB) de qualquer curso e devolve só o que o app
 * usa — nada de nome, matrícula, documentos ou notas:
 * - `curso`: o nome do curso, como "CIÊNCIAS CONTÁBEIS";
 * - `exigido` e `integralizado`: horas de obrigatórias, optativas,
 *   complementares e total;
 * - `cursadas`: disciplinas aprovadas, dispensadas ou cumpridas;
 * - `pendentes`: obrigatórias que ainda faltam, com a carga horária.
 * Devolve `null` se o texto não parece um histórico.
 */
export function lerHistoricoGeral(texto) {
  const conteudo = limparTexto(texto)

  const linhaDoCurso = conteudo.match(/Curso:\s*([^\n]+)/)
  const curso = linhaDoCurso
    ? linhaDoCurso[1]
        .split('/')[0]
        .split(/\s+-\s+/)[0]
        .trim()
    : ''

  const inicioDosTotais = conteudo.search(/Carga Horária Integralizada/i)
  const totais = inicioDosTotais < 0 ? '' : conteudo.slice(inicioDosTotais)
  const exigido = lerTotais(totais, 'Exigido')
  const integralizado = exigido
    ? lerTotais(totais.slice(totais.search(/\bExigido\b/)), 'Integralizado')
    : null

  // Obrigatórias pendentes: "CCA0077 CONTABILIDADE GERAL 2 60 h", com o
  // código e o nome na mesma linha ou em linhas seguidas.
  const inicioDasPendentes = conteudo.search(/Obrigatórios\s+Pendentes/i)
  let trecho = inicioDasPendentes < 0 ? '' : conteudo.slice(inicioDasPendentes)
  const fimDasPendentes = trecho.search(/Equivalências|Atenção, agora/)

  if (fimDasPendentes > 0) trecho = trecho.slice(0, fimDasPendentes)

  const pendentes = []
  const vistos = new Set()

  for (const [, codigo, nome, ch] of trecho.matchAll(
    /\b([A-Z]{3}\d{4})\s+([^\n]+?)\s+(\d+)\s*h\b/g,
  )) {
    if (vistos.has(codigo)) continue
    vistos.add(codigo)
    pendentes.push({ codigo, nome: limparNome(nome), ch: Number(ch) })
  }

  // Cursadas, com o nome quando ele vem na mesma linha do código, e o tipo
  // pela marca que o SIGAA põe antes do código (* optativa, # eletiva...).
  const { aprovados } = aprovadosDe(conteudo)
  const nomes = new Map()
  const tipos = new Map()

  for (const [, marca, codigo, resto] of tabelaDeCursadas(conteudo).matchAll(
    /(?:([*&#@§%])[ \t]*)?\b([A-Z]{3}\d{4})[ \t]+([^\n]*)/g,
  )) {
    const nome = limparNome(resto)

    if (!nomes.has(codigo) && /[A-ZÀ-Ú]{2}/.test(nome)) nomes.set(codigo, nome)
    if (!tipos.has(codigo))
      tipos.set(codigo, TIPO_PELA_MARCA[marca] ?? 'obrigatoria')
  }

  const cursadas = [...aprovados].sort().map((codigo) => ({
    codigo,
    nome: nomes.get(codigo) ?? '',
    tipo: tipos.get(codigo) ?? 'obrigatoria',
  }))

  if (!curso && !exigido && pendentes.length === 0) return null
  if (!exigido && pendentes.length === 0 && cursadas.length === 0) return null

  return {
    curso,
    exigido,
    integralizado: exigido ? integralizado : null,
    cursadas,
    pendentes,
  }
}
