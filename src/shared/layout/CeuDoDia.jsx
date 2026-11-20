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

/** Nuvens do alto: as "extras" só aparecem quando chove. */
const NUVENS = [
  { id: 1, left: '16%', top: '18px', tamanho: 1, vai: '38px', tempo: '26s' },
  {
    id: 2,
    left: '47%',
    top: '64px',
    tamanho: 0.75,
    vai: '-30px',
    tempo: '31s',
  },
  { id: 3, left: '78%', top: '96px', tamanho: 0.9, vai: '26px', tempo: '22s' },
  {
    id: 4,
    left: '30%',
    top: '6px',
    tamanho: 1.15,
    vai: '-24px',
    tempo: '28s',
    extra: true,
  },
  {
    id: 5,
    left: '62%',
    top: '14px',
    tamanho: 1.25,
    vai: '30px',
    tempo: '34s',
    extra: true,
  },
].map(({ id, left, top, tamanho, vai, tempo, extra }) => ({
  id,
  extra,
  estilo: {
    left,
    top,
    '--nuvem-tamanho': tamanho,
    '--nuvem-vai': vai,
    animationDuration: tempo,
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
 * Céu do modo claro: sol com raios girando e nuvens passando no alto da tela.
 * Enquanto houver atividade atrasada, o céu fecha: nuvens cinzas, chuva e
 * raios. Quando nenhuma estiver mais atrasada, o sol volta. Fica atrás do
 * conteúdo e só aparece no modo claro (o CSS esconde no escuro).
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

  return (
    <div
      className={`ceu-dia${chuva ? ' ceu-dia-chuva' : ''}`}
      aria-hidden="true"
      data-tempo={chuva ? 'chuva' : 'sol'}
    >
      <span className="ceu-dia-sol" />
      {NUVENS.map((nuvem) => (
        <span
          key={nuvem.id}
          className={`ceu-dia-nuvem${nuvem.extra ? ' ceu-dia-nuvem-extra' : ''}`}
          style={nuvem.estilo}
        />
      ))}
      <span className="ceu-dia-gotas">
        {GOTAS.map((gota) => (
          <span key={gota.id} className="ceu-dia-gota" style={gota.estilo} />
        ))}
      </span>
      <span className="ceu-dia-clarao" />
      <span className="ceu-dia-raio" />
    </div>
  )
}
