/**
 * Rotina do gatinho mascote quando ninguém mexe nele: fica parado piscando,
 * senta, deita e levanta, ou sai andando pela esquerda e volta. Cada rotina
 * é uma lista de passos; os tempos são sorteados para não ficar repetitivo.
 *
 * Passo: { animacao, fps, ms, vezes?, reverso?, virado?, onde, anda? }
 * - ms: quanto dura; `null` espera até alguém mandar seguir;
 * - onde: 'meio' ou 'fora' (escondido além da borda esquerda);
 * - anda: o gatinho caminha até `onde` durante o passo.
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
}

/** Quanto tempo o mascote leva para sair do menu antes do passeio. */
export const TEMPO_PARA_SAIR = 2200

const SORTEAVEIS = [
  ['sentado', 2],
  ['deitar', 2],
  ['passear', 1.5],
]

/** Depois de qualquer coisa, volta a ficar parado; parado, sorteia a próxima. */
export function proximaRotina(atual, sorteio = Math.random) {
  if (atual !== 'parado') return 'parado'

  const total = SORTEAVEIS.reduce((soma, [, peso]) => soma + peso, 0)
  let alvo = sorteio() * total

  for (const [nome, peso] of SORTEAVEIS) {
    alvo -= peso
    if (alvo < 0) return nome
  }

  return SORTEAVEIS[0][0]
}

export function iniciarRotina(nome, sorteio = Math.random) {
  return { nome, passos: ROTINAS[nome](sorteio), indice: 0, vez: Date.now() }
}

/** Avança um passo; no fim da rotina, começa a próxima. */
export function avancar(rotina, sorteio = Math.random) {
  if (rotina.indice + 1 < rotina.passos.length) {
    return { ...rotina, indice: rotina.indice + 1 }
  }

  return iniciarRotina(proximaRotina(rotina.nome, sorteio), sorteio)
}
