import casa from '../../assets/gatinhos/casinha.png'
import telhado from '../../assets/gatinhos/casinha-telhado.png'

/**
 * Casinha do gatinho no menu: o desenho em pixel art do dono do projeto (ver
 * CREDITOS.md). O telhado vem em tons de cinza e é pintado com a cor do tema
 * (multiplicar mantém as tábuas claras e escuras). `frente` desenha só a
 * fachada, por cima do gatinho quando ele entra pela porta.
 */
export default function Casinha({ frente = false, style }) {
  if (frente) {
    // Só a parede à esquerda da porta (abaixo do telhado): o gatinho entra
    // andando da direita para a esquerda e some atrás dela
    return (
      <img
        className="casinha-frente"
        src={casa}
        alt=""
        aria-hidden="true"
        width="100"
        height="80"
        style={style}
      />
    )
  }

  return (
    <span className="casinha" aria-hidden="true">
      <img src={casa} alt="" width="100" height="80" />
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
