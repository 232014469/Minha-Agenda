import { useDados } from '../../dados/useDados'
import '../cores.css'
import { atividadesDaSemana, rotuloDoDia } from './semana'

/**
 * Quadro fixo no menu lateral com as atividades pendentes da semana, em
 * post-its só para ver (não são clicáveis). Fica sempre à mostra.
 */
export default function QuadroDaSemana({ hoje = new Date() }) {
  const { materias, tarefas } = useDados()
  const daSemana = atividadesDaSemana(tarefas, hoje)
  const corDe = (id) =>
    materias.find((materia) => materia.id === id)?.cor ?? 'amarelo'
  const nomeDe = (id) =>
    materias.find((materia) => materia.id === id)?.nome ?? ''

  return (
    <section className="semana" aria-labelledby="semana-titulo">
      <h2 id="semana-titulo">Esta semana</h2>
      {daSemana.length === 0 ? (
        <p className="semana-vazia">Nada pendente nesta semana.</p>
      ) : (
        <ul className="semana-lista">
          {daSemana.map((tarefa) => {
            const dia = rotuloDoDia(tarefa.prazo, hoje)

            return (
              <li
                key={tarefa.id}
                className={`semana-postit materia-cor-${corDe(tarefa.materiaId)}${
                  dia === 'Hoje' ? ' semana-hoje' : ''
                }`}
                title={`${tarefa.titulo} · ${nomeDe(tarefa.materiaId)}`}
              >
                <span className="semana-dia">{dia}</span>
                <span className="semana-titulo">{tarefa.titulo}</span>
                <span className="semana-materia">
                  {nomeDe(tarefa.materiaId)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
