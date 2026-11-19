import { useEffect, useState } from 'react'
import './Mascote.css'

/**
 * Lobinho do Wolf Study: respira, abana o rabo, pisca e mexe a orelha.
 * Um clique faz ele uivar. O lenço segue a cor do tema.
 */
export default function Mascote() {
  const [uivando, setUivando] = useState(false)

  useEffect(() => {
    if (!uivando) return undefined

    const fim = setTimeout(() => setUivando(false), 1600)

    return () => clearTimeout(fim)
  }, [uivando])

  return (
    <button
      type="button"
      className={`mascote${uivando ? ' mascote-uivando' : ''}`}
      aria-label="Lobinho, o mascote. Clique para ele uivar"
      title="Auuu?"
      onClick={() => setUivando(true)}
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
      <span className="mascote-balao" aria-hidden="true">
        Auuu!
      </span>
    </button>
  )
}
