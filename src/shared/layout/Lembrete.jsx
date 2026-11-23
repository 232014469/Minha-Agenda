import { useEffect, useId, useState } from 'react'
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
 * os outros aparelhos na sincronização. No celular, `compacto`, vira uma faixa com uma
 * linha só, em cima do título.
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

  if (compacto) {
    return (
      <section className="lembrete-compacto" aria-label="Quadro de lembrete">
        <span className="lembrete-alfinete" aria-hidden="true" />
        <input
          type="text"
          value={texto}
          onChange={mudar}
          maxLength={LIMITE_DO_LEMBRETE}
          placeholder="Escreva um lembrete…"
          aria-label="Lembrete"
        />
      </section>
    )
  }

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
        placeholder="Escreva aqui o que não pode esquecer…"
      />
      <span className="lembrete-contador" aria-hidden="true">
        {texto.length}/{LIMITE_DO_LEMBRETE}
      </span>
    </section>
  )
}
