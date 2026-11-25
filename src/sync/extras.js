import { APP } from '../config/app'

/**
 * "Extras": o que fica guardado à parte dos dados (matérias e tarefas), mas
 * que também deve ser igual em todos os aparelhos sincronizados: o lembrete,
 * o tema, o modo claro/escuro, as preferências das Configurações, o
 * bichinho virtual e o plano de formatura.
 *
 * Cada extra viaja como o texto guardado no navegador (`valor`) e o momento
 * em que mudou aqui (`em`). Ao juntar dois aparelhos, vale o que mudou por
 * último. Quem escreve um extra avisa com `marcarExtra` (só quando o valor
 * muda de verdade); quem mostra um extra escuta EVENTO_EXTRAS_RECEBIDOS para
 * reler quando chega uma versão de outro aparelho.
 */
export const ITENS_EXTRAS = {
  lembrete: `${APP.chaveDosDados}.lembrete`,
  tema: `${APP.chaveDosDados}.tema`,
  modo: `${APP.chaveDosDados}.modo`,
  preferencias: `${APP.chaveDosDados}.preferencias`,
  bichinho: 'wolf-study.bichinho',
  plano: `${APP.chaveDosDados}.plano`,
}

/** Mudou um extra neste aparelho (a sincronização envia logo depois). */
export const EVENTO_EXTRAS = 'wolf-study:extras'

/** Chegou de outro aparelho uma versão mais nova de algum extra. */
export const EVENTO_EXTRAS_RECEBIDOS = 'wolf-study:extras-recebidos'

const MOMENTOS = `${APP.chaveDosDados}.extras-em`
const TAMANHO_MAXIMO = 50_000

function lerMomentos() {
  try {
    const salvos = JSON.parse(localStorage.getItem(MOMENTOS) ?? '{}')

    return salvos && typeof salvos === 'object' ? salvos : {}
  } catch {
    return {}
  }
}

function salvarMomentos(momentos) {
  try {
    localStorage.setItem(MOMENTOS, JSON.stringify(momentos))
  } catch {
    // Sem armazenamento: a sincronização dos extras vale só até fechar.
  }
}

function avisar(evento, detalhe) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(evento, { detail: detalhe }))
}

/** Anota que o extra `nome` mudou agora, neste aparelho. */
export function marcarExtra(nome, agora = Date.now()) {
  if (!(nome in ITENS_EXTRAS)) return

  salvarMomentos({ ...lerMomentos(), [nome]: agora })
  avisar(EVENTO_EXTRAS, [nome])
}

/**
 * Os extras deste aparelho, para irem junto na sincronização. Um extra que
 * existe mas nunca foi marcado (guardado antes da sincronização dos extras)
 * vai com `em: 1`: perde para qualquer mudança de verdade, mas chega aos
 * aparelhos que ainda não têm nada.
 */
export function lerExtras() {
  const momentos = lerMomentos()
  const extras = {}

  for (const [nome, chave] of Object.entries(ITENS_EXTRAS)) {
    let valor

    try {
      valor = localStorage.getItem(chave)
    } catch {
      valor = null
    }

    if (valor !== null) extras[nome] = { valor, em: momentos[nome] ?? 1 }
  }

  return extras
}

/** Só os extras conhecidos e bem formados (o que vem do cofre). */
export function validarExtras(extras) {
  if (!extras || typeof extras !== 'object') return {}

  const certos = {}

  for (const nome of Object.keys(ITENS_EXTRAS)) {
    const item = extras[nome]

    if (
      item &&
      typeof item.valor === 'string' &&
      item.valor.length <= TAMANHO_MAXIMO &&
      Number.isFinite(item.em)
    ) {
      certos[nome] = { valor: item.valor, em: item.em }
    }
  }

  return certos
}

/** Junta os extras de dois aparelhos: vale o mais recente (empate: o daqui). */
export function mesclarExtras(daqui = {}, deLa = {}) {
  const juntos = { ...daqui }

  for (const [nome, item] of Object.entries(deLa)) {
    if (!juntos[nome] || item.em > juntos[nome].em) juntos[nome] = item
  }

  return juntos
}

/**
 * Guarda neste aparelho os extras que chegaram mais novos e avisa quem os
 * mostra. Devolve os nomes dos que mudaram.
 */
export function aplicarExtras(extras) {
  const momentos = lerMomentos()
  const mudaram = []

  for (const [nome, item] of Object.entries(validarExtras(extras))) {
    if (item.em <= (momentos[nome] ?? 0)) continue

    momentos[nome] = item.em

    try {
      if (localStorage.getItem(ITENS_EXTRAS[nome]) !== item.valor) {
        localStorage.setItem(ITENS_EXTRAS[nome], item.valor)
        mudaram.push(nome)
      }
    } catch {
      // Sem armazenamento: fica como está.
    }
  }

  salvarMomentos(momentos)
  if (mudaram.length) avisar(EVENTO_EXTRAS_RECEBIDOS, mudaram)

  return mudaram
}

/** Os dados com os extras deste aparelho junto (se houver algum). */
export function comExtras(dados) {
  const extras = lerExtras()

  return Object.keys(extras).length ? { ...dados, extras } : dados
}
