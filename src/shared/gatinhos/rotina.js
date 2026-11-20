/**
 * Rotina do gatinho mascote quando ninguém mexe nele: fica parado piscando,
 * senta, deita e levanta, sai andando pela esquerda e volta, ou (no menu do
 * computador) pula da casinha para perto dos links, sobe pela parede e volta
 * para casa. Cada rotina
 * é uma lista de passos; os tempos são sorteados para não ficar repetitivo.
 *
 * Passo: { animacao, fps, ms, vezes?, reverso?, virado?, onde, anda? }
 * - ms: quanto dura; `null` espera até alguém mandar seguir;
 * - onde: 'meio' (o cestinho), 'chao' (no chão, do lado do cestinho),
 *   'fora' (escondido além da borda esquerda; 'fora:N' na altura do link N),
 *   'link:N' (ao lado do link N do menu), 'parede:N' (na parede direita, na
 *   altura do link N) ou 'parede-alto' (na parede, na altura da casinha);
 * - anda: o gatinho vai até `onde` durante o passo; `curva` diz como:
 *   'cai' (pulo para baixo), 'sobe' (pulo para cima) ou reto;
 * - ergue: sobe o desenho alguns px (deitado no cestinho).
 */
const entre = (min, max, sorteio) => Math.round(min + (max - min) * sorteio())

/** Sai do cestinho pulando para o chão, do lado esquerdo dele... */
const SAI_DO_CESTO = {
  animacao: 'jump',
  fps: 10,
  ms: 450,
  virado: true,
  onde: 'chao',
  anda: true,
  curva: 'cai',
}

/** ...anda até sumir pela borda esquerda... */
const ANDA_ATE_A_BORDA = {
  animacao: 'walk',
  fps: 10,
  ms: 2000,
  virado: true,
  onde: 'fora',
  anda: true,
}

/** ...e, na volta, anda até o lado do cestinho e pula para dentro. */
const VOLTA_PRO_CESTO = [
  { animacao: 'walk', fps: 10, ms: 2000, onde: 'chao', anda: true },
  {
    animacao: 'jump',
    fps: 10,
    ms: 450,
    onde: 'meio',
    anda: true,
    curva: 'sobe',
  },
]

export const ROTINAS = {
  parado: (s) => [
    { animacao: 'idle_blink', fps: 7, ms: entre(5000, 8000, s), onde: 'meio' },
  ],
  sentado: (s) => [
    { animacao: 'sit', fps: 6, ms: entre(5000, 9000, s), onde: 'meio' },
  ],
  // Deitado no cestinho: `ergue` sobe o desenho para ele não sumir dentro
  deitar: (s) => [
    {
      animacao: 'crouch',
      fps: 10,
      ms: 800,
      vezes: '1',
      onde: 'meio',
      ergue: 6,
    },
    {
      animacao: 'liedown',
      fps: 6,
      ms: entre(6000, 11000, s),
      onde: 'meio',
      ergue: 9,
    },
    {
      animacao: 'crouch',
      fps: 10,
      ms: 800,
      vezes: '1',
      reverso: true,
      onde: 'meio',
      ergue: 6,
    },
  ],
  passear: (s) => [
    SAI_DO_CESTO,
    ANDA_ATE_A_BORDA,
    { animacao: null, ms: entre(2000, 4500, s), onde: 'fora' },
    ...VOLTA_PRO_CESTO,
  ],
  // Passeio pela borda de baixo da tela: sai pela esquerda e espera fora...
  sair: () => [
    SAI_DO_CESTO,
    ANDA_ATE_A_BORDA,
    { animacao: null, ms: null, onde: 'fora' },
  ],
  // Se o passeio pela tela começa enquanto ele explora o menu (na altura do
  // Dashboard), sai andando por essa altura mesmo, sem flutuar até o cesto.
  sairDoMenu: () => [
    { ...ANDA_ATE_A_BORDA, onde: 'fora:0' },
    { animacao: null, ms: null, onde: 'fora:0' },
  ],
  // ...e, quando o passeio termina, volta andando e pula no cestinho.
  voltar: () => [...VOLTA_PRO_CESTO],
  // Menu do computador: pula do cestinho até o lado do primeiro link
  // (Dashboard), olha em volta, corre até a parede, sobe por ela e pula de
  // volta para casa.
  explorar: (s) => {
    const link = 0

    return [
      {
        animacao: 'jump',
        fps: 9,
        ms: 650,
        onde: `link:${link}`,
        anda: true,
        curva: 'cai',
      },
      { animacao: 'land', fps: 10, ms: 300, vezes: '1', onde: `link:${link}` },
      {
        animacao: 'idle_blink',
        fps: 7,
        ms: entre(1500, 3500, s),
        onde: `link:${link}`,
      },
      {
        animacao: 'run',
        fps: 12,
        ms: 450,
        onde: `parede:${link}`,
        anda: true,
      },
      { animacao: 'wallgrab', fps: 10, ms: 800, onde: `parede:${link}` },
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
        ms: 650,
        virado: true,
        onde: 'meio',
        anda: true,
        curva: 'sobe',
      },
      {
        animacao: 'land',
        fps: 10,
        ms: 300,
        vezes: '1',
        virado: true,
        onde: 'meio',
      },
    ]
  },
}

/** Quanto tempo o mascote leva para sair do menu antes do passeio. */
export const TEMPO_PARA_SAIR = SAI_DO_CESTO.ms + ANDA_ATE_A_BORDA.ms

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
  if (atual !== 'parado') return 'parado'

  const sorteaveis = opcoes.links
    ? [...SORTEAVEIS, ['explorar', 2.5]]
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
