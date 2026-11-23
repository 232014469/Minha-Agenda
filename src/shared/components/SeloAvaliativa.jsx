import { ehAvaliativa } from '../avaliativa'
import './SeloAvaliativa.css'

/**
 * Estrelinha das atividades avaliativas (as que valem nota, criadas no
 * cartão de Notas da matéria). Só aparece quando a tarefa é avaliativa; o
 * cartão em volta ganha um contorno dourado (ver SeloAvaliativa.css).
 */
export default function SeloAvaliativa({ tarefa }) {
  if (!ehAvaliativa(tarefa)) return null

  return (
    <span
      className="selo-avaliativa"
      role="img"
      aria-label="Avaliativa: "
      title="Avaliativa (vale nota)"
    >
      ★
    </span>
  )
}
