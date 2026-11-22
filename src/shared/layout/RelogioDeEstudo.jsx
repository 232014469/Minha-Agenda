import { useEffect, useRef, useState } from 'react'
import { usePreferencias } from '../preferencias'
import {
  ETAPAS,
  FOCOS_ATE_PAUSA_LONGA,
  atualizar,
  formatar,
  iniciar,
  lerRelogio,
  pausar,
  proximaEtapa,
  reiniciar,
  restanteDe,
  salvarRelogio,
} from '../relogio/pomodoro'
import { tocarSino } from '../relogio/sino'
import './RelogioDeEstudo.css'

const RAIO = 44
const VOLTA = 2 * Math.PI * RAIO

const ICONES = {
  iniciar: (
    <path d="M5 3.2v9.6c0 .6.7 1 1.2.6l7-4.8a.8.8 0 0 0 0-1.2l-7-4.8C5.7 2.2 5 2.6 5 3.2Z" />
  ),
  pausar: (
    <>
      <rect x="3.5" y="3" width="3.2" height="10" rx="1" />
      <rect x="9.3" y="3" width="3.2" height="10" rx="1" />
    </>
  ),
  reiniciar: (
    <path d="M8 2.5a5.5 5.5 0 1 1-5.2 3.7l1.6.6A3.8 3.8 0 1 0 8 4.2v1.9L4.8 3.4 8 .6Z" />
  ),
  pular: (
    <>
      <path d="M2.5 3.4v9.2c0 .6.7.9 1.2.6l6.4-4.6a.7.7 0 0 0 0-1.2L3.7 2.8c-.5-.3-1.2 0-1.2.6Z" />
      <rect x="11" y="3" width="2.6" height="10" rx="1" />
    </>
  ),
}

function Icone({ nome }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {ICONES[nome]}
    </svg>
  )
}

/**
 * Relógio de estudo (pomodoro), no lugar do gatinho quando ele está
 * desligado nas Configurações. No menu é um aparelhinho como o bichinho
 * virtual (anel que esvazia, tempo, etapa e os focos do dia); no celular,
 * `compacto`, vira uma faixa em cima do título. Ao acabar uma etapa toca um
 * sininho (se os sons estão ligados) e passa para a próxima, parada.
 */
export default function RelogioDeEstudo({ compacto = false }) {
  const { sons } = usePreferencias()
  const [relogio, setRelogio] = useState(() => lerRelogio())
  const [agora, setAgora] = useState(() => Date.now())
  const tituloOriginal = useRef(null)

  // Enquanto roda, confere a cada segundo; ao acabar, toca e avança
  useEffect(() => {
    if (!relogio.rodando) return undefined

    const intervalo = setInterval(() => {
      const instante = Date.now()
      const novo = atualizar(relogio, instante)

      setAgora(instante)
      if (novo === relogio) return
      if (novo.etapa !== relogio.etapa && sons) tocarSino()
      setRelogio(novo)
    }, 1000)

    return () => clearInterval(intervalo)
  }, [relogio, sons])

  useEffect(() => salvarRelogio(relogio), [relogio])

  const etapa = ETAPAS[relogio.etapa]
  const restante = restanteDe(relogio, agora)
  const tempo = formatar(restante)
  const andou = 1 - restante / etapa.duracao

  // O tempo aparece também na aba do navegador enquanto roda
  useEffect(() => {
    if (tituloOriginal.current === null) {
      tituloOriginal.current = document.title
    }
    const original = tituloOriginal.current

    document.title = relogio.rodando
      ? [`${tempo} · ${etapa.nome}`, original].filter(Boolean).join(' — ')
      : original
  }, [relogio.rodando, tempo, etapa.nome])

  useEffect(
    () => () => {
      if (tituloOriginal.current !== null) {
        document.title = tituloOriginal.current
      }
    },
    [],
  )

  function alternar() {
    const instante = Date.now()

    setAgora(instante)
    setRelogio(
      relogio.rodando ? pausar(relogio, instante) : iniciar(relogio, instante),
    )
  }

  const noCiclo = relogio.feitos % FOCOS_ATE_PAUSA_LONGA
  const pausaClasse = relogio.etapa === 'foco' ? '' : ' relogio-em-pausa'

  const botoes = (
    <div
      className="relogio-botoes"
      role="group"
      aria-label="Controles do relógio"
    >
      <button
        type="button"
        aria-label="Recomeçar a etapa"
        title="Recomeçar"
        onClick={() => setRelogio(reiniciar(relogio))}
      >
        <Icone nome="reiniciar" />
      </button>
      <button
        type="button"
        className="relogio-principal"
        aria-label={relogio.rodando ? 'Pausar o relógio' : 'Começar o relógio'}
        title={relogio.rodando ? 'Pausar' : 'Começar'}
        onClick={alternar}
      >
        <Icone nome={relogio.rodando ? 'pausar' : 'iniciar'} />
      </button>
      <button
        type="button"
        aria-label="Pular para a próxima etapa"
        title="Pular"
        onClick={() => setRelogio(proximaEtapa(relogio))}
      >
        <Icone nome="pular" />
      </button>
    </div>
  )

  const focos = (
    <p
      className="relogio-focos"
      aria-label={`${relogio.feitos} ${relogio.feitos === 1 ? 'foco feito' : 'focos feitos'} hoje`}
    >
      {Array.from({ length: FOCOS_ATE_PAUSA_LONGA }, (_, indice) => (
        <span
          key={indice}
          className={indice < noCiclo ? 'relogio-foco-feito' : undefined}
        />
      ))}
      {relogio.feitos > 0 && <small>{relogio.feitos} hoje</small>}
    </p>
  )

  if (compacto) {
    return (
      <section
        className={`relogio-compacto${pausaClasse}`}
        aria-label="Relógio de estudo"
      >
        <span
          className="relogio-mini-anel"
          style={{ '--andou': andou }}
          aria-hidden="true"
        />
        <p className="relogio-mini-tempo">
          <strong role="timer">{tempo}</strong>
          <span>{etapa.nome}</span>
        </p>
        {focos}
        {botoes}
      </section>
    )
  }

  return (
    <section className={`relogio${pausaClasse}`} aria-label="Relógio de estudo">
      <div className="relogio-aro">
        <div className="relogio-tela">
          <svg
            className="relogio-anel"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle className="relogio-trilho" cx="50" cy="50" r={RAIO} />
            <circle
              className="relogio-progresso"
              cx="50"
              cy="50"
              r={RAIO}
              strokeDasharray={VOLTA}
              strokeDashoffset={VOLTA * andou}
            />
          </svg>
          <div className="relogio-centro">
            <span className="relogio-etapa">{etapa.nome}</span>
            <strong className="relogio-tempo" role="timer">
              {tempo}
            </strong>
            {focos}
          </div>
        </div>
        {botoes}
      </div>
    </section>
  )
}
