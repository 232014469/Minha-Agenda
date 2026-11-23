import { marcarExtra } from '../../sync/extras'

/**
 * Ciclo de vida do gatinho no bichinho virtual, como num Tamagotchi: chega
 * numa caixinha (foi abandonado e você adota), é filhote na primeira semana
 * e vira adulto. O adulto fica
 * bonitinho quando foi bem cuidado (felicidade boa na média) e largado
 * quando não. Dias seguidos tristinho (ou sem abrir o site, em período de
 * aula) deixam ele doente e, se continuar, ele vira estrelinha; aí chega
 * outra caixinha.
 *
 * O cuidado do dia vem dos botões: comida (com fome depois de um dia sem
 * comer) e brincadeira.
 */

export const CHAVE_BICHINHO = 'wolf-study.bichinho'

/** Os botões do bichinho avisam o gatinho por este evento (detail: ação). */
export const EVENTO_CUIDADO = 'wolf-study:cuidado'

const MINUTO = 60 * 1000
const HORA = 60 * MINUTO
const DIA = 24 * HORA

/** Quanto tempo a caixinha leva para abrir sozinha. */
export const CAIXA_MS = MINUTO
/** Dias como filhote antes de virar adulto. */
export const DIAS_DE_FILHOTE = 7
/**
 * Dias seguidos tristinho até ficar doente e até virar estrelinha. Dias de
 * aula sem abrir o site contam como tristinhos; nas férias, não.
 */
export const DIAS_PARA_ADOECER = 2
export const DIAS_PARA_ESTRELINHA = 4
/** Abaixo disso o dia conta como tristinho (o mesmo nível da felicidade). */
const PONTOS_TRISTE = 30
/** Média para o adulto ficar bonitinho (o nível feliz da felicidade). */
const MEDIA_BONITINHO = 55
/** Quantos dias de histórico ficam guardados. */
const DIAS_GUARDADOS = 60

/** "2026-11-21", na hora local. */
export function chaveDoDia(quando) {
  const data = new Date(quando)
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')

  return `${data.getFullYear()}-${mes}-${dia}`
}

export function novoBichinho(agora = Date.now(), geracao = 1) {
  // Nasce alimentado: a fome só vem um dia depois
  return { geracao, nasceuEm: agora, comeuEm: agora, brincouEm: null, dias: {} }
}

export function lerBichinho(agora = Date.now()) {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_BICHINHO))

    if (salvo && Number.isFinite(salvo.nasceuEm) && salvo.dias) return salvo
  } catch {
    // Sem nada salvo (ou estragado): começa com uma caixinha nova
  }

  return novoBichinho(agora)
}

/** Guarda o bichinho; se mudou de verdade, ele vai para os outros aparelhos. */
export function salvarBichinho(bichinho) {
  try {
    const texto = JSON.stringify(bichinho)

    if (localStorage.getItem(CHAVE_BICHINHO) === texto) return
    localStorage.setItem(CHAVE_BICHINHO, texto)
    marcarExtra('bichinho')
  } catch {
    // Sem espaço ou bloqueado: segue só na memória
  }
}

/** Bichinho desligado nas Configurações: os dias param de contar. */
export const pausar = (bichinho) => ({ ...bichinho, pausado: true })

/** Religado: a contagem recomeça a partir de agora. */
export const retomar = (bichinho, agora = Date.now()) => ({
  ...bichinho,
  pausado: false,
  retomadoEm: agora,
})

export const alimentar = (bichinho, agora = Date.now()) => ({
  ...bichinho,
  comeuEm: agora,
})

export const brincar = (bichinho, agora = Date.now()) => ({
  ...bichinho,
  brincouEm: agora,
})

/** Abre a caixinha na hora (clique nela). */
export const abrirCaixa = (bichinho, agora = Date.now()) => ({
  ...bichinho,
  nasceuEm: Math.min(bichinho.nasceuEm, agora - CAIXA_MS),
  comeuEm: agora,
})

/** Dias depois do último prazo do semestre até começarem as férias. */
const FOLGA_DEPOIS_DO_SEMESTRE = 7

/**
 * Os períodos de aula, um por semestre: começa quando a primeira matéria
 * dele é cadastrada e acaba uma semana depois do último prazo das tarefas
 * dele. Fora deles são férias. Matérias antigas (sem data de cadastro)
 * contam como cadastradas desde sempre; semestre sem tarefas ainda não tem
 * fim.
 */
export function periodosLetivos({ materias = [], tarefas = [] }) {
  const porSemestre = new Map()

  for (const materia of materias) {
    const lista = porSemestre.get(materia.periodo) ?? []

    porSemestre.set(materia.periodo, [...lista, materia])
  }

  return [...porSemestre.values()].map((lista) => {
    const ids = new Set(lista.map((materia) => materia.id))
    const cadastros = lista.map((materia) =>
      Number.isFinite(materia.criadaEm) ? materia.criadaEm : -Infinity,
    )
    const prazos = tarefas
      .filter((tarefa) => ids.has(tarefa.materiaId))
      .map((tarefa) => new Date(tarefa.prazo).getTime())
      .filter(Number.isFinite)

    return {
      inicio: Math.min(...cadastros),
      fim: prazos.length
        ? Math.max(...prazos) + FOLGA_DEPOIS_DO_SEMESTRE * DIA
        : Infinity,
    }
  })
}

