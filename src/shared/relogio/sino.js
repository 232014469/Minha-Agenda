/**
 * Sininho do relógio de estudo: três notas curtas e suaves, feitas na hora
 * (sem arquivo de som). Se o navegador não deixar tocar, fica em silêncio.
 */
export function tocarSino() {
  try {
    const Contexto = window.AudioContext || window.webkitAudioContext

    if (!Contexto) return

    const contexto = new Contexto()
    const notas = [880, 1108.73, 1318.51]

    notas.forEach((frequencia, indice) => {
      const inicio = contexto.currentTime + indice * 0.18
      const oscilador = contexto.createOscillator()
      const volume = contexto.createGain()

      oscilador.type = 'sine'
      oscilador.frequency.value = frequencia
      volume.gain.setValueAtTime(0.0001, inicio)
      volume.gain.exponentialRampToValueAtTime(0.25, inicio + 0.02)
      volume.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.9)
      oscilador.connect(volume).connect(contexto.destination)
      oscilador.start(inicio)
      oscilador.stop(inicio + 1)
    })

    setTimeout(() => contexto.close(), 1800)
  } catch {
    // Sem áudio: só não toca.
  }
}
