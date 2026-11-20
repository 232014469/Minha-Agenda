import casa from '../../assets/gatinhos/casinha.png'
import telhado from '../../assets/gatinhos/casinha-telhado.png'

/**
 * Casinha do gatinho no menu: o desenho em pixel art do dono do projeto (ver
 * CREDITOS.md). O telhado vem em tons de cinza e é pintado com a cor do tema
 * (multiplicar mantém as tábuas claras e escuras).
 */
export default function Casinha() {
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
