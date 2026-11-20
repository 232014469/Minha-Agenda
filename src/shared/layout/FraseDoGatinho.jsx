import { fraseDoGatinho } from '../gatinhos/frasesDoGatinho'

/**
 * Frase embaixo da casinha: uma por dia, conforme o humor do gatinho (troca
 * com um fade suave quando o humor muda).
 */
export default function FraseDoGatinho({ humor = 'feliz', className = '' }) {
  const frase = fraseDoGatinho(humor)

  return (
    <p className={`frase-do-gatinho ${className}`} aria-live="polite">
      <span key={frase}>{frase}</span>
    </p>
  )
}
