import { useCallback, useEffect, useRef, useState } from 'react'
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
import Casinha from './Casinha'
import './Mascote.css'

/**
 * O mascote do menu: o gatinho escolhido nas Configurações. Além de reagir ao
 * clique, é ele quem comemora quando uma tarefa é concluída e fica triste
 * quando não é realizada ou é excluída (se "Gatinhos pela tela" estiver
 * ligado). `noMenu`: no menu do computador ele mora num cestinho e pode
 * explorar o menu todo (pular perto dos links e subir pela parede).
 */
export default function Mascote({ noMenu = false }) {
  const { mascote, sons, bordoes, gatinhos } = usePreferencias()

  return (
    <MascoteGato
      gato={mascote}
      sons={sons}
      bordoes={bordoes}
      comemora={gatinhos}
      noMenu={noMenu}
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
  triste: {
    animacao: 'liedown',
    fps: 15,
    vezes: '1',
    miado: 'triste',
    ergue: 9,
  },
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
const POSICAO = {
  meio: 'var(--mascote-meio, 50%)',
  chao: 'var(--mascote-meio, 50%)',
  fora: '-48px',
}

/** Tamanho do cestinho na tela (26 × 10 pixels de 3px, ver Casinha). */
const CESTINHO = { largura: 78, altura: 30 }

/** Altura dos pés do gatinho dentro do botão de 64px (o desenho fica no meio). */
const PES = 43

/** Como o gatinho se move entre dois lugares: pulo para baixo, para cima ou reto. */
const CURVAS = {
  cai: 'cubic-bezier(0.55, 0, 1, 0.45)',
  sobe: 'cubic-bezier(0, 0.55, 0.45, 1)',
}

/**
 * Onde fica o gatinho. Sem mapa (celular ou antes de medir), só a posição
 * de lado; no menu, um ponto (x, pés) medido na tela: a casinha, fora da
 * borda, ao lado de um link ou na parede direita.
 */
function posicao(onde, mapa, ergue = 0) {
  if (!mapa) return { left: POSICAO[onde] ?? POSICAO.meio }

  const { largura, casa, links } = mapa
  const [lugar, numero] = onde.split(':')
  const alturaDoLink = links[Number(numero)] ?? casa.y
  const pontos = {
    meio: [casa.x, casa.y - ergue],
    // Fora do cestinho, os pés ficam no chão (na base do cesto)
    chao: [casa.x - 52, casa.base - 2],
    fora: [-48, casa.base - 2],
    link: [largura - 50, alturaDoLink],
    parede: [largura - 14, alturaDoLink],
    'parede-alto': [largura - 14, casa.y - 4],
  }
  const [x, y] = pontos[lugar] ?? pontos.meio

  return { left: `${x}px`, top: `${y - PES}px` }
}

/**
 * Mede o menu para o gatinho saber onde estão a casinha e os links. Só no
 * menu do computador; refaz quando o menu muda de tamanho.
 */
function useMapaDoMenu(ativo, palcoRef, casaRef) {
  const [mapa, setMapa] = useState(null)

  useEffect(() => {
    const palco = palcoRef.current

    if (!ativo || !palco || typeof ResizeObserver === 'undefined') {
      return undefined
    }

    function medir() {
      const caixa = palco.getBoundingClientRect()
      const casa = casaRef.current?.getBoundingClientRect()

      if (!caixa.width || !casa?.width) {
        setMapa(null)
        return
      }

      const links = [
        ...(palco.closest('nav')?.querySelectorAll('.layout-links a') ?? []),
      ].map((link) => link.getBoundingClientRect().bottom - caixa.top - 6)

      setMapa({
        largura: caixa.width,
        casa: {
          x: casa.left + casa.width / 2 - caixa.left,
          // Pés dentro do cestinho: a frente dele cobre a barriga do gatinho
          y: casa.bottom - caixa.top - 8,
          base: casa.bottom - caixa.top,
        },
        links,
      })
    }

    const observador = new ResizeObserver(medir)

    observador.observe(palco)

    return () => observador.disconnect()
  }, [ativo, palcoRef, casaRef])

  return mapa
}

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
function MascoteGato({ gato, sons, bordoes, comemora, noMenu }) {
  const [cena, setCena] = useState(null)
  const [rotina, setRotina] = useState(() => iniciarRotina('parado'))
  const [semRotina] = useState(prefereMenosMovimento)
  const [passeando, setPasseando] = useState(false)
  const palcoRef = useRef(null)
  const casaRef = useRef(null)
  const mapa = useMapaDoMenu(noMenu, palcoRef, casaRef)
  const quantosLinks = mapa?.links.length ?? 0
  const passo = rotina.passos[rotina.indice]

  useEffect(() => {
    if (cena || semRotina || passo.ms === null) return undefined

    const espera = setTimeout(
      () =>
        setRotina((atual) =>
          avancar(atual, Math.random, { links: quantosLinks }),
        ),
      passo.ms,
    )

    return () => clearTimeout(espera)
  }, [cena, semRotina, passo, quantosLinks])
  const [cliques, setCliques] = useState([])
  const nome = GATOS.find((item) => item.id === gato)?.nome ?? 'Gatinho'

  const encenar = useCallback(
    (acao) => {
      if (passeando) return

      setCena({ acao, vez: Date.now() })
      // Explorando o menu, reage onde está e depois continua o caminho.
      setRotina((atual) =>
        atual.nome === 'explorar' ? atual : iniciarRotina('parado'),
      )
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
  const onde = semRotina ? 'meio' : passo.onde
  const anda = !emCena && !semRotina && passo.anda
  let transicao = 'none'

  if (anda && mapa) {
    transicao = `left ${passo.ms}ms linear, top ${passo.ms}ms ${
      CURVAS[passo.curva] ?? 'linear'
    }`
  } else if (anda) {
    transicao = `left ${passo.ms}ms linear`
  }

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

  const botao = (
    <button
      type="button"
      className={`mascote mascote-gato${emCena ? ' mascote-reagindo' : ''}`}
      aria-label={`${nome}, o mascote. Clique para ele miar`}
      title="Miau?"
      tabIndex={passeando ? -1 : undefined}
      style={{
        ...posicao(
          onde,
          mapa,
          emCena ? (atual.ergue ?? 0) : (passo.ergue ?? 0),
        ),
        transition: transicao,
      }}
      onClick={clicar}
    >
      {desenho}
      <Balao acao={cena?.acao} padrao="Miau!" bordoes={sons && bordoes} />
    </button>
  )

  if (!noMenu) return <div className="mascote-palco">{botao}</div>

  return (
    <>
      <div className="mascote-casa" ref={casaRef}>
        <Casinha />
      </div>
      <div
        className={`mascote-palco mascote-palco-menu${mapa ? ' medido' : ''}`}
        ref={palcoRef}
      >
        {botao}
        {mapa && (
          <Casinha
            frente
            className="cestinho-frente"
            style={{
              left: `${mapa.casa.x - CESTINHO.largura / 2}px`,
              top: `${mapa.casa.base - CESTINHO.altura}px`,
            }}
          />
        )}
      </div>
    </>
  )
}
