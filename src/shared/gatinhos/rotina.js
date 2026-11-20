/**
 * Rotina do gatinho mascote quando ninguém mexe nele: fica parado piscando,
 * senta, deita e levanta, sai andando pela esquerda e volta, ou (no menu do
 * computador) pula da casinha para perto dos links, sobe pela parede e volta
 * para casa. Cada rotina
 * é uma lista de passos; os tempos são sorteados para não ficar repetitivo.
 *
 * Passo: { animacao, fps, ms, vezes?, reverso?, virado?, onde, anda? }
 * - ms: quanto dura; `null` espera até alguém mandar seguir;
 * - onde: 'meio' (a casinha), 'fora' (escondido além da borda esquerda),
 *   'link:N' (ao lado do link N do menu), 'parede:N' (na parede direita, na
 *   altura do link N) ou 'parede-alto' (na parede, na altura da casinha);
 * - anda: o gatinho vai até `onde` durante o passo; `curva` diz como:
 *   'cai' (pulo para baixo), 'sobe' (pulo para cima) ou reto.
 */
const entre = (min, max, sorteio) => Math.round(min + (max - min) * sorteio())

export const ROTINAS = {
  parado: (s) => [
    { animacao: 'idle_blink', fps: 7, ms: entre(5000, 8000, s), onde: 'meio' },
  ],
  sentado: (s) => [
    { animacao: 'sit', fps: 6, ms: entre(5000, 9000, s), onde: 'meio' },
  ],
  deitar: (s) => [
    { animacao: 'crouch', fps: 10, ms: 800, vezes: '1', onde: 'meio' },
    { animacao: 'liedown', fps: 6, ms: entre(6000, 11000, s), onde: 'meio' },
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
    {
      animacao: 'walk',
      fps: 10,
      ms: 2200,
      virado: true,
      onde: 'fora',
      anda: true,
    },
    { animacao: null, ms: entre(2000, 4500, s), onde: 'fora' },
    { animacao: 'walk', fps: 10, ms: 2400, onde: 'meio', anda: true },
  ],
  // Passeio pela borda de baixo da tela: sai pela esquerda e espera fora...
  sair: () => [
    {
      animacao: 'walk',
      fps: 10,
      ms: 2200,
      virado: true,
      onde: 'fora',
      anda: true,
    },
    { animacao: null, ms: null, onde: 'fora' },
  ],
  // ...e, quando o passeio termina, volta andando até o meio.
  voltar: () => [
    { animacao: 'walk', fps: 10, ms: 2400, onde: 'meio', anda: true },
  ],
  // Menu do computador: pula da casinha para perto de um link, olha em volta,
  // corre até a parede, sobe por ela e pula de volta para casa.
  explorar: (s, { links = 1 } = {}) => {
    const link = Math.min(links - 1, Math.floor(s() * links))

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
        ms: 1200 + link * 450,
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
export const TEMPO_PARA_SAIR = 2200

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

  return iniciarRotina(
    proximaRotina(rotina.nome, sorteio, opcoes),
    sorteio,
    opcoes,
  )
}