/** Se um instante cai em período de aula (ver periodosLetivos). */
export const ehLetivo = (periodos, quando) =>
  periodos.some(({ inicio, fim }) => quando >= inicio && quando <= fim)

/**
 * Dias tristinhos seguidos: `atual` (terminando agora) e `maior` (a maior
 * sequência no histórico guardado). Dia anotado conta pelo valor; dia sem
 * abrir o site conta como tristinho em período de aula (ele ficou largado)
 * e recomeça a contagem nas férias. Hoje, enquanto não é anotado, e o dia em
 * que ele chegou (ou em que o bichinho foi religado) não contam.
 */
function contarTristes(bichinho, agora, letivo) {
  const { dias, nasceuEm, retomadoEm } = bichinho
  const hoje = chaveDoDia(agora)
  const comeco = Math.max(
    nasceuEm,
    retomadoEm ?? 0,
    agora - DIAS_GUARDADOS * DIA,
  )
  const primeiro = chaveDoDia(comeco)
  let atual = 0
  let maior = 0

  for (let quando = comeco; chaveDoDia(quando) <= hoje; quando += DIA) {
    const chave = chaveDoDia(quando)

    if (chave in dias) {
      atual = dias[chave] < PONTOS_TRISTE ? atual + 1 : 0
    } else if (chave === hoje || chave === primeiro) {
      continue
    } else if (letivo?.(quando)) {
      atual += 1
    } else {
      atual = 0
    }

    maior = Math.max(maior, atual)
  }

  return { atual, maior }
}

/**
 * Como o bichinho está agora: { fase: 'caixa' | 'filhote' | 'adulto' |
 * 'estrelinha', forma (adulto): 'bonitinho' | 'largado', doente, comFome,
 * idade (em dias, a partir de 1) }.
 */
export function situacaoDoBichinho(bichinho, agora = Date.now(), letivo) {
  const vida = agora - bichinho.nasceuEm
  const idade = Math.max(1, Math.floor(vida / DIA) + 1)
  const comFome = !bichinho.comeuEm || agora - bichinho.comeuEm > DIA

  if (bichinho.virouEstrelinhaEm) {
    return { fase: 'estrelinha', forma: null, doente: false, comFome, idade }
  }
  if (vida < CAIXA_MS) {
    return { fase: 'caixa', forma: null, doente: false, comFome: false, idade }
  }

  const doente =
    contarTristes(bichinho, agora, letivo).atual >= DIAS_PARA_ADOECER
  const fase = idade > DIAS_DE_FILHOTE ? 'adulto' : 'filhote'
  const valores = Object.values(bichinho.dias)
  const media = valores.length
    ? valores.reduce((soma, valor) => soma + valor, 0) / valores.length
    : 100
  const forma =
    fase === 'adulto'
      ? media >= MEDIA_BONITINHO
        ? 'bonitinho'
        : 'largado'
      : null

  return { fase, forma, doente, comFome, idade }
}

/**
 * Anota a felicidade de hoje. Depois de dias demais tristinho (contando os
 * dias de aula sem abrir o site), ele vira estrelinha (fica guardado, para
 * não voltar sozinho). `letivo(instante)`: se é período de aula.
 */
export function anotarDia(bichinho, pontos, agora = Date.now(), letivo) {
  const hoje = chaveDoDia(agora)
  const guardados = Object.keys(bichinho.dias)
    .sort()
    .slice(-(DIAS_GUARDADOS - 1))
  const dias = Object.fromEntries(
    guardados.map((chave) => [chave, bichinho.dias[chave]]),
  )

  dias[hoje] = pontos

  const novo = { ...bichinho, dias }

  // Dias sem abrir no meio das aulas também contam: se houve uma sequência
  // tristinha longa demais, ele já virou estrelinha enquanto ninguém via
  if (contarTristes(novo, agora, letivo).maior >= DIAS_PARA_ESTRELINHA) {
    novo.virouEstrelinhaEm = agora
  }

  return novo
}

/**
 * O cuidado do dia na felicidade: com fome tira 5; alimentado soma 3;
 * brincou hoje soma mais 3.
 */
export function cuidadoDoDia(bichinho, agora = Date.now()) {
  const { fase, comFome } = situacaoDoBichinho(bichinho, agora)

  if (fase === 'caixa' || fase === 'estrelinha')
    return { pontos: 0, motivos: [] }

  const motivos = []
  let pontos = comFome ? -5 : 3

  if (comFome) motivos.push('com fome')
  if (
    bichinho.brincouEm &&
    chaveDoDia(bichinho.brincouEm) === chaveDoDia(agora)
  ) {
    pontos += 3
    motivos.push('brincou hoje')
  }

  return { pontos, motivos }
}
