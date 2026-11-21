import './Tamagotchi.css'

/*
 * Bichinho virtual em formato de ovo em volta do cantinho do gatinho: casca
 * brilhante na cor do tema, placa decorada (corações e brilhos de dia,
 * estrelas à noite, arco-íris e nuvens) em volta da tela e três botões de
 * gelatina embaixo. A tela (`children`) fica no meio da placa.
 */

const CORACAO = 'M5 9.5 1.2 5.6A2.4 2.4 0 0 1 5 2.4a2.4 2.4 0 0 1 3.8 3.2Z'
const BRILHO = 'M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4Z'
const ESTRELA =
  'M5 0 6.2 3.4 9.8 3.5 7 5.7 8 9.2 5 7.2 2 9.2 3 5.7.2 3.5 3.8 3.4Z'

/** Enfeites espalhados: [desenho, x, y, tamanho, giro, classe]. */
const ENFEITES = [
  ['coracao', 22, 34, 1.9, -14, 'branco'],
  ['brilho', 46, 16, 1.2, 0, 'amarelo'],
  ['coracao', 70, 8, 1.3, 10, 'claro'],
  ['brilho', 101, 4, 1, 0, 'branco'],
  ['coracao', 126, 8, 1.4, -8, 'branco'],
  ['brilho', 154, 16, 1.3, 0, 'branco'],
  ['coracao', 170, 34, 1.9, 16, 'claro'],
  ['brilho', 6, 80, 1.2, 0, 'branco'],
  ['coracao', 192, 78, 1.4, -10, 'branco'],
  ['brilho', 194, 164, 1.1, 0, 'amarelo'],
  ['coracao', 6, 160, 1.5, 8, 'claro'],
  ['brilho', 14, 192, 0.9, 0, 'branco'],
  ['coracao', 186, 188, 1.2, -12, 'branco'],
]

function Enfeite({ tipo, x, y, tamanho, giro, classe }) {
  const transform = `translate(${x} ${y}) rotate(${giro} 5 5) scale(${tamanho})`

  if (tipo === 'brilho') {
    return (
      <path
        className={`tama-enfeite tama-${classe}`}
        d={BRILHO}
        transform={transform}
      />
    )
  }

  return (
    <g transform={transform}>
      <path className={`tama-enfeite tama-dia tama-${classe}`} d={CORACAO} />
      <path className={`tama-enfeite tama-noite tama-${classe}`} d={ESTRELA} />
    </g>
  )
}

function ArcoIris({ x, y, espelhado }) {
  return (
    <g
      className="tama-arco"
      transform={`translate(${x} ${y})${espelhado ? ' scale(-1 1)' : ''}`}
    >
      <path className="tama-arco-1" d="M0 16a16 16 0 0 1 16-16" />
      <path className="tama-arco-2" d="M3 16A13 13 0 0 1 16 3" />
      <path className="tama-arco-3" d="M6 16A10 10 0 0 1 16 6" />
      <circle className="tama-nuvenzinha" cx="2" cy="16" r="4" />
      <circle className="tama-nuvenzinha" cx="7" cy="17" r="3" />
    </g>
  )
}

export default function Tamagotchi({ children }) {
  return (
    <div className="tamagotchi">
      <div className="tamagotchi-placa">
        <svg
          className="tamagotchi-enfeites"
          viewBox="0 0 212 262"
          aria-hidden="true"
          focusable="false"
        >
          {ENFEITES.map(([tipo, x, y, tamanho, giro, classe]) => (
            <Enfeite
              key={`${x}-${y}`}
              tipo={tipo}
              x={x}
              y={y}
              tamanho={tamanho}
              giro={giro}
              classe={classe}
            />
          ))}
          <ArcoIris x={1} y={114} />
          <ArcoIris x={211} y={122} espelhado />
        </svg>
        {children}
        <span className="tamagotchi-nuvens" aria-hidden="true" />
        <div className="tamagotchi-botoes" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
