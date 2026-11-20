/**
 * Rotina do gatinho mascote quando ninguém mexe nele: fica parado piscando,
 * senta, deita e levanta, sai andando pela esquerda e volta, ou (no menu do
 * computador) vai até a parede do lado da casinha, sobe por ela e pula de
 * volta para casa, ou vai comer nos potinhos. Cada rotina é uma lista de
 * passos; os tempos são sorteados para não ficar repetitivo.
 *
 * Passo: { animacao, fps, ms, vezes?, reverso?, virado?, onde, anda? }
 * - ms: quanto dura; `null` espera até alguém mandar seguir;
 * - onde: 'meio' (a porta da casinha), 'frente-porta' (do lado direito da
 *   porta), 'dentro' (atrás da parede), 'pote' (nos potinhos), 'fora'
 *   (escondido além da borda esquerda), 'parede' (na parede direita do menu,
 *   na altura da casinha) ou 'parede-alto' (mais acima na mesma parede);
 * - anda: o gatinho vai até `onde` durante o passo; `curva` diz como:
 *   'cai' (pulo para baixo), 'sobe' (pulo para cima) ou reto.
 */
const entre = (min, max, sorteio) => Math.round(min + (max - min) * sorteio())

/** Sai andando da porta até sumir pela borda esquerda... */
const ANDA_ATE_A_BORDA = {
  animacao: 'walk',
  fps: 10,
  ms: 2000,
  virado: true,
  onde: 'fora',
  anda: true,
}

/** ...e, na volta, anda de lá até a porta da casinha. */
const VOLTA_PRA_CASA = {
  animacao: 'walk',
  fps: 10,
  ms: 2000,
  onde: 'meio',
  anda: true,
}

export const ROTINAS = {
  parado: (s) => [
    { animacao: 'idle_blink', fps: 7, ms: entre(5000, 8000, s), onde: 'meio' },
  ],
  sentado: (s) => [
    { animacao: 'sit', fps: 6, ms: entre(5000, 9000, s), onde: 'meio' },
  ],
  deitar: (s) => [
    {
      animacao: 'crouch',
      fps: 10,
      ms: 800,
      vezes: '1',
      onde: 'meio',
    },
    {
      animacao: 'liedown',
      fps: 6,
      ms: entre(6000, 11000, s),
      onde: 'meio',
    },
    {
      animacao: 'crouch',
      fps: 10,
      ms: 800,
      vezes: '1',
      reverso: true,
      onde: 'meio',
    },
  ],
  passear: (s) => [
    ANDA_ATE_A_BORDA,
    { animacao: null, ms: entre(2000, 4500, s), onde: 'fora' },
    VOLTA_PRA_CASA,
  ],
  // Passeio pela borda de baixo da tela: sai pela esquerda e espera fora...
  sair: () => [ANDA_ATE_A_BORDA, { animacao: null, ms: null, onde: 'fora' }],
  // ...e, quando o passeio termina, volta andando e pula para a porta da casinha.
  voltar: () => [VOLTA_PRA_CASA],
  // Dia de chuva: anda até a porta e some lá dentro, dormindo...
  dormir: () => [
    // vai para o lado direito da porta...
    { animacao: 'walk', fps: 8, ms: 500, onde: 'frente-porta', anda: true },
    // ...e entra andando para a esquerda: o corpo some atrás da parede do
    // lado esquerdo da porta (que fica por cima dele enquanto `atras`)
    {
      animacao: 'walk',
      fps: 8,
      ms: 900,
      virado: true,
      onde: 'dentro',
      anda: true,
      atras: true,
    },
    { animacao: null, ms: 4000, onde: 'dentro', dorme: true, atras: true },
  ],
  // ...e continua dormindo enquanto chover...
  dormindo: () => [
    { animacao: null, ms: 4000, onde: 'dentro', dorme: true, atras: true },
  ],
  // ...até a chuva passar: sai pela porta e volta ao seu lugar.
  acordar: () => [
    // sai da parede andando para a direita, até o lado da porta...
    {
      animacao: 'walk',
      fps: 8,
      ms: 900,
      onde: 'frente-porta',
      anda: true,
      atras: true,
    },
    // ...e volta para a frente da porta
    {
      animacao: 'walk',
      fps: 8,
      ms: 500,
      virado: true,
      onde: 'meio',
      anda: true,
    },
  ],
  // Menu do computador: vai até os potinhos do quintal, come e volta
  comer: (s) => [
    {
      animacao: 'walk',
      fps: 10,
      ms: 1300,
      virado: true,
      onde: 'pote',
      anda: true,
    },
    {
      animacao: 'crouch',
      fps: 6,
      ms: entre(3000, 5000, s),
      virado: true,
      onde: 'pote',
    },
    { animacao: 'walk', fps: 10, ms: 1300, onde: 'meio', anda: true },
  ],
  // Menu do computador: corre até a parede do lado da casinha, se agarra,
  // sobe um pouco e pula de volta para casa.
  explorar: () => [
    { animacao: 'run', fps: 12, ms: 700, onde: 'parede', anda: true },
    { animacao: 'wallgrab', fps: 10, ms: 800, onde: 'parede' },
    {
      animacao: 'wallclimb',
      fps: 8,
      ms: 1200,
      onde: 'parede-alto',
      anda: true,
    },
    {
      animacao: 'jump',
      fps: 9,
      ms: 700,
      virado: true,
      onde: 'meio',
      anda: true,
      curva: 'cai',
    },
    {
      animacao: 'land',
      fps: 10,
      ms: 300,
      vezes: '1',
      virado: true,
      onde: 'meio',
    },
  ],
}

