import PixelArte from './PixelArte'
import './BarraFelicidade.css'

/*
 * Barrinha de felicidade do gatinho, embaixo da casinha: um coração em pixel
 * art e dez gominhos. Passar o mouse mostra o porquê (atrasos, faltas, tudo
 * em dia).
 */

const CORACAO = [
  '.kk.kk.',
  'khhkhhk',
  'khwhhhk',
  'khhhhhk',
  '.khhhk.',
  '..khk..',
  '...k...',
]

const CORES = {
  k: 'felicidade-contorno',
  h: 'felicidade-coracao',
  w: 'felicidade-brilho',
}

const ROTULOS = {
  radiante: 'radiante',
  feliz: 'feliz',
  chateado: 'chateado',
  triste: 'tristinho',
}

const GOMOS = 10

export default function BarraFelicidade({ felicidade }) {
  const { pontos, nivel, motivos } = felicidade
  const cheios = Math.round((pontos / 100) * GOMOS)
  const porque = motivos.length ? ` (${motivos.join(', ')})` : ''
  const texto = `Gatinho ${ROTULOS[nivel]}: ${pontos}% de felicidade${porque}`

  return (
    <div
      className={`felicidade felicidade-${nivel}`}
      role="meter"
      aria-label="Felicidade do gatinho"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pontos}
      aria-valuetext={texto}
      title={texto}
    >
      <PixelArte desenho={CORACAO} cores={CORES} className="felicidade-icone" />
      <span className="felicidade-trilho">
        {Array.from({ length: GOMOS }, (_, indice) => (
          <span
            key={indice}
            className={`felicidade-gomo${indice < cheios ? ' cheio' : ''}`}
          />
        ))}
      </span>
    </div>
  )
}
