import { CODIGOS_ANTIGOS } from '../../config/curso'
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
 *   eletivas...), para a tela avisar.
 *
 * Cada linha da tabela tem um código e uma situação. Dependendo de onde o PDF
 * é copiado, as colunas vêm lado a lado ou uma depois da outra, mas sempre na
 * mesma ordem: por isso o n-ésimo código combina com a n-ésima situação.
 * Nada além dos códigos e das situações é usado.
 */
export function lerHistorico(texto) {
  const doFluxograma = new Set(DISCIPLINAS.map((item) => item.id))
  const conteudo = String(texto ?? '')
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

  const cursadas = new Set()
  const fora = []

  for (const codigo of aprovados) {
    const novo = CODIGOS_ANTIGOS[codigo] ?? codigo

    if (doFluxograma.has(novo)) cursadas.add(novo)
    else if (!usadosEmEquivalencia.has(codigo)) fora.push(codigo)
  }

  return { cursadas: [...cursadas], fora: fora.sort() }
}
