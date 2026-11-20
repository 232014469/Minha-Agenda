import { useEffect, useState } from 'react'
import { fraseDoGatinho } from '../gatinhos/frasesDoGatinho'

/** De quanto em quanto tempo a frase troca. */
const TROCA_MS = 12000

/**
 * Frase embaixo da casinha: muda conforme o humor do gatinho e vai se
 * revezando sozinha (com um fade suave a cada troca).
 */
export default function FraseDoGatinho({ humor = 'feliz', className = '' }) {
  const [vez, setVez] = useState(0)

  useEffect(() => {
    const relogio = setInterval(() => setVez((atual) => atual + 1), TROCA_MS)

    return () => clearInterval(relogio)
  }, [])

  const frase = fraseDoGatinho(humor, vez)

  return (
    <p className={`frase-do-gatinho ${className}`} aria-live="polite">
      <span key={frase}>{frase}</span>
    </p>
  )
}
