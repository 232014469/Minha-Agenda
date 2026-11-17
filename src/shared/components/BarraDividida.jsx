import '../cores.css'
import './BarraDividida.css'

const porcento = (parte, total) =>
  total > 0 ? Math.round((Math.min(parte, total) / total) * 100) : 0

/**
 * Integralização dividida pelo peso de cada parte no curso. Com as horas
 * exigidas do histórico: se as obrigatórias são 77% do curso, o pedaço azul
 * ocupa 77% da largura e o amarelo (optativas e livres) os outros 23%. Cada
 * pedaço enche separado, com as horas cumpridas daquele tipo; juntos, dão o
 * total do curso.
 */
export default function BarraDividida({ exigido, integralizado }) {
  const livresExigidas = exigido.optativas + exigido.complementares
  const partes = [
    {
      chave: 'obrigatorias',
      rotulo: 'Obrigatórias',
      cor: 'azul',
      exigidas: exigido.obrigatorias,
      cumpridas: integralizado?.obrigatorias ?? 0,
    },
    {
      chave: 'livres',
      rotulo: 'Optativas e livres',
      cor: 'amarelo',
      exigidas: livresExigidas,
      cumpridas:
        (integralizado?.optativas ?? 0) + (integralizado?.complementares ?? 0),
    },
  ].filter((parte) => parte.exigidas > 0)

  if (partes.length === 0 || exigido.total <= 0) return null

  return (
    <div className="barra-dividida">
      <div className="barra-dividida-trilho">
        {partes.map((parte) => {
          const peso = (parte.exigidas / exigido.total) * 100
          const feito = porcento(parte.cumpridas, parte.exigidas)

          return (
            <div
              key={parte.chave}
              className={`barra-dividida-parte materia-cor-${parte.cor}`}
              style={{ width: `${peso}%` }}
              role="progressbar"
              aria-label={`${parte.rotulo} (${Math.round(peso)}% do curso)`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={feito}
              aria-valuetext={`${parte.cumpridas} de ${parte.exigidas} h, ${feito}%`}
            >
              <div
                className="barra-dividida-cheio"
                style={{ width: `${feito}%` }}
              />
            </div>
          )
        })}
      </div>
      <ul className="barra-dividida-legenda">
        {partes.map((parte) => (
          <li key={parte.chave} className={`materia-cor-${parte.cor}`}>
            <strong>
              {parte.rotulo} ·{' '}
              {Math.round((parte.exigidas / exigido.total) * 100)}% do curso
            </strong>
            <span>
              {parte.cumpridas} de {parte.exigidas} h (
              {porcento(parte.cumpridas, parte.exigidas)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
