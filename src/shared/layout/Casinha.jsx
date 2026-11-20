/**
 * Cestinho do gatinho no menu, em pixel art (cada caractere é um pixel): cesto
 * de vime trançado na cor do tema, com uma mantinha dobrada. Desenho próprio.
 * `frente` desenha só a parte da frente do cesto, que fica por cima do
 * gatinho quando ele está deitado ou sentado dentro.
 *
 * o contorno · w/W trama do cesto (clara e escura) · r manta · t dobra da
 * manta · . vazio
 */
const DESENHO = [
  '....oooooooooooooooooo....',
  '...ottttttrrrrrrrrrrrro...',
  '.ooottttttrrrrrrrrrrrrooo.',
  'oWWWrrrrrrrrrrrrrrrrrrWWWo',
  '.owWwwWwwWwwWwwWwwWwwWwwo.',
  '.oWwwWwwWwwWwwWwwWwwWwwWo.',
  '.owwWwwWwwWwwWwwWwwWwwWwo.',
  '.owWwwWwwWwwWwwWwwWwwWwwo.',
  '.oWwwWwwWwwWwwWwwWwwWwwWo.',
  '..oooooooooooooooooooooo..',
]

/** A partir desta linha é a frente do cesto (por cima do gatinho). */
const FRENTE = 4

const CLASSES = {
  o: 'cestinho-contorno',
  w: 'cestinho-trama',
  W: 'cestinho-trama-escura',
  r: 'cestinho-manta',
  t: 'cestinho-dobra',
}

/** Junta pixels vizinhos da mesma cor numa linha em um só retângulo. */
const PIXELS = DESENHO.flatMap((linha, y) => {
  const blocos = []

  for (let x = 0; x < linha.length; x += 1) {
    const cor = linha[x]

    if (!CLASSES[cor]) continue

    const ultimo = blocos.at(-1)

    if (ultimo && ultimo.cor === cor && ultimo.x + ultimo.largura === x) {
      ultimo.largura += 1
    } else {
      blocos.push({ cor, x, y, largura: 1 })
    }
  }

  return blocos
})

export default function Casinha({ frente = false, className = '', style }) {
  const pixels = frente ? PIXELS.filter((pixel) => pixel.y >= FRENTE) : PIXELS

  return (
    <svg
      className={`cestinho ${className}`}
      style={style}
      viewBox={`0 0 ${DESENHO[0].length} ${DESENHO.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {pixels.map(({ cor, x, y, largura }) => (
        <rect
          key={`${x}-${y}`}
          className={CLASSES[cor]}
          x={x}
          y={y}
          width={largura}
          height={1}
        />
      ))}
    </svg>
  )
}
