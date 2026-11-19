/**
 * Sons do mascote, sintetizados na hora pelo navegador (sem arquivo de
 * áudio): um miado ("m-i-a-u") e um uivo. Só tocam depois de um clique.
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

/** Miado curto; cada um sai um pouco diferente. */
export function miar({ volume = 0.5 } = {}) {
  const v = 0.9 + Math.random() * 0.2
  const hz = (valor) => valor * v

  vocalizar({
    duracao: 0.75,
    altura: [
      [0, hz(500)],
      [0.08, hz(640)],
      [0.24, hz(820)],
      [0.45, hz(700)],
      [0.72, hz(430)],
    ],
    formante1: [
      [0, 300],
      [0.08, 360],
      [0.3, 820],
      [0.5, 700],
      [0.72, 420],
    ],
    formante2: [
      [0, 1100],
      [0.08, 2300],
      [0.3, 1400],
      [0.5, 1100],
      [0.72, 850],
    ],
    volume: [
      [0, 0],
      [0.03, volume * 0.35],
      [0.09, volume],
      [0.5, volume * 0.85],
      [0.74, 0],
    ],
  })
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
