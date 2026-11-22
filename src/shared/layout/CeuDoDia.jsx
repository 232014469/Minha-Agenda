import { useEffect, useState } from 'react'
import { useDados } from '../../dados/useDados'
import { temAtrasadas } from './alerta'
import Feitico from './Feitico'
import {
  AUGE_DO_FEITICO,
  DURACAO_DO_FEITICO,
  podeEncantar,
} from './tempoDoFeitico'
import Floresta from './Floresta'
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
 * Céu do modo claro: sol brilhando com raios girando devagar e nuvens
 * atravessando o alto da tela.
 * Enquanto houver atividade atrasada, o céu fecha: nuvens cinzas, chuva e
 * raios. Quando nenhuma estiver mais atrasada, o sol volta. Fica atrás do
 * conteúdo. No modo escuro só aparece a chuva, por cima do céu estrelado.
 * No tema Reino doce, a chuva vira um bosque escuro de noite, com névoa e
 * olhos espiando (ver Floresta), e a troca vem com uma transformação: um
 * feitiço sombrio quando começa a chover e um encanto de brilhos quando para
 * (ver Feitico).
 */
export default function CeuDoDia() {
  const { tarefas } = useDados()
  // Confere de minuto em minuto: uma atividade pode vencer com a página aberta.
  const [, setMinuto] = useState(0)

  useEffect(() => {
    const relogio = setInterval(() => setMinuto((minuto) => minuto + 1), 60_000)

    return () => clearInterval(relogio)
  }, [])

  const choveu = temAtrasadas(tarefas)
  // O céu mostrado pode ficar um pouco atrás do tempo de verdade: no Reino
  // doce, a troca entre reino e bosque espera o auge do feitiço
  const [chuva, setChuva] = useState(choveu)
  const [feitico, setFeitico] = useState(null)

  if (choveu !== chuva && !feitico) {
    if (podeEncantar()) {
      setFeitico({ tipo: choveu ? 'maldicao' : 'encanto', para: choveu })
    } else {
      setChuva(choveu)
    }
  }

  useEffect(() => {
    if (!feitico) return undefined

    const troca = setTimeout(() => setChuva(feitico.para), AUGE_DO_FEITICO)
    const fim = setTimeout(() => setFeitico(null), DURACAO_DO_FEITICO)

    return () => {
      clearTimeout(troca)
      clearTimeout(fim)
    }
  }, [feitico])

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
      {feitico && <Feitico tipo={feitico.tipo} />}
      {/* No encanto, a floresta fica mais um pouco, sumindo devagar */}
      {(chuva || feitico?.tipo === 'encanto') && <Floresta saindo={!chuva} />}
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
      </div>
    </>
  )
}
