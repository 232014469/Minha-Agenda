import PixelArte from './PixelArte'
import './Quintal.css'

/*
 * Quintal da casinha no menu, em pixel art (desenhos próprios, 2px por
 * pixel): grama no tom do tema com florzinhas, dois potinhos (ração e água),
 * uma cerquinha, e bichinhos conforme o tempo: borboleta de dia, vaga-lumes
 * à noite e uma poça com gotas quando chove (o CSS escolhe o que aparece).
 */

const GRAMA = [
  'g.g........g.....g..g........g....g...g........g...g....g........g..g.....g........g.g......g........gg.......g........g........g.......gg........g......g.g........g.....',
  'gGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGG',
  'dGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGd',
  'dGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdG',
  'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
]

const FLOR = ['.b.', 'bab', '.b.', '.c.']

const POTE_RACAO = ['.rrrr.', 'oooooo', 'oppppo', '.oooo.']

const POTE_AGUA = ['.wwww.', 'oooooo', 'oqqqqo', '.oooo.']

const CERCA = [
  '.m...m...m.',
  'mMm.mMm.mMm',
  'mMm.mMm.mMm',
  'mMmmmMmmmMm',
  'mMm.mMm.mMm',
  'mMm.mMm.mMm',
  'mMmmmMmmmMm',
  'mMm.mMm.mMm',
]

const BORBOLETA = ['aa.aa', 'aakaa', '.a.a.']

const POCA = ['..pppppppppp..', 'pppPPpppppppPp', '..pppppppppp..']

const CORES = {
  g: 'quintal-grama-clara',
  G: 'quintal-grama',
  d: 'quintal-grama-escura',
  a: 'quintal-petala',
  b: 'quintal-petala',
  c: 'quintal-caule',
  k: 'quintal-contorno',
  o: 'quintal-pote',
  r: 'quintal-racao',
  p: 'quintal-poca',
  P: 'quintal-poca-brilho',
  q: 'quintal-agua',
  w: 'quintal-agua-brilho',
  m: 'quintal-madeira',
  M: 'quintal-madeira-clara',
}

const CORES_FLOR_ROSA = {
  ...CORES,
  a: 'quintal-miolo',
  b: 'quintal-petala-rosa',
}
const CORES_FLOR = { ...CORES, a: 'quintal-miolo' }
const CORES_POTE = { ...CORES, p: 'quintal-pote-dentro' }

/** Posições a partir do meio da casinha (em px), no chão do quintal. */
function no(x, baixo = 0) {
  return { left: `calc(50% + ${x}px)`, bottom: `${baixo}px` }
}

export default function Quintal({ chuva }) {
  return (
    <div
      className={`quintal${chuva ? ' quintal-chuva' : ''}`}
      aria-hidden="true"
    >
      {/* A grama vai da borda esquerda do menu até depois da cerquinha */}
      <span className="quintal-gramado">
        <PixelArte desenho={GRAMA} cores={CORES} />
      </span>
      <PixelArte desenho={FLOR} cores={CORES_FLOR} style={no(-74, 8)} />
      <PixelArte desenho={FLOR} cores={CORES_FLOR_ROSA} style={no(-110, 8)} />
      <PixelArte desenho={FLOR} cores={CORES_FLOR_ROSA} style={no(66, 8)} />
      <PixelArte desenho={POTE_RACAO} cores={CORES_POTE} style={no(-62, 6)} />
      <PixelArte desenho={POTE_AGUA} cores={CORES_POTE} style={no(-49, 6)} />
      <PixelArte desenho={CERCA} cores={CORES} style={no(42, 6)} />
      <PixelArte
        className="quintal-poca"
        desenho={POCA}
        cores={CORES}
        style={no(28, 1)}
      />
      <span className="quintal-pingo" style={no(40, 4)} />
      <span className="quintal-pingo" style={no(48, 3)} />
      <span className="quintal-borboleta">
        <PixelArte desenho={BORBOLETA} cores={CORES} />
      </span>
      <span className="quintal-vagalume" style={no(-50, 40)} />
      <span className="quintal-vagalume" style={no(52, 52)} />
      <span className="quintal-vagalume" style={no(-20, 66)} />
    </div>
  )
}
