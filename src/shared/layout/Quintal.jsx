import PixelArte from './PixelArte'
import './Quintal.css'

/*
 * Quintal da casinha no menu, em pixel art (desenhos próprios, 2px por
 * pixel): grama verde com florzinhas, dois potinhos (ração e água),
 * uma cerquinha (mais flores com o gatinho radiante, murchas quando ele está
 * chateado ou triste), e bichinhos conforme o tempo: duas borboletas de dia (uma
 * vermelha), vaga-lumes
 * à noite e, quando chove, uma poça, gotas caindo por cima da casinha e um
 * peixinho que cai do céu (o CSS escolhe o que aparece).
 */

const GRAMA = [
  '..gg.....gg....gg.....gg.......gg.....gg.......gg......gg....gg.......gg...gg.',
  'gGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGgGGGGGGGGGGg',
  'dGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGGdGGGGGGGGGGGG',
  'dGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGdGGGGGGd',
  'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
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

/** Flor murcha (triste): caule torto e pétalas caídas. */
const FLOR_MURCHA = ['....', 'bb..', 'bac.', '..c.']

/** Florzinhas pequenas que aparecem quando está tudo em dia. */
const FLORZINHA = ['.b.', 'bab', '.c.']

/** Onde nascem as florzinhas a mais (radiante), a partir do meio. */
const FLORES_EXTRAS = [
  { x: -80, baixo: 7, rosa: true },
  { x: -68, baixo: 9 },
  { x: -42, baixo: 9, rosa: true },
  { x: 60, baixo: 9, rosa: true },
  { x: 74, baixo: 7 },
  { x: -56, baixo: 12 },
]

/** Florzinhas que sobem pela cerquinha (radiante). */
const FLOR_CERCA = ['.b.', 'bab', '.b.']
const FLORES_CERCA = [
  { x: 42, baixo: 17, rosa: true },
  { x: 51, baixo: 12 },
  { x: 59, baixo: 18, rosa: true },
]

const BORBOLETA = ['aa.aa', 'aakaa', '.a.a.']

const PEIXE = ['..bbb..t', '.bbbbbtt', 'bkbbbbtt', '.bbbbb.t']

/** Gotas que caem em cima da casinha (posição em % e atraso, fixos). */
const GOTAS = Array.from({ length: 16 }, (_, indice) => ({
  id: indice,
  estilo: {
    left: `${4 + ((indice * 37) % 92)}%`,
    animationDelay: `${-((indice * 0.13) % 0.9).toFixed(2)}s`,
    animationDuration: `${0.75 + (indice % 4) * 0.08}s`,
  },
}))

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
  t: 'quintal-peixe-cauda',
}

const CORES_FLOR_ROSA = {
  ...CORES,
  a: 'quintal-miolo',
  b: 'quintal-petala-rosa',
}
const CORES_FLOR = { ...CORES, a: 'quintal-miolo' }
const CORES_VERMELHA = {
  ...CORES,
  a: 'quintal-asa-vermelha',
  k: 'quintal-contorno',
}
const CORES_PEIXE = {
  ...CORES,
  b: 'quintal-peixe',
  k: 'quintal-contorno',
}
const CORES_MURCHA = {
  ...CORES,
  a: 'quintal-miolo-murcho',
  b: 'quintal-petala-murcha',
  c: 'quintal-caule-murcho',
}
const CORES_POTE = { ...CORES, p: 'quintal-pote-dentro' }

/** Posições a partir do meio da casinha (em px), no chão do quintal. */
function no(x, baixo = 0) {
  return { left: `calc(50% + ${x}px)`, bottom: `${baixo}px` }
}

/**
 * Flores conforme o humor do gatinho (da felicidade): radiante, o jardim
 * floresce; chateado, uma murcha; triste, as duas murcham.
 */
function Flores({ humor }) {
  const murchas = { chateado: 1, triste: 2 }[humor] ?? 0

  return (
    <>
      {humor === 'radiante' &&
        FLORES_EXTRAS.map(({ x, baixo, rosa }) => (
          <PixelArte
            key={x}
            className="quintal-florzinha"
            desenho={FLORZINHA}
            cores={rosa ? CORES_FLOR_ROSA : CORES_FLOR}
            style={no(x, baixo)}
          />
        ))}
      {humor === 'radiante' &&
        FLORES_CERCA.map(({ x, baixo, rosa }) => (
          <PixelArte
            key={`cerca-${x}`}
            className="quintal-florzinha quintal-na-cerca"
            desenho={FLOR_CERCA}
            cores={rosa ? CORES_FLOR_ROSA : CORES_FLOR}
            style={no(x, baixo)}
          />
        ))}
      <PixelArte
        desenho={murchas ? FLOR_MURCHA : FLOR}
        cores={murchas ? CORES_MURCHA : CORES_FLOR}
        style={no(-74, 8)}
      />
      <PixelArte
        desenho={murchas > 1 ? FLOR_MURCHA : FLOR}
        cores={murchas > 1 ? CORES_MURCHA : CORES_FLOR_ROSA}
        style={no(66, 8)}
      />
    </>
  )
}

export default function Quintal({ chuva, brincando, humor = 'feliz' }) {
  return (
    <>
      <div
        className={`quintal quintal-${humor}${chuva ? ' quintal-chuva' : ''}`}
        aria-hidden="true"
      >
        <PixelArte desenho={GRAMA} cores={CORES} style={no(-78)} />
        <Flores humor={humor} />
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
        {/* Quando o gatinho brinca, a primeira borboleta (ou o primeiro
          vaga-lume, à noite) foge dele no ritmo da brincadeira */}
        <span
          key={`borboleta-${brincando ?? 'voo'}`}
          className={`quintal-borboleta${brincando ? ' quintal-foge' : ''}`}
        >
          <PixelArte desenho={BORBOLETA} cores={CORES} />
        </span>
        <span className="quintal-borboleta quintal-borboleta-vermelha">
          <PixelArte desenho={BORBOLETA} cores={CORES_VERMELHA} />
        </span>
        <span
          key={`vagalume-${brincando ?? 'voo'}`}
          className={`quintal-vagalume${brincando ? ' quintal-foge' : ''}`}
          style={no(-50, 40)}
        />
        <span className="quintal-vagalume" style={no(52, 52)} />
        <span className="quintal-vagalume" style={no(-20, 66)} />
      </div>
      {/* Na chuva: gotas caindo por cima da casinha e, de vez em quando, um
        peixinho que cai do céu, pula na grama e some */}
      {chuva && (
        <div className="quintal-frente" aria-hidden="true">
          {GOTAS.map((gota) => (
            <span key={gota.id} className="quintal-gota" style={gota.estilo} />
          ))}
          <span className="quintal-peixinho" style={no(22, 6)}>
            <PixelArte desenho={PEIXE} cores={CORES_PEIXE} />
          </span>
        </div>
      )}
    </>
  )
}
