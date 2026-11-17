import { Link } from 'react-router'
import { useDados } from '../../dados/useDados'
import BarraProgresso from '../../shared/components/BarraProgresso'
import { EstadoVazio } from '../../shared/components/Estados'
import BarraDeFaltas from '../faltas/BarraDeFaltas'
import {
  HORAS_POR_ENCONTRO,
  cargaDoHistorico,
  creditosDoFluxograma,
} from '../faltas/faltas'
import { DISCIPLINAS, somarCreditos } from '../materias/dadosFluxograma'
import {
  diasAte,
  entregasPorDia,
  formatarPrazoCurto,
  proximaProva,
  textoDosDias,
} from './inicioUtils'

/** Faltas de cada matéria do semestre, com "+1 falta" direto daqui. */
export function CartaoFaltas() {
  const { materias, registrarFalta } = useDados()

  return (
    <section
      className="inicio-caixa inicio-faltas"
      aria-labelledby="faltas-painel-titulo"
    >
      <div className="inicio-caixa-topo">
        <h2 id="faltas-painel-titulo">Faltas</h2>
        <span className="inicio-dica">Cada +1 = um encontro de 2 h</span>
      </div>

      {materias.length === 0 ? (
        <EstadoVazio mensagem="Cadastre as matérias para acompanhar as faltas." />
      ) : (
        <ul className="inicio-faltas-lista">
          {materias.map((materia) => (
            <li key={materia.id}>
              <Link
                to={`/materias/${materia.id}`}
                className="inicio-faltas-link"
              >
                <BarraDeFaltas materia={materia} />
              </Link>
              <button
                type="button"
                className="inicio-faltas-mais"
                aria-label={`+1 falta em ${materia.nome}`}
                title={`+1 falta (${HORAS_POR_ENCONTRO} h)`}
                onClick={() => registrarFalta(materia.id, HORAS_POR_ENCONTRO)}
              >
                +1
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Contagem regressiva para a próxima prova. */
export function CartaoProva({ agora = new Date() }) {
  const { tarefas, materias } = useDados()
  const prova = proximaProva(tarefas, agora)
  const materia = prova && materias.find((item) => item.id === prova.materiaId)
  const dias = prova ? diasAte(prova.prazo, agora) : null

  return (
    <section
      className={`inicio-caixa inicio-prova${dias !== null && dias <= 2 ? ' inicio-prova-perto' : ''}`}
      aria-labelledby="prova-titulo"
    >
      <h2 id="prova-titulo">Próxima prova</h2>
      {prova ? (
        <Link to={`/materias/${prova.materiaId}`} className="inicio-prova-link">
          <span className="inicio-prova-quando">{textoDosDias(dias)}</span>
          <strong>{prova.titulo}</strong>
          <span>{materia?.nome}</span>
          <small>{formatarPrazoCurto(prova.prazo, agora)}</small>
        </Link>
      ) : (
        <p className="inicio-dica">
          Nenhuma prova marcada. <Link to="/agenda">Lançar na Agenda →</Link>
        </p>
      )}
    </section>
  )
}

/** Qualquer curso: horas cumpridas, e quanto as matérias deste semestre somam. */
function CartaoHorasDoCurso({ progresso, materias }) {
  const total = progresso.exigido.total
  const cumpridas = progresso.integralizado?.total ?? 0
  const nesteSemestre = materias.reduce(
    (soma, materia) => soma + (cargaDoHistorico(progresso, materia.nome) ?? 0),
    0,
  )

  return (
    <section className="inicio-caixa" aria-labelledby="horas-titulo">
      <h2 id="horas-titulo">Horas do curso</h2>
      <p className="inicio-creditos-numero">
        <strong>{cumpridas}</strong> de {total} h
      </p>
      <BarraProgresso
        concluidas={cumpridas}
        total={total}
        rotulo="Horas cumpridas no curso"
      />
      {nesteSemestre > 0 && (
        <p className="inicio-dica">
          +{nesteSemestre} h se passar em tudo neste semestre (
          {Math.round(((cumpridas + nesteSemestre) / total) * 100)}%).
        </p>
      )}
    </section>
  )
}

/**
 * Com o fluxograma ativo: créditos do curso, e quanto este semestre soma.
 * Sem ele: quantas entregas há em cada dia da semana.
 */
export function CartaoCreditosOuSemana({ agora = new Date() }) {
  const { fluxogramaAtivo, progressoCurso, cursadas, materias, tarefas } =
    useDados()

  if (!fluxogramaAtivo && progressoCurso?.exigido) {
    return <CartaoHorasDoCurso progresso={progressoCurso} materias={materias} />
  }

  if (!fluxogramaAtivo) {
    const dias = entregasPorDia(tarefas, agora)
    const maior = Math.max(1, ...dias.map((dia) => dia.total))

    return (
      <section className="inicio-caixa" aria-labelledby="semana-painel-titulo">
        <h2 id="semana-painel-titulo">Entregas da semana</h2>
        <ol className="inicio-semana-barras">
          {dias.map((dia) => (
            <li
              key={dia.dia}
              className={dia.hoje ? 'inicio-semana-hoje' : undefined}
              aria-label={`${dia.dia}: ${dia.total} ${dia.total === 1 ? 'entrega' : 'entregas'}`}
            >
              <span className="inicio-semana-total">{dia.total || ''}</span>
              <span
                className="inicio-semana-barra"
                style={{ height: `${(dia.total / maior) * 100}%` }}
              />
              <span className="inicio-semana-dia">{dia.dia}</span>
            </li>
          ))}
        </ol>
      </section>
    )
  }

  const feitas = new Set(cursadas)
  const total = somarCreditos(DISCIPLINAS)
  const cursados = somarCreditos(
    DISCIPLINAS.filter((item) => feitas.has(item.id)),
  )
  const nesteSemestre = materias.reduce((soma, materia) => {
    const disciplina = DISCIPLINAS.find(
      (item) => item.codigo && item.nome === materia.nome,
    )

    if (disciplina && feitas.has(disciplina.id)) return soma
    return soma + (creditosDoFluxograma(materia.nome) ?? 0)
  }, 0)

  return (
    <section className="inicio-caixa" aria-labelledby="creditos-titulo">
      <h2 id="creditos-titulo">Créditos do curso</h2>
      <p className="inicio-creditos-numero">
        <strong>{cursados}</strong> de {total}
      </p>
      <BarraProgresso
        concluidas={cursados}
        total={total}
        rotulo="Créditos cursados no curso"
      />
      {nesteSemestre > 0 && (
        <p className="inicio-dica">
          +{nesteSemestre} créditos se passar em tudo neste semestre (
          {Math.round(((cursados + nesteSemestre) / total) * 100)}%).
        </p>
      )}
    </section>
  )
}
