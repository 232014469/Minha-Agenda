import { useEffect, useRef, useState } from 'react'
import { useDados } from '../../dados/useDados'
import { ehAtrasada } from '../../features/agenda/agendaUtils'
import { EVENTO_ALERTA_POSTIT } from '../gatinhos/gatos'
import { usePreferencias } from '../preferencias'
import { miar } from '../sons'
import { tarefasUrgentes } from './alerta'
import './AlertaPodeNao.css'

const CHAVE_SESSAO = 'wolf-study.alerta-pode-nao'

/** Quanto tempo a frase fica no meio da tela antes de voar para o post-it. */
const TEMPO_NO_MEIO = 1900
/** Sem som liberado, espera um toque por até este tempo. */
const TEMPO_ESPERANDO_TOQUE = 6000
const TEMPO_VOANDO = 750

function resumir(urgentes) {
  const atrasadas = urgentes.filter((tarefa) => ehAtrasada(tarefa)).length
  const hoje = urgentes.length - atrasadas
  const partes = []

  if (atrasadas) {
    partes.push(`${atrasadas} ${atrasadas === 1 ? 'atrasada' : 'atrasadas'}`)
  }
  if (hoje) partes.push(`${hoje} para hoje`)

  return partes.join(' · ')
}

function chaveDeHoje(hoje) {
  return `${hoje.getFullYear()}-${hoje.getMonth() + 1}-${hoje.getDate()}`
}

function jaAvisouHoje(hoje) {
  try {
    return sessionStorage.getItem(CHAVE_SESSAO) === chaveDeHoje(hoje)
  } catch {
    return false
  }
}

/** O post-it da tarefa no quadro "Esta semana", se estiver à mostra. */
function postItDe(urgentes) {
  for (const tarefa of urgentes) {
    const postIt = document.querySelector(
      `.semana-postit[data-tarefa-id="${tarefa.id}"]`,
    )

    if (postIt?.getClientRects().length) return { id: tarefa.id, postIt }
  }

  return null
}

/** Passa do meio da tela para o voo até o post-it (se ele estiver à mostra). */
function comecarVoo(atual, cartaoEl) {
  if (!atual || atual.fase !== 'meio') return atual

  const achado = postItDe(atual.urgentes)
  const cartao = cartaoEl?.getBoundingClientRect()
  let alvo = null

  if (achado && cartao) {
    const destino = achado.postIt.getBoundingClientRect()

    alvo = {
      id: achado.id,
      dx: destino.left + destino.width / 2 - (cartao.left + cartao.width / 2),
      dy: destino.top + destino.height / 2 - (cartao.top + cartao.height / 2),
    }
  }

  return { ...atual, fase: 'voando', alvo }
}

/**
 * Alerta ao entrar no site quando há atividade atrasada ou para hoje: a frase
 * "Pode não!" aparece com zoom no meio da tela (com o bordão, se os sons e os
 * bordões estão ligados) e depois voa até o post-it da atividade no quadro
 * "Esta semana", que fica piscando. Aparece uma vez por dia em cada aba.
 */
export default function AlertaPodeNao({ hoje = new Date() }) {
  const { tarefas } = useDados()
  const { sons, bordoes } = usePreferencias()
  const cartaoRef = useRef(null)
  const jaTocou = useRef(false)
  const [alerta, setAlerta] = useState(() => {
    if (jaAvisouHoje(hoje)) return null

    const urgentes = tarefasUrgentes(tarefas, hoje)

    return urgentes.length
      ? { urgentes, fase: 'meio', esperaToque: false }
      : null
  })
  const fase = alerta?.fase
  const esperaToque = alerta?.esperaToque
  const alvo = alerta?.alvo

  // Marca o aviso de hoje e tenta tocar o bordão (uma vez)
  useEffect(() => {
    if (fase !== 'meio' || jaTocou.current) return
    jaTocou.current = true

    try {
      sessionStorage.setItem(CHAVE_SESSAO, chaveDeHoje(hoje))
    } catch {
      // Sem armazenamento: pode avisar de novo ao recarregar.
    }

    if (!sons || !bordoes) return

    miar('pode-nao', { volume: 0.9 }).then((tocou) => {
      if (!tocou) {
        setAlerta((atual) => atual && { ...atual, esperaToque: true })
      }
    })
  }, [fase, hoje, sons, bordoes])

  // No meio da tela por um tempo; depois voa até o post-it
  useEffect(() => {
    if (fase !== 'meio') return undefined

    const espera = setTimeout(
      () => setAlerta((atual) => comecarVoo(atual, cartaoRef.current)),
      esperaToque ? TEMPO_ESPERANDO_TOQUE : TEMPO_NO_MEIO,
    )

    return () => clearTimeout(espera)
  }, [fase, esperaToque])

  // Chegou no post-it: ele pisca e o alerta some
  useEffect(() => {
    if (fase !== 'voando') return undefined

    const fim = setTimeout(() => {
      if (alvo) {
        window.dispatchEvent(
          new CustomEvent(EVENTO_ALERTA_POSTIT, { detail: alvo.id }),
        )
      }
      setAlerta(null)
    }, TEMPO_VOANDO)

    return () => clearTimeout(fim)
  }, [fase, alvo])

  function tocar() {
    if (alerta?.esperaToque) {
      // O toque libera o som: toca agora e segue depois do tempo normal.
      miar('pode-nao', { volume: 0.9 })
      setAlerta((atual) => atual && { ...atual, esperaToque: false })
      return
    }

    setAlerta((atual) => comecarVoo(atual, cartaoRef.current))
  }

  if (!alerta) return null

  const { urgentes } = alerta
  const primeira = urgentes[0]

  return (
    <div
      className={`alerta-pode-nao alerta-${fase}`}
      role="alert"
      onClick={tocar}
    >
      <div
        ref={cartaoRef}
        className="alerta-cartao"
        style={
          fase === 'voando' && alvo
            ? { transform: `translate(${alvo.dx}px, ${alvo.dy}px) scale(0.1)` }
            : undefined
        }
      >
        <p className="alerta-frase">Pode não! 😾</p>
        <p className="alerta-resumo">{resumir(urgentes)}</p>
        <p className="alerta-tarefa">
          {primeira.titulo}
          {urgentes.length > 1 && ` e mais ${urgentes.length - 1}`}
        </p>
        {esperaToque && <p className="alerta-toque">Toque para ouvir 🔊</p>}
      </div>
    </div>
  )
}
