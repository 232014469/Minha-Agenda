import { situacaoDasFaltas, textoDasFaltas } from './faltas'
import './Faltas.css'

/**
 * Barra de faltas de uma matéria: horas faltadas em relação ao limite, com a
 * cor do nível (verde, amarelo, vermelho) e o texto do que ainda dá.
 */
export default function BarraDeFaltas({ materia, comNome = true }) {
  const situacao = situacaoDasFaltas(materia)
  const { faltas, limite, nivel, percentual } = situacao

  return (
    <div className={`faltas-barra faltas-${nivel}`}>
      <div className="faltas-barra-topo">
        {comNome && <strong className="faltas-nome">{materia.nome}</strong>}
        <span className="faltas-numeros">
          {faltas} de {limite} h
        </span>
      </div>
      <div
        className="faltas-trilho"
        role="progressbar"
        aria-label={`Faltas em ${materia.nome}`}
        aria-valuemin={0}
        aria-valuemax={limite}
        aria-valuenow={Math.min(faltas, limite)}
        aria-valuetext={`${faltas} de ${limite} horas de falta`}
      >
        <span style={{ width: `${percentual}%` }} />
      </div>
      <span className="faltas-texto">{textoDasFaltas(situacao)}</span>
    </div>
  )
}
