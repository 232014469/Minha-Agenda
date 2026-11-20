import { useCallback, useEffect, useState } from 'react'
import Sprite from '../gatinhos/Sprite'
import { avancar, iniciarRotina } from '../gatinhos/rotina'
import {
  EVENTO_CONCLUIU,
  EVENTO_FALTA,
  EVENTO_SAIU_PASSEAR,
  EVENTO_TRISTE,
  EVENTO_VOLTOU_DO_PASSEIO,
  GATOS,
} from '../gatinhos/gatos'
import { usePreferencias } from '../preferencias'
import { miar } from '../sons'
import './Mascote.css'

/**
 * O mascote do menu: o gatinho escolhido nas Configurações. Além de reagir ao
 * clique, é ele quem comemora quando uma tarefa é concluída e fica triste
 * quando não é realizada ou é excluída (se "Gatinhos pela tela" estiver
 * ligado).
 */
export default function Mascote() {
  const { mascote, sons, bordoes, gatinhos } = usePreferencias()

  return (
    <MascoteGato
      gato={mascote}
      sons={sons}
      bordoes={bordoes}
      comemora={gatinhos}
    />
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
  festa: 'Feito! 🎉',
  triste: 'Ah… 😿',
  ai: 'Ai! 😾',
  falta: 'Mais uma falta? 😾',
}

/** Com os bordões ligados, o balão fala o bordão que toca. */
const TEXTO_DO_BORDAO = {
  festa: 'É gata! ✨',
  falta: 'Eu, hein! 😾',
}

/** Balão de fala e o aviso para leitores de tela quando comemora. */
function Balao({ acao, padrao, bordoes }) {
  const texto = (bordoes && TEXTO_DO_BORDAO[acao]) || TEXTO_DO_BALAO[acao]

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

/**
 * Cada reação do gatinho: a animação, quantas vezes, o miado e, com os
 * bordões ligados, o bordão que toca no lugar do miado.
 */
const CENAS = {
  miau: { animacao: 'jump', fps: 9, vezes: '2', miado: 'clique' },
  festa: {
    animacao: 'jump',
    fps: 9,
    vezes: '3',
    miado: 'fofo',
    bordao: 'e-gata',
  },
  ai: { animacao: 'hurt', fps: 10, vezes: '3', miado: 'pedindo' },
  triste: { animacao: 'liedown', fps: 15, vezes: '1', miado: 'triste' },
  // Mais uma falta anotada: fica vermelho e reclama
  falta: {
    animacao: 'hurt',
    fps: 10,
    vezes: '3',
    miado: 'pedindo',
    bordao: 'eu-hein',
  },
}

/** Quantos cliques rápidos deixam o gatinho machucado (fica vermelho). */
const CLIQUES_SEGUIDOS = 5

/** Quem prefere menos movimento vê o gatinho só parado, piscando. */
function prefereMenosMovimento() {
  return Boolean(
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )
}

/**
 * Onde o gatinho fica: no meio do palco (no celular, perto do título, pela
 * variável --mascote-meio) ou escondido além da borda esquerda.
 */
const POSICAO = { meio: 'var(--mascote-meio, 50%)', fora: '-48px' }

/**
 * Gatinho em pixel art com uma rotina própria: fica parado piscando, senta,
 * deita e se levanta, ou sai andando pela esquerda e volta. Um clique faz ele
 * pular e miar; ao concluir uma tarefa ele comemora, e fica triste quando uma
 * tarefa não é realizada ou é excluída, e reclama quando mais uma falta é
 * anotada. Muitos cliques seguidos: ele se
 * machuca e fica vermelho. As reações interrompem a rotina, que recomeça
 * depois. Quando sai para passear pela borda de baixo da tela, deixa o menu
 * e só volta no fim do passeio.
 */
function MascoteGato({ gato, sons, bordoes, comemora }) {
  const [cena, setCena] = useState(null)
  const [rotina, setRotina] = useState(() => iniciarRotina('parado'))
  const [semRotina] = useState(prefereMenosMovimento)
  const [passeando, setPasseando] = useState(false)
  const passo = rotina.passos[rotina.indice]

  useEffect(() => {
    if (cena || semRotina || passo.ms === null) return undefined

    const espera = setTimeout(() => setRotina(avancar), passo.ms)

    return () => clearTimeout(espera)
  }, [cena, semRotina, passo])
  const [cliques, setCliques] = useState([])
  const nome = GATOS.find((item) => item.id === gato)?.nome ?? 'Gatinho'

  const encenar = useCallback(
    (acao) => {
      if (passeando) return

      setCena({ acao, vez: Date.now() })
      setRotina(iniciarRotina('parado'))
      if (sons) {
        const { miado, bordao } = CENAS[acao]

        miar((bordoes && bordao) || miado, {
          volume: acao === 'miau' || (bordoes && bordao) ? 0.8 : 0.6,
        })
      }
    },
    [sons, bordoes, passeando],
  )
  const sairPassear = useCallback(() => {
    setPasseando(true)
    setCena(null)
    setRotina(iniciarRotina('sair'))
  }, [])
  const voltarDoPasseio = useCallback(() => {
    setPasseando(false)
    setRotina(iniciarRotina('voltar'))
  }, [])
  const comemorar = useCallback(() => encenar('festa'), [encenar])
  const entristecer = useCallback(() => encenar('triste'), [encenar])
  const reclamar = useCallback(() => encenar('falta'), [encenar])

  useEvento(comemora, EVENTO_CONCLUIU, comemorar)
  useEvento(comemora, EVENTO_TRISTE, entristecer)
  useEvento(comemora, EVENTO_FALTA, reclamar)
  useEvento(true, EVENTO_SAIU_PASSEAR, sairPassear)
  useEvento(true, EVENTO_VOLTOU_DO_PASSEIO, voltarDoPasseio)

  function clicar() {
    const agora = Date.now()
    const recentes = [...cliques, agora].filter((vez) => agora - vez < 3000)

    if (recentes.length >= CLIQUES_SEGUIDOS) {
      setCliques([])
      encenar('ai')
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
        className={`mascote mascote-gato${emCena ? ' mascote-reagindo' : ''}`}
        aria-label={`${nome}, o mascote. Clique para ele miar`}
        title="Miau?"
        tabIndex={passeando ? -1 : undefined}
        style={{
          left: POSICAO[onde],
          transition: anda ? `left ${passo.ms}ms linear` : 'none',
        }}
        onClick={clicar}
      >
        {desenho}
        <Balao acao={cena?.acao} padrao="Miau!" bordoes={sons && bordoes} />
      </button>
    </div>
  )
}
