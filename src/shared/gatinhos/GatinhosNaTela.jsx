import { useEffect, useRef, useState } from 'react'
import { usePreferencias } from '../preferencias'
import { miar } from '../sons'
import Sprite from './Sprite'
import {
  EVENTO_SAIU_PASSEAR,
  EVENTO_VOLTOU_DO_PASSEIO,
  gatoDaVez,
} from './gatos'
import { TEMPO_PARA_SAIR } from './rotina'

const movimentoReduzido = () =>
  globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** Espera até o próximo passeio: entre 1,5 e 3 minutos (o primeiro, 40 s). */
const proximaEspera = (primeira) =>
  primeira ? 40_000 : 90_000 + Math.random() * 90_000

/**
 * Passeio do mascote pela borda de baixo da tela: de vez em quando ele sai do
 * lugar dele (o menu no computador, em cima do título no celular), atravessa
 * a tela andando e só então volta. Comemorar e ficar triste é com o próprio
 * mascote. Desliga nas Configurações e com "reduzir movimento" no sistema.
 */
export default function GatinhosNaTela({ chuva = false }) {
  const { gatinhos, mascote, sons } = usePreferencias()
  const [passeio, setPasseio] = useState(null)
  const foraDoMenu = useRef(false)
  // Na chuva o gatinho está dormindo na casinha: não sai para passear
  const chovendo = useRef(chuva)

  useEffect(() => {
    chovendo.current = chuva
  }, [chuva])
  const ligado = gatinhos && !movimentoReduzido()

  /** Fim do passeio (ou gatinhos desligados): o mascote volta ao lugar. */
  function voltarAoMenu() {
    if (!foraDoMenu.current) return

    foraDoMenu.current = false
    window.dispatchEvent(new CustomEvent(EVENTO_VOLTOU_DO_PASSEIO))
  }

  // Passeios de tempos em tempos
  useEffect(() => {
    if (!ligado) return undefined

    let espera
    let saida
    const agendar = (primeira) => {
      espera = setTimeout(() => {
        if (chovendo.current) {
          agendar(false)
          return
        }

        // Primeiro o mascote sai do lugar; depois aparece lá embaixo.
        foraDoMenu.current = true
        window.dispatchEvent(new CustomEvent(EVENTO_SAIU_PASSEAR))
        saida = setTimeout(
          () => setPasseio({ gato: gatoDaVez(mascote), chave: Date.now() }),
          TEMPO_PARA_SAIR,
        )

        agendar(false)
      }, proximaEspera(primeira))
    }

    agendar(true)

    return () => {
      clearTimeout(espera)
      clearTimeout(saida)
      voltarAoMenu()
    }
  }, [ligado, mascote])

  if (!ligado || !passeio) return null

  return (
    <div
      key={passeio.chave}
      className="gatinho-passeio"
      onAnimationEnd={(evento) => {
        if (evento.target !== evento.currentTarget) return

        setPasseio(null)
        voltarAoMenu()
      }}
    >
      <button
        type="button"
        className="gatinho-botao"
        aria-label="Gatinho passeando. Clique para ele miar"
        onClick={() => sons && miar('fome')}
      >
        <Sprite gato={passeio.gato} animacao="walk" fps={10} />
      </button>
    </div>
  )
}
