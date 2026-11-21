/**
 * Ciclo de vida do gatinho no bichinho virtual, como num Tamagotchi: chega
 * numa caixinha (foi abandonado e você adota), é filhote na primeira semana
 * e vira adulto. O adulto fica
 * bonitinho quando foi bem cuidado (felicidade boa na média) e largado
 * quando não. Dias seguidos tristinho deixam ele doente e, se continuar,
 * ele vira estrelinha; aí chega outra caixinha.
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
/** Dias seguidos tristinho até ficar doente e até virar estrelinha. */
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

export function salvarBichinho(bichinho) {
  try {
    localStorage.setItem(CHAVE_BICHINHO, JSON.stringify(bichinho))
  } catch {
    // Sem espaço ou bloqueado: segue só na memória
  }
}

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

/** Dias tristinhos seguidos, do mais recente para trás. */
function diasTristes(dias, agora) {
  const chaves = Object.keys(dias).sort().reverse()
  const ontem = chaveDoDia(agora - DIA)

  // Só conta se o último dia anotado é hoje ou ontem
  if (!chaves.length || chaves[0] < ontem) return 0

  let seguidos = 0

  for (const chave of chaves) {
    if (dias[chave] >= PONTOS_TRISTE) break
    seguidos += 1
  }

  return seguidos
}

/**
 * Como o bichinho está agora: { fase: 'caixa' | 'filhote' | 'adulto' |
 * 'estrelinha', forma (adulto): 'bonitinho' | 'largado', doente, comFome,
 * idade (em dias, a partir de 1) }.
 */
export function situacaoDoBichinho(bichinho, agora = Date.now()) {
  const vida = agora - bichinho.nasceuEm
  const idade = Math.max(1, Math.floor(vida / DIA) + 1)
  const comFome = !bichinho.comeuEm || agora - bichinho.comeuEm > DIA

  if (bichinho.virouEstrelinhaEm) {
    return { fase: 'estrelinha', forma: null, doente: false, comFome, idade }
  }
  if (vida < CAIXA_MS) {
    return { fase: 'caixa', forma: null, doente: false, comFome: false, idade }
  }

  const tristes = diasTristes(bichinho.dias, agora)
  const doente = tristes >= DIAS_PARA_ADOECER
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
 * Anota a felicidade de hoje. Depois de dias demais tristinho, ele vira
 * estrelinha (fica guardado, para não voltar sozinho).
 */
export function anotarDia(bichinho, pontos, agora = Date.now()) {
  const hoje = chaveDoDia(agora)
  const guardados = Object.keys(bichinho.dias)
    .sort()
    .slice(-(DIAS_GUARDADOS - 1))
  const dias = Object.fromEntries(
    guardados.map((chave) => [chave, bichinho.dias[chave]]),
  )

  dias[hoje] = pontos

  const novo = { ...bichinho, dias }

  if (diasTristes(dias, agora) >= DIAS_PARA_ESTRELINHA) {
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
