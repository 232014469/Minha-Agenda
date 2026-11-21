import { useCallback, useEffect, useRef, useState } from 'react'
import Sprite from '../gatinhos/Sprite'
import { avancar, iniciarRotina } from '../gatinhos/rotina'
import {
  EVENTO_CONCLUIU,
  EVENTO_FALTA,
  EVENTO_TRISTE,
  GATOS,
} from '../gatinhos/gatos'
import { usePreferencias } from '../preferencias'
import { miar } from '../sons'
import Casinha from './Casinha'
import BarraFelicidade from './BarraFelicidade'
import Quintal from './Quintal'
import Tamagotchi from './Tamagotchi'
import { EVENTO_CUIDADO } from '../gatinhos/bichinho'
import './Mascote.css'

/**
 * O mascote do menu: o gatinho escolhido nas Configurações. Além de reagir ao
 * clique, é ele quem comemora quando uma tarefa é concluída e fica triste
 * quando não é realizada ou é excluída (se "Gatinhos pela tela" estiver
 * ligado). `noMenu`: no menu do computador ele mora numa casinha e pode
 * subir pela parede do lado dela e pular de volta.
 */
export default function Mascote({
  noMenu = false,
  chuva = false,
  bichinho = null,
}) {
  const { mascote, sons, bordoes, gatinhos } = usePreferencias()

  return (
    <MascoteGato
      gato={mascote}
      sons={sons}
      bordoes={bordoes}
      comemora={gatinhos}
      noMenu={noMenu}
      chuva={chuva}
      bichinho={bichinho}
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
  carinho: 'Prrr ♥',
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
  // Carinho pelo botão do bichinho: pulinho feliz
  carinho: { animacao: 'jump', fps: 9, vezes: '2', miado: 'fofo' },
  // Mais uma falta anotada: fica vermelho e reclama
  falta: {
    animacao: 'hurt',
    fps: 10,
    vezes: '3',
    miado: 'pedindo',
    bordao: 'eu-hein',
  },
}

/** Classe do gatinho conforme a fase do bichinho virtual. */
function classeDaFase(situacao) {
  if (!situacao) return ''

  return [
    situacao.fase === 'filhote' && 'gato-filhote',
    situacao.forma && `gato-${situacao.forma}`,
    situacao.doente && 'gato-doente',
  ]
    .filter(Boolean)
    .join(' ')
}

/** Texto no alto da telinha: fase, idade e se está doente. */
function textoDoStatus({ fase, forma, doente, idade }) {
  if (fase === 'ovo') return 'Chocando...'
  if (fase === 'estrelinha') return 'Estrelinha'

  const nomeDaFase = {
    filhote: 'Filhote',
    bonitinho: 'Bonitinho',
    largado: 'Largado',
  }[forma ?? fase]

  return `${doente ? 'Doente' : nomeDaFase} · dia ${idade}`
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
  'frente-porta': 'var(--mascote-meio, 50%)',
  dentro: 'var(--mascote-meio, 50%)',
  cochilo: 'var(--mascote-meio, 50%)',
  pote: 'var(--mascote-meio, 50%)',
  'brinca-esq': 'var(--mascote-meio, 50%)',
  'brinca-dir': 'var(--mascote-meio, 50%)',
}

/** Altura dos pés do gatinho dentro do botão de 64px (o desenho fica no meio). */
const PES = 43

/** Como o gatinho se move entre dois lugares: pulo para baixo, para cima ou reto. */
const CURVAS = {
  cai: 'cubic-bezier(0.55, 0, 1, 0.45)',
  sobe: 'cubic-bezier(0, 0.55, 0.45, 1)',
}

/**
 * Onde fica o gatinho. Sem mapa (celular ou antes de medir), só a posição
 * de lado; no menu, um ponto (x, pés) medido na tela: a casinha, as pontas do
 * quintal, os potinhos ou a parede de fora.
 */
function posicao(onde, mapa) {
  if (!mapa) return { left: POSICAO[onde] ?? POSICAO.meio }

  const { casa } = mapa
  const pontos = {
    meio: [casa.x, casa.y],
    // Dia de chuva: logo antes da porta e lá dentro (atrás da parede)
    'frente-porta': [casa.esquerda + casa.largura * 0.82 + 20, casa.y],
    dentro: [casa.porta - 24, casa.y],
    // Dormindo deitado lá dentro: o corpo fica atrás da parede e só a cabeça
    // aparece na porta
    cochilo: [casa.esquerda + 53, casa.y],
    // Na frente dos potinhos do quintal, do lado esquerdo da casinha
    pote: [casa.esquerda - 8, casa.y],
    // Pontas do quintal, para brincar com os bichinhos
    'brinca-esq': [casa.esquerda + casa.largura / 2 - 70, casa.y],
    'brinca-dir': [casa.esquerda + casa.largura / 2 + 62, casa.y],
    // Parede de fora da casinha (lado esquerdo): as costas do gatinho
    // encostam na parede (4px dentro do desenho); sobe e de lá pula para o
    // chão ao lado.
    lateral: [casa.esquerda - 4, casa.y],
    // Um pouco acima, ainda na parede: o comecinho da escalada
    'lateral-alto': [casa.esquerda - 4, casa.y - 10],
    'chao-esq': [casa.esquerda - 34, casa.y],
  }
  const [x, y] = pontos[onde] ?? pontos.meio

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
      // A casinha em si (não a faixa inteira em volta dela)
      const casa = casaRef.current
        ?.querySelector('.casinha')
        ?.getBoundingClientRect()

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
          // Na frente da porta (colunas 33 a 40 de 50 do desenho)
          x: casa.left + casa.width * 0.73 - caixa.left,
          y: casa.bottom - caixa.top - 2,
          base: casa.bottom - caixa.top,
          esquerda: casa.left - caixa.left,
          largura: casa.width,
          // Borda esquerda da porta (coluna 33 de 50 do desenho)
          porta: casa.left + casa.width * 0.66 - caixa.left,
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
 * depois.
 */
function MascoteGato({
  gato,
  sons,
  bordoes,
  comemora,
  noMenu,
  chuva,
  bichinho,
}) {
  const felicidade = bichinho?.felicidade ?? null
  const situacao = bichinho?.situacao ?? null
  // Doente, fica quietinho como quando está tristinho
  const humor = situacao?.doente ? 'triste' : (felicidade?.nivel ?? 'feliz')
  const [cena, setCena] = useState(null)
  const [rotina, setRotina] = useState(() => iniciarRotina('parado'))
  const [semRotina] = useState(prefereMenosMovimento)
  const palcoRef = useRef(null)
  const casaRef = useRef(null)
  const mapa = useMapaDoMenu(noMenu, palcoRef, casaRef)
  const quantosLinks = mapa?.links.length ?? 0
  // Só dorme na chuva quando tem casinha (menu do computador)
  const dormeNaChuva = Boolean(mapa) && chuva
  const passo = rotina.passos[rotina.indice]
  // Reação que chegou com ele dentro da casinha: acontece depois que sair
  const [cenaDepois, setCenaDepois] = useState(null)
  const dentroDeCasa = rotina.nome === 'dormir' || rotina.nome === 'dormindo'
  const saindoDeCasa =
    rotina.nome === 'acordar' && rotina.indice === rotina.passos.length - 1

  useEffect(() => {
    if (cena || semRotina || passo.ms === null) return undefined

    const espera = setTimeout(() => {
      if (saindoDeCasa && cenaDepois) {
        setCena({ acao: cenaDepois, vez: Date.now() })
        setCenaDepois(null)
      }

      setRotina((atual) =>
        avancar(atual, Math.random, {
          links: quantosLinks,
          chuva: dormeNaChuva,
          humor,
        }),
      )
    }, passo.ms)

    return () => clearTimeout(espera)
  }, [
    cena,
    semRotina,
    passo,
    quantosLinks,
    dormeNaChuva,
    humor,
    saindoDeCasa,
    cenaDepois,
  ])
  const [cliques, setCliques] = useState([])
  const nome = GATOS.find((item) => item.id === gato)?.nome ?? 'Gatinho'

  const encenar = useCallback(
    (acao) => {
      if (dentroDeCasa) {
        // Dentro da casinha: primeiro sai pela borda da parede, depois reage
        setCenaDepois(acao)
        setRotina(iniciarRotina('acordar'))
      } else {
        setCena({ acao, vez: Date.now() })
        // Explorando o menu, reage onde está e depois continua o caminho.
        setRotina((atual) =>
          atual.nome === 'explorar' ? atual : iniciarRotina('parado'),
        )
      }
      if (sons) {
        const { miado, bordao } = CENAS[acao]

        miar((bordoes && bordao) || miado, {
          volume: acao === 'miau' || (bordoes && bordao) ? 0.8 : 0.6,
        })
      }
    },
    [sons, bordoes, dentroDeCasa],
  )
  const comemorar = useCallback(() => encenar('festa'), [encenar])
  const entristecer = useCallback(() => encenar('triste'), [encenar])
  const reclamar = useCallback(() => encenar('falta'), [encenar])

  // Botões do bichinho: comida e brincadeira viram rotinas (saindo da
  // casinha antes, se estiver lá dentro); carinho é uma reação
  const cuidarDele = useCallback(
    (evento) => {
      const acao = evento.detail

      if (acao === 'carinho') {
        encenar('carinho')
        return
      }

      setCena(null)
      setRotina(
        dentroDeCasa
          ? { ...iniciarRotina('acordar'), depois: acao }
          : iniciarRotina(acao),
      )
      if (sons) miar('fofo', { volume: 0.6 })
    },
    [encenar, dentroDeCasa, sons],
  )

  useEvento(noMenu, EVENTO_CUIDADO, cuidarDele)
  useEvento(comemora, EVENTO_CONCLUIU, comemorar)
  useEvento(comemora, EVENTO_TRISTE, entristecer)
  useEvento(comemora, EVENTO_FALTA, reclamar)

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
      className={`mascote mascote-gato${emCena ? ' mascote-reagindo' : ''}${
        classeDaFase(situacao) ? ` ${classeDaFase(situacao)}` : ''
      }`}
      aria-label={`${nome}, o mascote. Clique para ele miar`}
      title="Miau?"
      style={{
        ...posicao(onde, mapa),
        transition: transicao,
      }}
      onClick={clicar}
    >
      {desenho}
      <Balao acao={cena?.acao} padrao="Miau!" bordoes={sons && bordoes} />
    </button>
  )

  if (!noMenu) return <div className="mascote-palco">{botao}</div>

  const fase = situacao?.fase
  let bicho = botao

  if (fase === 'ovo') {
    bicho = (
      <button
        type="button"
        className="mascote mascote-gato mascote-ovo"
        aria-label="Ovo do gatinho. Clique para chocar"
        title="Chocando... clique para ajudar"
        style={posicao('meio', mapa)}
        onClick={bichinho.chocarOvo}
      >
        <span className="mascote-ovo-casca" />
      </button>
    )
  } else if (fase === 'estrelinha') {
    bicho = (
      <span
        className="mascote mascote-gato mascote-estrelinha"
        style={posicao('meio', mapa)}
      >
        <Sprite gato={gato} animacao="idle_blink" fps={5} />
      </span>
    )
  }

  return (
    <Tamagotchi
      fase={fase}
      comFome={situacao?.comFome}
      aoCuidar={bichinho?.cuidar}
    >
      <div className="tamagotchi-tela">
        {situacao && fase !== 'estrelinha' && (
          <p className="tamagotchi-status">{textoDoStatus(situacao)}</p>
        )}
        {fase === 'estrelinha' && (
          <div className="tamagotchi-estrelinha" role="status">
            <p>{nome} virou estrelinha ✨</p>
            <button type="button" onClick={bichinho.recomecar}>
              Chocar outro ovo
            </button>
          </div>
        )}
        <div className="mascote-casa" ref={casaRef}>
          <Quintal
            chuva={chuva}
            humor={humor}
            brincando={rotina.nome === 'brincar' ? rotina.vez : null}
          />
          <Casinha />
        </div>
        {felicidade && <BarraFelicidade felicidade={felicidade} />}
        <div
          className={`mascote-palco mascote-palco-menu${mapa ? ' medido' : ''}`}
          ref={palcoRef}
        >
          {bicho}
          {mapa && !fase?.match(/ovo|estrelinha/) && passo.atras && !emCena && (
            <Casinha
              frente
              style={{
                left: `${mapa.casa.esquerda}px`,
                top: `${mapa.casa.base - 64}px`,
              }}
            />
          )}
          {mapa && !fase?.match(/ovo|estrelinha/) && passo.dorme && !emCena && (
            <span
              className="casinha-zzz"
              aria-hidden="true"
              style={{
                left: `${mapa.casa.esquerda + mapa.casa.largura * 0.96}px`,
                top: `${mapa.casa.y - 34}px`,
              }}
            >
              <span>Z</span>
              <span>Z</span>
              <span>Z</span>
            </span>
          )}
        </div>
      </div>
    </Tamagotchi>
  )
}
