import casa from '../../assets/gatinhos/casinha.png'
import telhado from '../../assets/gatinhos/casinha-telhado.png'

/**
 * Casinha do gatinho no menu: o desenho em pixel art do dono do projeto (ver
 * CREDITOS.md). O telhado vem em tons de cinza e é pintado com a cor do tema
 * (multiplicar mantém as tábuas claras e escuras). `frente` desenha só a
 * fachada, por cima do gatinho quando ele entra pela porta.
 */
export default function Casinha({ frente = false, style }) {
  // `frente`: só o lado esquerdo da porta (parede e telhado), por cima do
  // gatinho quando ele entra andando da direita para a esquerda
  return (
    <span
      className={`casinha${frente ? ' casinha-frente' : ''}`}
      aria-hidden="true"
      style={style}
    >
      <img src={casa} alt="" width="80" height="64" />
      <span
        className="casinha-telhado"
        style={{
          WebkitMaskImage: `url(${telhado})`,
          maskImage: `url(${telhado})`,
        }}
      />
    </span>
  )
}
