import { useEffect, useId, useState } from 'react'
import { APP } from '../../config/app'
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
 * para escrever um texto curto. Fica guardado neste aparelho e é salvo
 * sozinho enquanto escreve. No celular, `compacto`, vira uma faixa com uma
 * linha só, em cima do título.
 */
export default function Lembrete({ compacto = false }) {
  const [texto, setTexto] = useState(lerLembrete)
  const id = useId()

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, texto)
    } catch {
      // Sem armazenamento: vale só até fechar a página.
    }
  }, [texto])

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
