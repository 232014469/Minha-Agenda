/**
 * Sons do mascote: miados gravados. Só tocam depois de uma ação de quem usa
 * o app.
 */

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
