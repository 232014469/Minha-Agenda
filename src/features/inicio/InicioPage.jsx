import { Link } from 'react-router'
import { nomeDoSemestre } from '../../dados/armazenamento'
import { useDados } from '../../dados/useDados'
import { ehAtrasada } from '../agenda/agendaUtils'
import BarraProgresso from '../../shared/components/BarraProgresso'
import { EstadoVazio } from '../../shared/components/Estados'
import '../../shared/cores.css'
import {
  corDoTipo,
  formatarPrazoCurto,
  mensagemDeProgresso,
  proximasTarefas,
  resumirEntregas,
} from './inicioUtils'
import Backup from './Backup'
import ProgressoGeral from './ProgressoGeral'
import './InicioPage.css'

function CartaoResumo({ cor, titulo, valor, legenda, para, rotulo }) {
  return (
    <Link className={`resumo resumo-${cor}`} to={para} aria-label={rotulo}>
      <span className="resumo-titulo">{titulo}</span>
      <span className="resumo-valor">{valor}</span>
      <span className="resumo-legenda">{legenda}</span>
      <span className="resumo-seta" aria-hidden="true">
        →
      </span>
    </Link>
  )
}

function Progresso({ resumo }) {
  const { concluidas, total, percentual } = resumo

  return (
    <section className="inicio-caixa inicio-progresso">
      <h2>Meu progresso</h2>
      {total === 0 ? (
        <EstadoVazio mensagem="Você ainda não tem tarefas no semestre." />
      ) : (
        <>
          <div className="inicio-progresso-corpo">
            <ProgressoGeral percentual={percentual} />
            <p className="inicio-progresso-contagem">
              <strong>
                {concluidas}/{total}
              </strong>
              <span>Tarefas feitas</span>
            </p>
          </div>
          <p className="inicio-progresso-mensagem">
            <span aria-hidden="true">★ </span>
            {mensagemDeProgresso({ total, percentual })}
          </p>
        </>
      )}
    </section>
  )
}

function Proximas({ proximas }) {
  return (
    <section className="inicio-caixa inicio-proximas">
      <div className="inicio-caixa-topo">
        <h2>Próximas tarefas</h2>
        <Link to="/agenda">Ver tudo →</Link>
      </div>

      {proximas.length === 0 ? (
        <EstadoVazio mensagem="Nenhuma entrega pendente. Bom trabalho!" />
      ) : (
        <ul>
          {proximas.map((item) => (
            <li key={item.id}>
              <Link
                className="inicio-proxima"
                to={`/materias/${item.materiaId}`}
              >
                <span
                  className={`ponto ponto-${corDoTipo(item.tipo)}`}
                  aria-hidden="true"
                />
                <span className="inicio-proxima-texto">
                  <strong>{item.titulo}</strong>
                  <span>{item.materiaNome}</span>
                  <small className={item.atrasada ? 'atrasada' : undefined}>
                    {formatarPrazoCurto(item.prazo)}
                    {item.atrasada && ' (atrasada)'}
                  </small>
                </span>
                {item.tipo && (
                  <span className={`etiqueta etiqueta-${corDoTipo(item.tipo)}`}>
                    {item.tipo}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function MinhasMaterias({ materias, tarefas }) {
  return (
    <section className="inicio-caixa">
      <div className="inicio-caixa-topo">
        <h2>Minhas matérias</h2>
        <Link to="/adicionar-materia">Adicionar →</Link>
      </div>

      {materias.length === 0 ? (
        <EstadoVazio mensagem="Você ainda não tem matérias." />
      ) : (
        <ul className="inicio-materias">
          {materias.map((materia) => {
            const { total, concluidas } = resumirEntregas(
              tarefas.filter((tarefa) => tarefa.materiaId === materia.id),
            )

            return (
              <li key={materia.id}>
                <Link
                  className={`inicio-materia materia-cor-${materia.cor}`}
                  to={`/materias/${materia.id}`}
                >
                  <strong>{materia.nome}</strong>
                  <span>
                    {concluidas}/{total} Tarefas
                  </span>
                  <BarraProgresso
                    concluidas={concluidas}
                    total={total}
                    rotulo={`Progresso em ${materia.nome}`}
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/** Tela principal: resumo do semestre, matérias, progresso e próximas entregas. */
export default function InicioPage() {
  const { materias, tarefas, semestre } = useDados()
  const resumo = resumirEntregas(tarefas)
  const atrasadas = tarefas.filter(ehAtrasada).length

  return (
    <section className="inicio">
      <h1 className="titulo-pagina">Olá!</h1>
      <p className="inicio-semestre">Semestre {nomeDoSemestre(semestre)}</p>
      <div className="inicio-grade">
        <div className="inicio-principal">
          <div className="inicio-resumos">
            <CartaoResumo
              cor="lilas"
              titulo="Matérias"
              valor={materias.length}
              legenda="Cursando"
              para="/adicionar-materia"
              rotulo={`Matérias: ${materias.length} cursando`}
            />
            <CartaoResumo
              cor="amarelo"
              titulo="Tarefas"
              valor={resumo.pendentes}
              legenda="Pendentes"
              para="/agenda"
              rotulo={`Tarefas: ${resumo.pendentes} pendentes`}
            />
            <CartaoResumo
              cor="verde"
              titulo="Atrasadas"
              valor={atrasadas}
              legenda={atrasadas === 1 ? 'Tarefa' : 'Tarefas'}
              para="/agenda"
              rotulo={`Atrasadas: ${atrasadas}`}
            />
          </div>

          <MinhasMaterias materias={materias} tarefas={tarefas} />
        </div>

        <aside className="inicio-lateral">
          <Progresso resumo={resumo} />
          <Proximas proximas={proximasTarefas(tarefas, materias)} />
        </aside>
      </div>

      <Backup />
    </section>
  )
}
