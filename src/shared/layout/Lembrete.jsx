import { useEffect, useId, useState } from 'react'
import JanelaNaPagina from '../components/JanelaNaPagina'
import { APP } from '../../config/app'
import { EVENTO_EXTRAS_RECEBIDOS, marcarExtra } from '../../sync/extras'
import './Lembrete.css'

const CHAVE = `${APP.chaveDosDados}.lembrete`
// Cabe inteiro nas 6 linhas do papel, sem rolagem
const LIMITE_DO_LEMBRETE = 90

function lerLembrete() {
  try {
    return localStorage.getItem(CHAVE) ?? ''
  } catch {
    return ''
  }
}

/**
 * Quadro de lembrete: um bilhetinho preso com fita no alto do menu, onde dá
 * para escrever um texto curto. É salvo sozinho enquanto escreve e vai para
 * os outros aparelhos na sincronização. No celular, `compacto`, vira uma faixa
 * em cima do título com o começo do texto; tocar nela abre o bilhete inteiro
 * por cima da página, como o dia na Agenda.
 */
export default function Lembrete({ compacto = false }) {
  const [texto, setTexto] = useState(lerLembrete)
  const id = useId()

  // Guarda ao escrever; só uma mudança de verdade vai para os outros
  // aparelhos (abrir o lembrete vazio não conta como escrever nada)
  useEffect(() => {
    try {
      if ((localStorage.getItem(CHAVE) ?? '') === texto) return
      localStorage.setItem(CHAVE, texto)
      marcarExtra('lembrete')
    } catch {
      // Sem armazenamento: vale só até fechar a página.
    }
  }, [texto])

  // Escreveram o lembrete em outro aparelho: mostra o texto novo
  useEffect(() => {
    function reler(evento) {
      if (evento.detail?.includes('lembrete')) setTexto(lerLembrete())
    }

    window.addEventListener(EVENTO_EXTRAS_RECEBIDOS, reler)

    return () => window.removeEventListener(EVENTO_EXTRAS_RECEBIDOS, reler)
  }, [])

  const mudar = (evento) =>
    setTexto(evento.target.value.slice(0, LIMITE_DO_LEMBRETE))
  // Celular: o bilhete aberto por cima da página (de onde a faixa estava)
  const [aberto, setAberto] = useState(null)

  if (compacto) {
    return (
      <>
        <button
          type="button"
          className="lembrete-compacto"
          aria-label={texto ? `Lembrete: ${texto}` : 'Escrever um lembrete'}
          aria-haspopup="dialog"
          onClick={(evento) =>
            setAberto(evento.currentTarget.getBoundingClientRect())
          }
        >
          <span className="lembrete-alfinete" aria-hidden="true" />
          <span
            className={`lembrete-compacto-texto${texto ? '' : ' vazio'}`}
            aria-hidden="true"
          >
            {texto || 'Escreva um lembrete…'}
          </span>
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
            {(fechar) => (
              <Bilhete id={id} texto={texto} mudar={mudar} focar={!texto}>
                <button
                  type="button"
                  className="lembrete-pronto"
                  onClick={() => fechar()}
                >
                  Pronto
                </button>
              </Bilhete>
            )}
          </JanelaNaPagina>
        )}
      </>
    )
  }

  return <Bilhete id={id} texto={texto} mudar={mudar} />
}

/** O bilhetinho em si: fita, título, texto e quantas letras ainda cabem. */
function Bilhete({ id, texto, mudar, focar = false, children }) {
  return (
    <section className="lembrete" aria-label="Quadro de lembrete">
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
      <span className="lembrete-contador" aria-hidden="true">
        {texto.length}/{LIMITE_DO_LEMBRETE}
      </span>
      {children}
    </section>
  )
}
