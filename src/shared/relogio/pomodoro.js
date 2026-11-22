import { APP } from '../../config/app'

/**
 * Relógio de estudo (pomodoro): 25 min de foco, 5 de pausa e, a cada 4
 * focos, uma pausa longa de 15. O tempo é guardado como o momento em que a
 * etapa acaba (`fimEm`), então continua certo mesmo trocando de tela ou
 * recarregando a página. Os focos feitos voltam a zero a cada dia.
 */
export const MINUTO = 60 * 1000

export const ETAPAS = {
  foco: { nome: 'Foco', duracao: 25 * MINUTO },
  pausa: { nome: 'Pausa', duracao: 5 * MINUTO },
  pausaLonga: { nome: 'Pausa longa', duracao: 15 * MINUTO },
}

export const FOCOS_ATE_PAUSA_LONGA = 4

export const CHAVE_RELOGIO = `${APP.chaveDosDados}.relogio`

export function diaDe(quando) {
  const data = new Date(quando)

  return `${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate()}`
}

export function novoRelogio(agora = Date.now()) {
  return {
    etapa: 'foco',
    rodando: false,
    fimEm: null,
    restante: ETAPAS.foco.duracao,
    feitos: 0,
    dia: diaDe(agora),
  }
}

/** Quanto falta da etapa atual, em milissegundos. */
export function restanteDe(relogio, agora) {
  if (!relogio.rodando) return relogio.restante

  return Math.max(0, relogio.fimEm - agora)
}

export function iniciar(relogio, agora) {
  if (relogio.rodando) return relogio

  return { ...relogio, rodando: true, fimEm: agora + relogio.restante }
}

export function pausar(relogio, agora) {
  if (!relogio.rodando) return relogio

  return {
    ...relogio,
    rodando: false,
    fimEm: null,
    restante: restanteDe(relogio, agora),
  }
}

/** Volta a etapa atual para o começo, parada. */
export function reiniciar(relogio) {
  return {
    ...relogio,
    rodando: false,
    fimEm: null,
    restante: ETAPAS[relogio.etapa].duracao,
  }
}

/**
 * Passa para a próxima etapa, parada. `concluiu` diz se a etapa terminou de
 * verdade (só um foco terminado conta como feito; pular não conta).
 */
export function proximaEtapa(relogio, { concluiu = false } = {}) {
  let { feitos } = relogio
  let etapa = 'foco'

  if (relogio.etapa === 'foco') {
    if (concluiu) feitos += 1
    etapa =
      concluiu && feitos % FOCOS_ATE_PAUSA_LONGA === 0 ? 'pausaLonga' : 'pausa'
  }

  return {
    ...relogio,
    etapa,
    feitos,
    rodando: false,
    fimEm: null,
    restante: ETAPAS[etapa].duracao,
  }
}

/** Ajusta o relógio para agora: novo dia zera os focos; etapa vencida avança. */
export function atualizar(relogio, agora) {
  let atual = relogio

  if (atual.dia !== diaDe(agora)) {
    atual = { ...atual, feitos: 0, dia: diaDe(agora) }
  }

  if (atual.rodando && restanteDe(atual, agora) === 0) {
    atual = proximaEtapa(atual, { concluiu: true })
  }

  return atual
}

/** "mm:ss" (arredondando para cima, para não mostrar 00:00 antes da hora). */
export function formatar(milissegundos) {
  const total = Math.ceil(milissegundos / 1000)
  const minutos = Math.floor(total / 60)
  const segundos = total % 60

  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
}

export function lerRelogio(agora = Date.now()) {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_RELOGIO) ?? 'null')

    if (salvo && ETAPAS[salvo.etapa]) return atualizar(salvo, agora)
  } catch {
    // Guardado com defeito: começa do zero.
  }

  return novoRelogio(agora)
}

export function salvarRelogio(relogio) {
  try {
    localStorage.setItem(CHAVE_RELOGIO, JSON.stringify(relogio))
  } catch {
    // Sem armazenamento: vale só até fechar a página.
  }
}
