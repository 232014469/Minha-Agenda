import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './Feitico.css'

/** Sorteio com semente: o efeito sai sempre igual. */
function sorteador(semente) {
  let valor = semente

  return () => {
    valor = (valor * 16807) % 2147483647

    return (valor - 1) / 2147483646
  }
}

const sortear = sorteador(22112026)
const num = (valor) => Math.round(valor * 100) / 100

/* ---------- Maldição: o reino vira bosque ---------- */

const FUMACAS = [
  { id: 1, x: '0%', y: '100%', cor: '58 16 82' },
  { id: 2, x: '100%', y: '100%', cor: '20 52 40' },
  { id: 3, x: '0%', y: '0%', cor: '24 18 60' },
  { id: 4, x: '100%', y: '0%', cor: '64 20 90' },
  { id: 5, x: '50%', y: '110%', cor: '30 70 46' },
].map(({ id, x, y, cor }) => ({
  id,
  estilo: {
    left: x,
    top: y,
    '--fumaca-cor': cor,
    animationDelay: `${(id - 1) * 0.07}s`,
  },
}))

/** Galho de espinhos: uma curva com espinhos pontudos dos dois lados. */
function espinheiro(pontos) {
  const [inicio, ...resto] = pontos
  let d = `M${inicio[0]} ${inicio[1]}`

  resto.forEach(([x, y], indice) => {
    const [ax, ay] = pontos[indice]
    const meioX = (ax + x) / 2
    const meioY = (ay + y) / 2
    const lado = indice % 2 === 0 ? 1 : -1

    d += `Q${num(meioX + lado * 30)} ${num(meioY - lado * 20)} ${x} ${y}`
    // espinho perto do meio de cada trecho
    const dx = x - ax
    const dy = y - ay
    const tamanho = Math.hypot(dx, dy) || 1
    const nx = (-dy / tamanho) * 16 * lado
    const ny = (dx / tamanho) * 16 * lado

    d += `M${num(meioX)} ${num(meioY)}l${num(nx + dx * 0.08)} ${num(ny + dy * 0.08)}M${x} ${y}`
  })

  return d
}

const ESPINHOS = [
  espinheiro([
    [-20, 820],
    [90, 690],
    [80, 560],
    [190, 470],
    [180, 340],
    [290, 260],
  ]),
  espinheiro([
    [1220, 820],
    [1110, 700],
    [1130, 580],
    [1010, 500],
    [1030, 380],
    [920, 300],
  ]),
  espinheiro([
    [-20, -20],
    [100, 60],
    [90, 160],
    [210, 210],
  ]),
  espinheiro([
    [1220, -20],
    [1100, 70],
    [1120, 170],
    [990, 220],
  ]),
  espinheiro([
    [420, 830],
    [470, 720],
    [430, 640],
    [520, 580],
  ]),
  espinheiro([
    [800, 830],
    [750, 730],
    [800, 650],
    [700, 600],
  ]),
]

const FAISCAS_VERDES = Array.from({ length: 12 }, (_, indice) => ({
  id: indice,
  estilo: {
    left: `${num(sortear() * 100)}%`,
    '--faisca-tamanho': `${num(4 + sortear() * 6)}px`,
    '--faisca-sobe': `${num(-35 - sortear() * 45)}vh`,
    '--faisca-lado': `${num((sortear() - 0.5) * 80)}px`,
    animationDelay: `${num(0.1 + sortear() * 1.1)}s`,
    animationDuration: `${num(1.2 + sortear() * 0.8)}s`,
  },
}))

function Maldicao() {
  return (
    <div className="feitico feitico-maldicao" aria-hidden="true">
      {FUMACAS.map((fumaca) => (
        <span
          key={fumaca.id}
          className="feitico-fumaca"
          style={fumaca.estilo}
        />
      ))}
      <svg
        className="feitico-espinhos"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        {ESPINHOS.map((d, indice) => (
          <path
            key={d}
            d={d}
            pathLength="1"
            style={{ animationDelay: `${num(0.08 * indice)}s` }}
          />
        ))}
      </svg>
      <span className="feitico-clarao-verde" />
      {FAISCAS_VERDES.map((faisca) => (
        <span
          key={faisca.id}
          className="feitico-faisca"
          style={faisca.estilo}
        />
      ))}
    </div>
  )
}

/* ---------- Encanto: o bosque volta a ser reino ---------- */

const CORES = ['#ffffff', '#ffd6ea', '#bfe6ff', '#fff1a8', '#e6d4ff', '#ffc2dc']

/** Brilhos que giram em espiral do centro para fora (o redemoinho). */
const REDEMOINHO = Array.from({ length: 28 }, (_, indice) => ({
  id: indice,
  estilo: {
    '--giro-inicio': `${num((indice / 28) * 1080)}deg`,
    '--giro-fim': `${num((indice / 28) * 1080 + 320 + sortear() * 140)}deg`,
    '--giro-raio': `${num(10 + (indice / 28) * 50 + sortear() * 6)}vmin`,
    '--brilho-tamanho': `${num(9 + sortear() * 9)}px`,
    animationDelay: `${num((indice / 28) * 0.45)}s`,
  },
  cor: CORES[indice % CORES.length],
}))

/** Purpurina que cai depois da onda de luz. */
const PURPURINA = Array.from({ length: 22 }, (_, indice) => ({
  id: indice,
  estilo: {
    left: `${num(sortear() * 100)}%`,
    top: `${num(-10 + sortear() * 50)}%`,
    '--brilho-tamanho': `${num(5 + sortear() * 9)}px`,
    '--purpurina-cai': `${num(25 + sortear() * 40)}vh`,
    '--purpurina-lado': `${num((sortear() - 0.5) * 60)}px`,
    background: CORES[(indice + 2) % CORES.length],
    animationDelay: `${num(1.1 + sortear() * 0.9)}s`,
  },
}))

function Encanto() {
  return (
    <div className="feitico feitico-encanto" aria-hidden="true">
      <span className="feitico-veu" />
      <span className="feitico-nucleo" />
      <span className="feitico-redemoinho">
        {REDEMOINHO.map((brilho) => (
          <span key={brilho.id} className="feitico-giro" style={brilho.estilo}>
            <i style={{ background: brilho.cor }} />
          </span>
        ))}
      </span>
      <span className="feitico-onda" />
      <span className="feitico-onda feitico-onda-segunda" />
      {PURPURINA.map((brilho) => (
        <span
          key={brilho.id}
          className="feitico-purpurina"
          style={brilho.estilo}
        />
      ))}
    </div>
  )
}

/**
 * Transformação do tema Reino doce quando o tempo muda: `maldicao` quando
 * começa a chover (fumaça roxa e verde, espinhos crescendo e faíscas verdes
 * subindo) e `encanto` quando para (redemoinho de brilhos, onda de luz e
 * purpurina caindo). A troca de verdade acontece por baixo, no auge do
 * efeito (ver tempoDoFeitico.js). Não pega cliques.
 */
export default function Feitico({ tipo }) {
  // Enquanto o feitiço dura, as cores da página mudam devagar em vez de
  // trocar de uma vez (ver Feitico.css)
  useEffect(() => {
    document.documentElement.dataset.feitico = tipo

    return () => {
      delete document.documentElement.dataset.feitico
    }
  }, [tipo])

  return createPortal(
    tipo === 'maldicao' ? <Maldicao /> : <Encanto />,
    document.body,
  )
}
