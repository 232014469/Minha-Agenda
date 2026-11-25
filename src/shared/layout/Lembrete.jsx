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
/** Quanto arrastar (em px) para o bilhete ir para o lixo. */
const DISTANCIA_PARA_JOGAR_FORA = 90
/** Quanto dura o bilhete voando para fora (ver o CSS). */
const VOO_MS = 320

/** Dá para animar o voo? (sem matchMedia ou com menos movimento, não) */
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
 * setinhas trocam qual fica na frente. Para jogar um fora, é só arrastar o
 * bilhete para longe (ou usar a lixeira): ele voa e libera espaço para o
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
 * A pilha: as folhas de trás, o bilhete da frente (que dá para arrastar
 * pela fita para jogar fora) e os controles embaixo.
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
 * (6 linhas): o que não cabe não entra, para nunca precisar rolar. Arrastado
 * pela fita (ou pelo papel, fora do texto) para longe, ele voa para o lixo;
 * solto perto, volta para o lugar.
 */
function Bilhete({ id, texto, escrever, jogarFora, focar }) {
  const [cheio, setCheio] = useState(false)
  const [arrasto, setArrasto] = useState(null)
  const [saindo, setSaindo] = useState(null)
  const inicio = useRef(null)

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

  function jogar(direcao = { x: 1, y: -0.3 }) {
    if (!podeAnimar()) {
      jogarFora()
      return
    }
    setSaindo(direcao)
    setTimeout(jogarFora, VOO_MS)
  }

  function pegar(evento) {
    if (saindo || evento.target.closest('textarea, button')) return
    inicio.current = { x: evento.clientX, y: evento.clientY }
    evento.currentTarget.setPointerCapture?.(evento.pointerId)
    setArrasto({ x: 0, y: 0 })
  }

  function mover(evento) {
    if (!inicio.current) return
    setArrasto({
      x: evento.clientX - inicio.current.x,
      y: evento.clientY - inicio.current.y,
    })
  }

  function soltar() {
    if (!inicio.current) return
    inicio.current = null

    const distancia = Math.hypot(arrasto?.x ?? 0, arrasto?.y ?? 0)

    if (distancia >= DISTANCIA_PARA_JOGAR_FORA) {
      jogar({ x: arrasto.x / distancia, y: arrasto.y / distancia })
    }
    setArrasto(null)
  }

  const longe =
    arrasto && Math.hypot(arrasto.x, arrasto.y) >= DISTANCIA_PARA_JOGAR_FORA

  const estilo = saindo
    ? { '--voa-x': `${saindo.x * 260}px`, '--voa-y': `${saindo.y * 260}px` }
    : arrasto
      ? {
          transform: `translate(${arrasto.x}px, ${arrasto.y}px) rotate(${arrasto.x / 12}deg)`,
        }
      : undefined

  return (
    <section
      className={`lembrete${arrasto ? ' arrastando' : ''}${longe ? ' longe' : ''}${saindo ? ' saindo' : ''}`}
      aria-label="Quadro de lembrete"
      style={estilo}
      onPointerDown={pegar}
      onPointerMove={mover}
      onPointerUp={soltar}
      onPointerCancel={soltar}
      title="Arraste para longe para jogar fora"
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
      <div className="lembrete-rodape">
        <span
          className={`lembrete-contador${cheio ? ' cheio' : ''}`}
          role={cheio ? 'status' : undefined}
        >
          {longe ? 'Solte para jogar fora' : cheio ? 'Papel cheio' : ''}
        </span>
        <button
          type="button"
          className="lembrete-lixo"
          aria-label="Jogar este lembrete fora"
          title="Jogar fora"
          onClick={() => jogar()}
        >
          🗑
        </button>
      </div>
    </section>
  )
}
