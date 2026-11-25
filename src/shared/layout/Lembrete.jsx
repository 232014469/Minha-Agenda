import { useEffect, useId, useRef, useState } from 'react'
import JanelaNaPagina from '../components/JanelaNaPagina'
import { APP } from '../../config/app'
import { EVENTO_EXTRAS_RECEBIDOS, marcarExtra } from '../../sync/extras'
import './Lembrete.css'

const CHAVE = `${APP.chaveDosDados}.lembrete`
// Teto de letras; na prática o limite é o que cabe no papel (ver Bilhete)
const LIMITE_DO_LEMBRETE = 200
/** Quantos lembretes cabem na pilha. */
const MAXIMO_DE_LEMBRETES = 5
/** Quanto dura o bilhete amassando e caindo na lixeira (ver o CSS). */
const AMASSAR_MS = 760

/** Dá para animar o descarte? (sem matchMedia ou com menos movimento, não) */
function podeAnimar() {
  return (
    typeof window.matchMedia === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Os lembretes guardados: uma lista de textos (em JSON). Um texto solto é o
 * formato antigo, de um lembrete só. Sempre volta pelo menos um (em branco).
 */
function lerLembretes() {
  let guardado = ''

  try {
    guardado = localStorage.getItem(CHAVE) ?? ''
  } catch {
    // Sem armazenamento: fica em branco
  }

  try {
    const lista = JSON.parse(guardado)

    if (Array.isArray(lista)) {
      const textos = lista
        .filter((texto) => typeof texto === 'string')
        .slice(0, MAXIMO_DE_LEMBRETES)

      return textos.length ? textos : ['']
    }
  } catch {
    // Não é JSON: é o lembrete único de antes
  }

  return [guardado]
}

/** Como guardar: sem os em branco; nenhum escrito vira texto vazio. */
function guardarComo(lista) {
  const escritos = lista.filter((texto) => texto.trim())

  return escritos.length ? JSON.stringify(escritos) : ''
}

/**
 * Pilha de lembretes: até 5 bilhetinhos presos com fita no alto do menu. O
 * da frente é o que dá para ler e escrever; os outros aparecem atrás, e as
 * setinhas trocam qual fica na frente. Para jogar um fora, toca na lixeira:
 * ela cresce, o bilhete amassa e cai dentro, e libera espaço para o
 * próximo. Tudo é salvo sozinho e vai para os outros aparelhos na
 * sincronização. No celular, `compacto`, vira uma faixa em cima do título;
 * tocar nela abre a pilha por cima da página, como o dia na Agenda.
 */
export default function Lembrete({ compacto = false }) {
  const [lista, setLista] = useState(lerLembretes)
  const [atual, setAtual] = useState(0)
  // Muda a cada bilhete jogado fora ou criado: o da frente começa do zero
  const [vez, setVez] = useState(0)
  const [focarNovo, setFocarNovo] = useState(false)
  const id = useId()
  const frente = Math.min(atual, lista.length - 1)

  // Guarda ao escrever; só uma mudança de verdade vai para os outros
  // aparelhos (abrir os lembretes vazios não conta como escrever nada)
  useEffect(() => {
    try {
      const novo = guardarComo(lista)

      // (o formato antigo, de texto solto, também conta como igual)
      if (guardarComo(lerLembretes()) === novo) return
      localStorage.setItem(CHAVE, novo)
      marcarExtra('lembrete')
    } catch {
      // Sem armazenamento: vale só até fechar a página.
    }
  }, [lista])

  // Escreveram lembretes em outro aparelho: mostra os de lá
  useEffect(() => {
    function reler(evento) {
      if (evento.detail?.includes('lembrete')) setLista(lerLembretes())
    }

    window.addEventListener(EVENTO_EXTRAS_RECEBIDOS, reler)

    return () => window.removeEventListener(EVENTO_EXTRAS_RECEBIDOS, reler)
  }, [])

  function escrever(texto) {
    setLista((atuais) =>
      atuais.map((item, posicao) =>
        posicao === frente ? texto.slice(0, LIMITE_DO_LEMBRETE) : item,
      ),
    )
  }

  function novo() {
    if (lista.length >= MAXIMO_DE_LEMBRETES) return
    setLista((atuais) => [...atuais, ''])
    setAtual(lista.length)
    setVez((v) => v + 1)
    setFocarNovo(true)
  }

  function jogarFora() {
    setLista((atuais) => {
      const sobra = atuais.filter((_, posicao) => posicao !== frente)

      return sobra.length ? sobra : ['']
    })
    setAtual((posicao) => Math.max(0, Math.min(posicao, lista.length - 2)))
    setVez((v) => v + 1)
    setFocarNovo(false)
  }

  function andar(passo) {
    setAtual((frente + passo + lista.length) % lista.length)
    setFocarNovo(false)
  }

  const pilha = (fechar) => (
    <Pilha
      id={id}
      lista={lista}
      frente={frente}
      vez={vez}
      escrever={escrever}
      novo={novo}
      jogarFora={jogarFora}
      andar={andar}
      focar={focarNovo || (compacto && !lista[frente])}
      pronto={fechar}
    />
  )

  // Celular: a pilha aberta por cima da página (de onde a faixa estava)
  const [aberto, setAberto] = useState(null)

  if (!compacto) return pilha()

  const escritos = lista.filter((texto) => texto.trim())
  const primeiro = escritos[0] ?? ''

  return (
    <>
      <button
        type="button"
        className="lembrete-compacto"
        aria-label={
          primeiro
            ? `Lembrete: ${primeiro}${escritos.length > 1 ? ` (e mais ${escritos.length - 1})` : ''}`
            : 'Escrever um lembrete'
        }
        aria-haspopup="dialog"
        onClick={(evento) =>
          setAberto(evento.currentTarget.getBoundingClientRect())
        }
      >
        <span className="lembrete-alfinete" aria-hidden="true" />
        <span
          className={`lembrete-compacto-texto${primeiro ? '' : ' vazio'}`}
          aria-hidden="true"
        >
          {primeiro || 'Escreva um lembrete…'}
        </span>
        {escritos.length > 1 && (
          <span className="lembrete-compacto-quantos" aria-hidden="true">
            {escritos.length}
          </span>
        )}
        <span className="lembrete-compacto-abrir" aria-hidden="true">
          ⤢
        </span>
      </button>
      {aberto && (
        <JanelaNaPagina
          origem={aberto}
          largura={320}
          rotulo="Bilhete de lembrete"
          className="lembrete-janela"
          aoFechar={() => setAberto(null)}
        >
          {(fechar) => pilha(() => fechar())}
        </JanelaNaPagina>
      )}
    </>
  )
}

/**
 * A pilha: as folhas de trás, o bilhete da frente (com a lixeira no
 * canto) e os controles embaixo.
 */
function Pilha({
  id,
  lista,
  frente,
  vez,
  escrever,
  novo,
  jogarFora,
  andar,
  focar,
  pronto,
}) {
  const atras = lista.length - 1

  return (
    <div className="lembrete-pilha">
      <div className="lembrete-pilha-folhas">
        {Array.from({ length: atras }, (_, posicao) => (
          <span
            key={posicao}
            className="lembrete-folha-atras"
            style={{ '--atras': posicao + 1 }}
            aria-hidden="true"
          />
        ))}
        <Bilhete
          key={`${frente}-${vez}`}
          id={id}
          texto={lista[frente]}
          escrever={escrever}
          jogarFora={jogarFora}
          focar={focar}
          chegando={vez > 0}
        />
      </div>
      <div className="lembrete-controles">
        {lista.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Lembrete anterior"
              onClick={() => andar(-1)}
            >
              ‹
            </button>
            <span className="lembrete-qual" aria-live="polite">
              {frente + 1} de {lista.length}
            </span>
            <button
              type="button"
              aria-label="Próximo lembrete"
              onClick={() => andar(1)}
            >
              ›
            </button>
          </>
        )}
        <button
          type="button"
          className="lembrete-novo"
          aria-label="Novo lembrete"
          title={
            lista.length >= MAXIMO_DE_LEMBRETES
              ? 'Já são 5: jogue um fora para escrever outro'
              : 'Novo lembrete'
          }
          disabled={lista.length >= MAXIMO_DE_LEMBRETES}
          onClick={novo}
        >
          +
        </button>
        {pronto && (
          <button type="button" className="lembrete-pronto" onClick={pronto}>
            Pronto
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * O bilhetinho da frente: fita, título e o texto. O papel tem tamanho fixo
 * (6 linhas): o que não cabe não entra, para nunca precisar rolar. A
 * lixeira fica no canto, fora do papel (para não amassar junto): tocada, ela
 * cresce e abre a tampa, e o bilhete amassa numa bolinha que cai dentro.
 */
function Bilhete({ id, texto, escrever, jogarFora, focar, chegando }) {
  const [cheio, setCheio] = useState(false)
  const [saindo, setSaindo] = useState(null)
  const papel = useRef(null)
  const lixeira = useRef(null)

  function mudar(evento) {
    const campo = evento.target
    const novoTexto = campo.value

    // Passou do papel (e está crescendo)? Não entra; o campo volta ao texto
    // de antes. Apagar sempre pode.
    if (
      novoTexto.length > texto.length &&
      campo.scrollHeight > campo.clientHeight
    ) {
      setCheio(true)
      return
    }

    setCheio(false)
    escrever(novoTexto)
  }

  function jogar() {
    if (saindo) return
    if (!podeAnimar()) {
      jogarFora()
      return
    }

    // Quanto a bolinha anda: do meio do papel até o meio da lixeira
    const de = papel.current.getBoundingClientRect()
    const para = lixeira.current.getBoundingClientRect()

    setSaindo({
      x: para.left + para.width / 2 - (de.left + de.width / 2),
      y: para.top + para.height / 2 - (de.top + de.height / 2),
    })
    setTimeout(jogarFora, AMASSAR_MS)
  }

  return (
    <>
      {/* O voo vai em duas camadas: esta leva a bolinha para o lado (num
          ritmo constante) e o papel sobe e cai, o que desenha um arco */}
      <div
        className={`lembrete-voo${saindo ? ' saindo' : ''}`}
        style={
          saindo
            ? { '--ate-x': `${saindo.x}px`, '--ate-y': `${saindo.y}px` }
            : undefined
        }
      >
        <section
          ref={papel}
          className={`lembrete${saindo ? ' saindo' : chegando ? ' chegando' : ''}`}
          aria-label="Quadro de lembrete"
        >
          <span className="lembrete-fita" aria-hidden="true" />
          <label className="lembrete-titulo" htmlFor={id}>
            Lembrete
          </label>
          <textarea
            id={id}
            value={texto}
            onChange={mudar}
            maxLength={LIMITE_DO_LEMBRETE}
            rows={6}
            autoFocus={focar}
            placeholder="Escreva aqui o que não pode esquecer…"
          />
          <span
            className={`lembrete-contador${cheio ? ' cheio' : ''}`}
            role={cheio ? 'status' : undefined}
          >
            {cheio ? 'Papel cheio' : ''}
          </span>
        </section>
      </div>
      <button
        ref={lixeira}
        type="button"
        className={`lembrete-lixo${saindo ? ' aberta' : ''}`}
        aria-label="Jogar este lembrete fora"
        title="Jogar fora"
        onClick={jogar}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <g className="lembrete-lixo-tampa">
            <path d="M4 6.5h16" />
            <path d="M9.5 6.5V4.5h5v2" />
          </g>
          <path className="lembrete-lixo-corpo" d="M6 6.5l1 14h10l1-14" />
          <path d="M10.2 10.5v6.5M13.8 10.5v6.5" />
        </svg>
      </button>
    </>
  )
}
