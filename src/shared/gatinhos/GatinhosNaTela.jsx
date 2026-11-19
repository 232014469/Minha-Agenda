import { useEffect, useState } from 'react'
import { usePreferencias } from '../preferencias'
import { miar } from '../sons'
import Sprite from './Sprite'
import { EVENTO_CONCLUIU, gatoDaVez } from './gatos'

const movimentoReduzido = () =>
  globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** Espera até o próximo passeio: entre 1,5 e 3 minutos (o primeiro, 40 s). */
const proximaEspera = (primeira) =>
  primeira ? 40_000 : 90_000 + Math.random() * 90_000

/**
 * Gatinhos soltos pela tela: de vez em quando um atravessa andando pela
 * borda de baixo, e um pula comemorando quando uma tarefa é concluída.
 * Desligam nas Configurações e com "reduzir movimento" no sistema.
 */
export default function GatinhosNaTela() {
  const { gatinhos, mascote, sons } = usePreferencias()
  const [passeio, setPasseio] = useState(null)
  const [festa, setFesta] = useState(null)
  const ligado = gatinhos && !movimentoReduzido()

  // Passeios de tempos em tempos
  useEffect(() => {
    if (!ligado) return undefined

    let espera
    const agendar = (primeira) => {
      espera = setTimeout(() => {
        setPasseio({ gato: gatoDaVez(mascote), chave: Date.now() })
        agendar(false)
      }, proximaEspera(primeira))
    }

    agendar(true)

    return () => clearTimeout(espera)
  }, [ligado, mascote])

  // Comemoração ao concluir uma tarefa
  useEffect(() => {
    if (!ligado) return undefined

    function concluiu() {
      setFesta({ gato: gatoDaVez(mascote), chave: Date.now() })
      if (sons) miar({ volume: 0.3 })
    }

    window.addEventListener(EVENTO_CONCLUIU, concluiu)

    return () => window.removeEventListener(EVENTO_CONCLUIU, concluiu)
  }, [ligado, mascote, sons])

  useEffect(() => {
    if (!festa) return undefined

    const fim = setTimeout(() => setFesta(null), 2200)

    return () => clearTimeout(fim)
  }, [festa])

  if (!ligado) return null

  return (
    <>
      {passeio && (
        <div
          key={passeio.chave}
          className="gatinho-passeio"
          onAnimationEnd={(evento) => {
            if (evento.target === evento.currentTarget) setPasseio(null)
          }}
        >
          <button
            type="button"
            className="gatinho-botao"
            aria-label="Gatinho passeando. Clique para ele miar"
            onClick={() => sons && miar()}
          >
            <Sprite gato={passeio.gato} animacao="walk" fps={10} />
          </button>
        </div>
      )}
      {festa && (
        <div key={festa.chave} className="gatinho-festa" role="status">
          <Sprite gato={festa.gato} animacao="jump" fps={9} vezes="3" />
          <span className="gatinho-festa-balao">Feito! 🎉</span>
        </div>
      )}
    </>
  )
}