/** Quanto tempo o mascote leva para sair do menu antes do passeio. */
export const TEMPO_PARA_SAIR = ANDA_ATE_A_BORDA.ms

const SORTEAVEIS = [
  ['sentado', 2],
  ['deitar', 2],
  ['passear', 1.5],
]

/**
 * Depois de qualquer coisa, volta a ficar parado; parado, sorteia a próxima.
 * Explorar o menu só entra no sorteio quando há menu (`opcoes.links`).
 */
export function proximaRotina(atual, sorteio = Math.random, opcoes = {}) {
  const dormindo = atual === 'dormir' || atual === 'dormindo'

  // Chovendo (só no menu, onde há casinha): entra e dorme até a chuva passar
  if (opcoes.chuva) return dormindo ? 'dormindo' : 'dormir'
  if (dormindo) return 'acordar'
  if (atual !== 'parado') return 'parado'

  const sorteaveis = opcoes.links
    ? [...SORTEAVEIS, ['explorar', 2.5], ['comer', 1.5]]
    : SORTEAVEIS
  const total = sorteaveis.reduce((soma, [, peso]) => soma + peso, 0)
  let alvo = sorteio() * total

  for (const [nome, peso] of sorteaveis) {
    alvo -= peso
    if (alvo < 0) return nome
  }

  return SORTEAVEIS[0][0]
}

export function iniciarRotina(nome, sorteio = Math.random, opcoes = {}) {
  return {
    nome,
    passos: ROTINAS[nome](sorteio, opcoes),
    indice: 0,
    vez: Date.now(),
  }
}

/** Avança um passo; no fim da rotina, começa a próxima. */
export function avancar(rotina, sorteio = Math.random, opcoes = {}) {
  if (rotina.indice + 1 < rotina.passos.length) {
    return { ...rotina, indice: rotina.indice + 1 }
  }

  // Uma rotina pedida no meio do caminho começa só quando esta termina
  if (rotina.depois) return iniciarRotina(rotina.depois, sorteio, opcoes)

  return iniciarRotina(
    proximaRotina(rotina.nome, sorteio, opcoes),
    sorteio,
    opcoes,
  )
}
