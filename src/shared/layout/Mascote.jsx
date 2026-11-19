import { useCallback, useEffect, useState } from 'react'
import Sprite from '../gatinhos/Sprite'
import { EVENTO_CONCLUIU, GATOS, ehGato } from '../gatinhos/gatos'
import { usePreferencias } from '../preferencias'
import { miar, uivar } from '../sons'
import './Mascote.css'

/**
 * O mascote do menu, escolhido nas Configurações: o lobinho ou um gatinho.
 * Além de reagir ao clique, é ele quem comemora quando uma tarefa é
 * concluída (se "Gatinhos pela tela" estiver ligado).
 */
export default function Mascote() {
  const { mascote, sons, gatinhos } = usePreferencias()

  return ehGato(mascote) ? (
    <MascoteGato gato={mascote} sons={sons} comemora={gatinhos} />
  ) : (
    <MascoteLobo sons={sons} comemora={gatinhos} />
  )
}

/** Chama `aoConcluir` sempre que uma tarefa é concluída, enquanto `ativo`. */
function useAoConcluir(ativo, aoConcluir) {
  useEffect(() => {
    if (!ativo) return undefined

    window.addEventListener(EVENTO_CONCLUIU, aoConcluir)

    return () => window.removeEventListener(EVENTO_CONCLUIU, aoConcluir)
  }, [ativo, aoConcluir])
}

const TEXTO_DO_BALAO = { miau: 'Miau!', uivo: 'Auuu!', festa: 'Feito! 🎉' }

/** Balão de fala e o aviso para leitores de tela quando comemora. */
function Balao({ acao, padrao }) {
  return (
    <>
      <span className="mascote-balao" aria-hidden="true">
        {TEXTO_DO_BALAO[acao] ?? padrao}
      </span>
      <span className="so-leitor" role="status">
        {acao === 'festa' ? 'Tarefa concluída!' : ''}
      </span>
    </>
  )
}

/**
 * Gatinho em pixel art: abana o rabo e pisca. Um clique faz ele pular e
 * miar; ao concluir uma tarefa, ele pula comemorando.
 */
function MascoteGato({ gato, sons, comemora }) {
  const [pulo, setPulo] = useState(null)
  const nome = GATOS.find((item) => item.id === gato)?.nome ?? 'Gatinho'

  const comemorar = useCallback(() => {
    setPulo({ acao: 'festa', vez: Date.now() })
    if (sons) miar({ volume: 0.3 })
  }, [sons])

  useAoConcluir(comemora, comemorar)

  return (
    <button
      type="button"
      className={`mascote mascote-gato${pulo ? ' mascote-uivando' : ''}`}
      aria-label={`${nome}, o mascote. Clique para ele miar`}
      title="Miau?"
      onClick={() => {
        setPulo({ acao: 'miau', vez: Date.now() })
        if (sons) miar()
      }}
    >
      {pulo ? (
        <Sprite
          key={pulo.vez}
          gato={gato}
          animacao="jump"
          fps={9}
          vezes={pulo.acao === 'festa' ? '3' : '2'}
          aoTerminar={() => setPulo(null)}
        />
      ) : (
        <Sprite key="parado" gato={gato} animacao="idle_blink" fps={7} />
      )}
      <Balao acao={pulo?.acao} padrao="Miau!" />
    </button>
  )
}

/**
 * Lobinho do Wolf Study: respira, abana o rabo, pisca e mexe a orelha.
 * Um clique faz ele uivar. O lenço segue a cor do tema.
 */
function MascoteLobo({ sons, comemora }) {
  const [uivo, setUivo] = useState(null)
  const uivando = uivo !== null

  useEffect(() => {
    if (!uivo) return undefined

    const fim = setTimeout(() => setUivo(null), 1600)

    return () => clearTimeout(fim)
  }, [uivo])

  const comemorar = useCallback(() => {
    setUivo({ acao: 'festa', vez: Date.now() })
    if (sons) uivar({ volume: 0.3 })
  }, [sons])

  useAoConcluir(comemora, comemorar)

  return (
    <button
      type="button"
      className={`mascote${uivando ? ' mascote-uivando' : ''}`}
      aria-label="Lobinho, o mascote. Clique para ele uivar"
      title="Auuu?"
      onClick={() => {
        setUivo({ acao: 'uivo', vez: Date.now() })
        if (sons) uivar()
      }}
    >
      <svg viewBox="0 0 80 80" aria-hidden="true" focusable="false">
        <g className="mascote-rabo">
          <path d="M26 60C11 59 5 46 11 35c3 9 9 15 19 17Z" />
          <path
            className="mascote-claro"
            d="M11 35c-2 4-2 8 0 11 2-4 3-8 0-11Z"
          />
        </g>
        <g className="mascote-corpo">
          <ellipse cx="40" cy="59" rx="17" ry="15" />
          <ellipse className="mascote-claro" cx="42" cy="63" rx="8.5" ry="9" />
          <rect x="32" y="62" width="7" height="13" rx="3.5" />
          <rect x="43" y="62" width="7" height="13" rx="3.5" />
          <ellipse
            className="mascote-claro"
            cx="35.5"
            cy="74"
            rx="4"
            ry="2.2"
          />
          <ellipse
            className="mascote-claro"
            cx="46.5"
            cy="74"
            rx="4"
            ry="2.2"
          />
        </g>
        <path
          className="mascote-lenco"
          d="M26 45q14 9 28 0l1 5q-15 10-30 0Zm18 7 5 9-8-3Z"
        />
        <g className="mascote-cabeca">
          <g className="mascote-orelha-esq">
            <path d="M27 24 30 6l10 14Z" />
            <path className="mascote-rosa" d="M30 20 31 11l5 8Z" />
          </g>
          <g className="mascote-orelha-dir">
            <path d="M53 24 50 6 40 20Z" />
            <path className="mascote-rosa" d="M50 20 49 11l-5 8Z" />
          </g>
          <ellipse cx="40" cy="31" rx="15" ry="13" />
          <ellipse className="mascote-claro" cx="40" cy="37" rx="9" ry="7" />
          <g className="mascote-olhos">
            <ellipse
              className="mascote-escuro"
              cx="33.5"
              cy="29"
              rx="2"
              ry="2.4"
            />
            <ellipse
              className="mascote-escuro"
              cx="46.5"
              cy="29"
              rx="2"
              ry="2.4"
            />
            <circle className="mascote-brilho" cx="34.2" cy="28.2" r="0.7" />
            <circle className="mascote-brilho" cx="47.2" cy="28.2" r="0.7" />
          </g>
          <ellipse
            className="mascote-escuro"
            cx="40"
            cy="34.5"
            rx="2.4"
            ry="1.7"
          />
          <path className="mascote-boca" d="M37.5 37.5q2.5 2 5 0" />
          <ellipse
            className="mascote-bochecha"
            cx="30"
            cy="35"
            rx="2.4"
            ry="1.4"
          />
          <ellipse
            className="mascote-bochecha"
            cx="50"
            cy="35"
            rx="2.4"
            ry="1.4"
          />
        </g>
      </svg>
      <Balao acao={uivo?.acao} padrao="Auuu!" />
    </button>
  )
}
