import { useEffect, useState } from 'react'
import { useDados } from '../../dados/useDados'
import { temAtrasadas } from './alerta'
import './CeuDoDia.css'

/** Sorteio com semente: gotas e nuvens ficam sempre no mesmo lugar. */
function sorteador(semente) {
  let valor = semente

  return () => {
    valor = (valor * 16807) % 2147483647

    return (valor - 1) / 2147483646
  }
}

const sortear = sorteador(20261120)

/**
 * Nuvens do alto: cada uma atravessa o céu devagar, da esquerda para a
 * direita, num "trilho" que dura alguns minutos; o atraso negativo espalha as
 * nuvens desde o começo. `x` é onde ficam paradas (reduzir movimento). As
 * "extras" só aparecem quando chove, e cada uma solta um raio (`raio` é o
 * atraso dele: as duas se revezam a cada 3,5 s).
 */
const NUVENS = [
  { id: 1, top: 18, tamanho: 1, tempo: 150, atraso: 0.18, x: '16%' },
  { id: 2, top: 66, tamanho: 0.75, tempo: 190, atraso: 0.52, x: '47%' },
  { id: 3, top: 98, tamanho: 0.9, tempo: 170, atraso: 0.83, x: '78%' },
  {
    id: 4,
    top: 6,
    tamanho: 1.15,
    tempo: 160,
    atraso: 0.33,
    x: '30%',
    extra: true,
    raio: '1.5s',
  },
  {
    id: 5,
    top: 14,
    tamanho: 1.25,
    tempo: 200,
    atraso: 0.66,
    x: '62%',
    extra: true,
    raio: '5s',
  },
].map(({ id, top, tamanho, tempo, atraso, x, extra, raio }) => ({
  id,
  extra,
  raio,
  trilho: {
    top: `${top}px`,
    '--nuvem-x': x,
    animationDuration: `${tempo}s`,
    animationDelay: `${-tempo * atraso}s`,
  },
  nuvem: {
    '--nuvem-tamanho': tamanho,
    animationDuration: `${7 + id * 1.3}s`,
  },
}))

const GOTAS = Array.from({ length: 48 }, (_, indice) => ({
  id: indice,
  estilo: {
    left: `${(sortear() * 100).toFixed(2)}%`,
    animationDuration: `${(0.7 + sortear() * 0.5).toFixed(2)}s`,
    animationDelay: `${(-sortear() * 1.2).toFixed(2)}s`,
  },
}))

/**
 * Olhos no escuro do bosque (tema Reino doce, na chuva): pares que piscam e
 * somem em tempos diferentes. Os do `alto` ficam entre as folhas do céu; os
 * outros espiam das bordas escuras da página.
 */
const OLHOS = [
  { id: 1, alto: true, left: '12%', top: 34, tamanho: 1, atraso: 0 },
  { id: 2, alto: true, left: '41%', top: 52, tamanho: 0.8, atraso: 2.6 },
  { id: 3, alto: true, left: '67%', top: 28, tamanho: 1.1, atraso: 5.1 },
  { id: 4, alto: true, left: '88%', top: 60, tamanho: 0.9, atraso: 1.4 },
  { id: 5, left: '1.5%', top: '42%', tamanho: 1.2, atraso: 3.8 },
  { id: 6, left: '96%', top: '58%', tamanho: 1, atraso: 6.3 },
  { id: 7, left: '3%', top: '78%', tamanho: 0.85, atraso: 8.2 },
  { id: 8, left: '93%', top: '24%', tamanho: 0.9, atraso: 4.5 },
].map(({ id, alto, left, top, tamanho, atraso }) => ({
  id,
  alto,
  estilo: {
    left,
    top: typeof top === 'number' ? `${top}px` : top,
    '--olho-tamanho': tamanho,
    animationDelay: `${atraso}s`,
  },
}))

function Olhos({ olho }) {
  return (
    <span className="ceu-olhos" style={olho.estilo}>
      <i />
      <i />
    </span>
  )
}

/**
 * Céu do modo claro: sol brilhando com raios girando devagar e nuvens
 * atravessando o alto da tela.
 * Enquanto houver atividade atrasada, o céu fecha: nuvens cinzas, chuva e
 * raios. Quando nenhuma estiver mais atrasada, o sol volta. Fica atrás do
 * conteúdo. No modo escuro só aparece a chuva, por cima do céu estrelado.
 * No tema Reino doce, a chuva vira um bosque escuro: folhas no alto, bordas
 * na sombra e olhos piscando (ver tema-doce.css).
 */
export default function CeuDoDia() {
  const { tarefas } = useDados()
  // Confere de minuto em minuto: uma atividade pode vencer com a página aberta.
  const [, setMinuto] = useState(0)

  useEffect(() => {
    const relogio = setInterval(() => setMinuto((minuto) => minuto + 1), 60_000)

    return () => clearInterval(relogio)
  }, [])

  const chuva = temAtrasadas(tarefas)

  // O tempo vai para a raiz da página: o tema Reino doce escurece tudo na
  // chuva (ver tema-doce.css)
  useEffect(() => {
    document.documentElement.dataset.tempo = chuva ? 'chuva' : 'sol'

    return () => {
      delete document.documentElement.dataset.tempo
    }
  }, [chuva])

  return (
    <>
      <div
        className={`ceu-dia${chuva ? ' ceu-dia-chuva' : ''}`}
        aria-hidden="true"
        data-tempo={chuva ? 'chuva' : 'sol'}
      >
        <span className="ceu-dia-sol" />
        {NUVENS.map((nuvem) => (
          <span
            key={nuvem.id}
            className={`ceu-dia-trilho${nuvem.extra ? ' ceu-dia-nuvem-extra' : ''}`}
            style={nuvem.trilho}
          >
            {nuvem.raio && (
              <span
                className="ceu-dia-raio"
                style={{ animationDelay: nuvem.raio }}
              />
            )}
            <span className="ceu-dia-nuvem" style={nuvem.nuvem} />
          </span>
        ))}
        <span className="ceu-dia-gotas">
          {GOTAS.map((gota) => (
            <span key={gota.id} className="ceu-dia-gota" style={gota.estilo} />
          ))}
        </span>
        <span className="ceu-dia-clarao" />
        <span className="ceu-bosque">
          <span className="ceu-bosque-folhas" />
          {OLHOS.filter((olho) => olho.alto).map((olho) => (
            <Olhos key={olho.id} olho={olho} />
          ))}
        </span>
      </div>
      {/* Fora do céu: por cima do conteúdo, só nas bordas (sem cliques) */}
      <span className="ceu-bosque-sombra" aria-hidden="true">
        {OLHOS.filter((olho) => !olho.alto).map((olho) => (
          <Olhos key={olho.id} olho={olho} />
        ))}
      </span>
    </>
  )
}
