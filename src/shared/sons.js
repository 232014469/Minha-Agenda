/**
 * Sons do mascote: miados gravados e o uivo do lobinho, sintetizado na hora
 * pelo navegador. Só tocam depois de uma ação de quem usa o app.
 */
let contexto = null

function audio() {
  const Contexto = globalThis.AudioContext ?? globalThis.webkitAudioContext

  if (!Contexto) return null

  contexto ??= new Contexto()
  if (contexto.state === 'suspended') contexto.resume()

  return contexto
}

/** Liga uma "garganta": serra com vibrato, dois formantes e um envelope. */
function vocalizar({ altura, formante1, formante2, volume, duracao }) {
  const ac = audio()

  if (!ac) return

  const t = ac.currentTime
  const curva = (parametro, pontos) => {
    parametro.setValueAtTime(pontos[0][1], t)
    for (const [tempo, valor] of pontos.slice(1)) {
      parametro.linearRampToValueAtTime(valor, t + tempo)
    }
  }

  const voz = ac.createOscillator()
  voz.type = 'sawtooth'
  curva(voz.frequency, altura)

  const vibrato = ac.createOscillator()
  const vibratoForca = ac.createGain()
  vibrato.frequency.value = 6
  vibratoForca.gain.value = altura[1][1] * 0.015
  vibrato.connect(vibratoForca).connect(voz.frequency)

  const envelope = ac.createGain()
  curva(envelope.gain, volume)

  for (const [pontos, forca, q] of [
    [formante1, 1, 6],
    [formante2, 0.7, 9],
  ]) {
    const filtro = ac.createBiquadFilter()
    const ganho = ac.createGain()

    filtro.type = 'bandpass'
    filtro.Q.value = q
    curva(filtro.frequency, pontos)
    ganho.gain.value = forca
    voz.connect(filtro).connect(ganho).connect(envelope)
  }

  envelope.connect(ac.destination)
  voz.start(t)
  vibrato.start(t)
  voz.stop(t + duracao)
  vibrato.stop(t + duracao)
}

/**
 * Miados gravados de gatos de verdade (Mixkit, ver
 * src/assets/gatinhos/CREDITOS.md): fofo, de fome, pedindo e triste.
 */
const MIADOS = {
  fofo: new URL('../assets/sons/miado-fofo.mp3', import.meta.url).href,
  fome: new URL('../assets/sons/miado-fome.mp3', import.meta.url).href,
  pedindo: new URL('../assets/sons/miado-pedindo.mp3', import.meta.url).href,
  triste: new URL('../assets/sons/miado-triste.mp3', import.meta.url).href,
}

const tocando = new Map()

/**
 * Toca um miado: 'fofo', 'fome', 'pedindo', 'triste' ou 'clique' (sorteia
 * entre o fofo e o de fome). Se o mesmo miado já está tocando, recomeça.
 */
export function miar(tipo = 'clique', { volume = 0.8 } = {}) {
  const nome =
    tipo === 'clique' ? (Math.random() < 0.5 ? 'fofo' : 'fome') : tipo
  const url = MIADOS[nome]

  // Sem áudio (ou nos testes, que rodam no jsdom): segue sem som.
  if (!url || typeof Audio === 'undefined') return
  if (globalThis.navigator?.userAgent?.includes('jsdom')) return

  try {
    const som = tocando.get(nome) ?? new Audio(url)

    tocando.set(nome, som)
    som.volume = volume
    som.currentTime = 0
    som.play()?.catch?.(() => {})
  } catch {
    // Navegador sem áudio: segue sem som.
  }
}

/** Uivo de lobinho: sobe, segura e desce devagar. */
export function uivar({ volume = 0.45 } = {}) {
  vocalizar({
    duracao: 1.5,
    altura: [
      [0, 320],
      [0.35, 560],
      [0.9, 600],
      [1.45, 380],
    ],
    formante1: [
      [0, 380],
      [0.4, 520],
      [1.45, 400],
    ],
    formante2: [
      [0, 800],
      [0.4, 950],
      [1.45, 780],
    ],
    volume: [
      [0, 0],
      [0.15, volume * 0.6],
      [0.4, volume],
      [1.1, volume * 0.8],
      [1.5, 0],
    ],
  })
}
