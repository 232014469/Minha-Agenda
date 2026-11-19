import { QUADROS, urlDoSprite } from './gatos'
import './Gatinhos.css'

/**
 * Um gatinho animado quadro a quadro, a partir da tira do sprite, com os
 * pixels nítidos (`escala` vezes o tamanho original de 32 px).
 */
export default function Sprite({
  gato,
  animacao,
  fps = 8,
  escala = 3,
  vezes = 'infinite',
  className = '',
  aoTerminar,
}) {
  const quadros = QUADROS[animacao]
  const lado = 32 * escala

  return (
    <span
      className={`sprite ${className}`.trim()}
      aria-hidden="true"
      onAnimationEnd={aoTerminar}
      style={{
        width: lado,
        height: lado,
        backgroundImage: `url(${urlDoSprite(gato, animacao)})`,
        backgroundSize: `${quadros * lado}px ${lado}px`,
        '--sprite-fim': `${-quadros * lado}px`,
        animation: `sprite-quadros ${quadros / fps}s steps(${quadros}) ${vezes}`,
      }}
    />
  )
}
