/**
 * Desenho em pixel art a partir de linhas de texto: cada caractere é um pixel
 * e `cores` diz a classe de cada um ('.' é vazio). Pixels vizinhos da mesma
 * cor numa linha viram um retângulo só.
 */
export default function PixelArte({
  desenho,
  cores,
  escala = 2,
  className = '',
  style,
}) {
  const blocos = []

  desenho.forEach((linha, y) => {
    for (let x = 0; x < linha.length; x += 1) {
      const cor = linha[x]

      if (!cores[cor]) continue

      const ultimo = blocos.at(-1)

      if (
        ultimo &&
        ultimo.y === y &&
        ultimo.cor === cor &&
        ultimo.x + ultimo.largura === x
      ) {
        ultimo.largura += 1
      } else {
        blocos.push({ cor, x, y, largura: 1 })
      }
    }
  })

  const largura = desenho[0].length
  const altura = desenho.length

  return (
    <svg
      className={`pixel-arte ${className}`}
      style={style}
      width={largura * escala}
      height={altura * escala}
      viewBox={`0 0 ${largura} ${altura}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {blocos.map(({ cor, x, y, largura: w }) => (
        <rect
          key={`${x}-${y}`}
          className={cores[cor]}
          x={x}
          y={y}
          width={w}
          height={1}
        />
      ))}
    </svg>
  )
}
