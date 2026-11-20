/**
 * Sons do mascote: miados gravados e os bordões da Wanessa Wolf. Só tocam
 * depois de uma ação de quem usa o app.
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
  // Bordões da Wanessa Wolf (ver CREDITOS.md)
  'pode-nao': new URL('../assets/sons/bordao-pode-nao.mp3', import.meta.url)
    .href,
  'eu-hein': new URL('../assets/sons/bordao-eu-hein.mp3', import.meta.url).href,
  'e-gata': new URL('../assets/sons/bordao-e-gata.mp3', import.meta.url).href,
}

const tocando = new Map()

/**
 * Toca um miado ('fofo', 'fome', 'pedindo', 'triste' ou 'clique', que sorteia
 * entre o fofo e o de fome) ou um bordão ('pode-nao', 'eu-hein', 'e-gata').
 * Se o mesmo som já está tocando, recomeça. Responde (numa promessa) se o
 * som tocou.
 */
export function miar(tipo = 'clique', { volume = 0.8 } = {}) {
  const nome =
    tipo === 'clique' ? (Math.random() < 0.5 ? 'fofo' : 'fome') : tipo
  const url = MIADOS[nome]

  // Sem áudio (ou nos testes, que rodam no jsdom): segue sem som.
  if (!url || typeof Audio === 'undefined') return Promise.resolve(false)
  if (globalThis.navigator?.userAgent?.includes('jsdom')) {
    return Promise.resolve(false)
  }

  try {
    const som = tocando.get(nome) ?? new Audio(url)

    tocando.set(nome, som)
    som.volume = volume
    som.currentTime = 0

    // Diz se tocou: o navegador bloqueia som antes do primeiro clique.
    return Promise.resolve(som.play()).then(
      () => true,
      () => false,
    )
  } catch {
    // Navegador sem áudio: segue sem som.
    return Promise.resolve(false)
  }
}
