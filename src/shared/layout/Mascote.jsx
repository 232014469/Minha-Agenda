import { useCallback, useEffect, useState } from 'react'
import Sprite from '../gatinhos/Sprite'
import { avancar, iniciarRotina } from '../gatinhos/rotina'
import {
  EVENTO_CONCLUIU,
  EVENTO_TRISTE,
  GATOS,
  ehGato,
} from '../gatinhos/gatos'
import { usePreferencias } from '../preferencias'
import { miar, uivar } from '../sons'
import './Mascote.css'

/**
 * O mascote do menu, escolhido nas Configurações: o lobinho ou um gatinho.
 * Além de reagir ao clique, é ele quem comemora quando uma tarefa é
 * concluída e fica triste quando não é realizada ou é excluída (se
 * "Gatinhos pela tela" estiver ligado).
 */
export default function Mascote() {
  const { mascote, sons, gatinhos } = usePreferencias()

  return ehGato(mascote) ? (
    <MascoteGato gato={mascote} sons={sons} comemora={gatinhos} />
  ) : (
    <MascoteLobo sons={sons} comemora={gatinhos} />
  )
}

/** Chama `reagir` a cada `evento` dos dados, enquanto `ativo`. */
function useEvento(ativo, evento, reagir) {
  useEffect(() => {
    if (!ativo) return undefined

    window.addEventListener(evento, reagir)

    return () => window.removeEventListener(evento, reagir)
  }, [ativo, evento, reagir])
}

const TEXTO_DO_BALAO = {
  miau: 'Miau!',
  uivo: 'Auuu!',
  festa: 'Feito! 🎉',
  triste: 'Ah… 😿',
  pedindo: 'Miaaau! 🥺',
}

/** Balão de fala e o aviso para leitores de tela quando comemora. */
function Balao({ acao, padrao, triste = TEXTO_DO_BALAO.triste }) {
  const texto = acao === 'triste' ? triste : TEXTO_DO_BALAO[acao]

  return (
    <>
      <span className="mascote-balao" aria-hidden="true">
        {texto ?? padrao}
      </span>
      <span className="so-leitor" role="status">
        {acao === 'festa' ? 'Tarefa concluída!' : ''}
      </span>
    </>
  )
}

/** Cada reação do gatinho: a animação, quantas vezes e o miado. */
const CENAS = {
  miau: { animacao: 'jump', fps: 9, vezes: '2', miado: 'clique' },
  festa: { animacao: 'jump', fps: 9, vezes: '3', miado: 'fofo' },
  pedindo: { animacao: 'jump', fps: 11, vezes: '5', miado: 'pedindo' },
  triste: { animacao: 'liedown', fps: 15, vezes: '1', miado: 'triste' },
}

/** Quantos cliques rápidos deixam o gatinho pedindo atenção. */
const CLIQUES_SEGUIDOS = 5

/** Quem prefere menos movimento vê o gatinho só parado, piscando. */
function prefereMenosMovimento() {
  return Boolean(
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )
}

/** Onde o gatinho fica: no meio do menu ou escondido além da borda esquerda. */
const POSICAO = { meio: '50%', fora: '-48px' }

/**
 * Gatinho em pixel art com uma rotina própria: fica parado piscando, senta,
 * deita e se levanta, ou sai andando pela esquerda e volta. Um clique faz ele
 * pular e miar; ao concluir uma tarefa ele comemora, e fica triste quando uma
 * tarefa não é realizada ou é excluída. Muitos cliques seguidos: ele pede
 * atenção. As reações interrompem a rotina, que recomeça depois.
 */
function MascoteGato({ gato, sons, comemora }) {
  const [cena, setCena] = useState(null)
  const [rotina, setRotina] = useState(() => iniciarRotina('parado'))
  const [semRotina] = useState(prefereMenosMovimento)
  const passo = rotina.passos[rotina.indice]

  useEffect(() => {
    if (cena || semRotina) return undefined

    const espera = setTimeout(() => setRotina(avancar), passo.ms)

    return () => clearTimeout(espera)
  }, [cena, semRotina, passo])
  const [cliques, setCliques] = useState([])
  const nome = GATOS.find((item) => item.id === gato)?.nome ?? 'Gatinho'

  const encenar = useCallback(
    (acao) => {
      setCena({ acao, vez: Date.now() })
      setRotina(iniciarRotina('parado'))
      if (sons) miar(CENAS[acao].miado, { volume: acao === 'miau' ? 0.8 : 0.6 })
    },
    [sons],
  )
  const comemorar = useCallback(() => encenar('festa'), [encenar])
  const entristecer = useCallback(() => encenar('triste'), [encenar])

  useEvento(comemora, EVENTO_CONCLUIU, comemorar)
  useEvento(comemora, EVENTO_TRISTE, entristecer)

  function clicar() {
    const agora = Date.now()
    const recentes = [...cliques, agora].filter((vez) => agora - vez < 3000)

    if (recentes.length >= CLIQUES_SEGUIDOS) {
      setCliques([])
      encenar('pedindo')
    } else {
      setCliques(recentes)
      encenar('miau')
    }
  }

  const atual = cena ? CENAS[cena.acao] : null
  const emCena = Boolean(atual)
  const onde = emCena || semRotina ? 'meio' : passo.onde
  const anda = !emCena && !semRotina && passo.anda

  let desenho = null

  if (atual) {
    desenho = (
      <Sprite
        key={cena.vez}
        gato={gato}
        animacao={atual.animacao}
        fps={atual.fps}
        vezes={atual.vezes}
        aoTerminar={() => setCena(null)}
      />
    )
  } else if (semRotina) {
    desenho = <Sprite gato={gato} animacao="idle_blink" fps={7} />
  } else if (passo.animacao) {
    desenho = (
      <Sprite
        key={`${rotina.vez}-${rotina.indice}`}
        gato={gato}
        animacao={passo.animacao}
        fps={passo.fps}
        vezes={passo.vezes}
        reverso={passo.reverso}
        className={passo.virado ? 'sprite-virado' : ''}
      />
    )
  }

  return (
    <div className="mascote-palco">
      <button
        type="button"
        className={`mascote mascote-gato${emCena ? ' mascote-uivando' : ''}`}
        aria-label={`${nome}, o mascote. Clique para ele miar`}
        title="Miau?"
        style={{
          left: POSICAO[onde],
          transition: anda ? `left ${passo.ms}ms linear` : 'none',
        }}
        onClick={clicar}
      >
        {desenho}
        <Balao acao={cena?.acao} padrao="Miau!" />
      </button>
    </div>
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
  const entristecer = useCallback(() => {
    setUivo({ acao: 'triste', vez: Date.now() })
  }, [])

  useEvento(comemora, EVENTO_CONCLUIU, comemorar)
  useEvento(comemora, EVENTO_TRISTE, entristecer)

  return (
    <button
      type="button"
      className={`mascote${
        uivo?.acao === 'triste'
          ? ' mascote-triste'
          : uivando
            ? ' mascote-uivando'
            : ''
      }`}
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
      <Balao acao={uivo?.acao} padrao="Auuu!" triste="Auu… 😢" />
    </button>
  )
}
