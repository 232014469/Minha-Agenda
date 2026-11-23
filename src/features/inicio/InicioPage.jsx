import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { nomeDoSemestre } from '../../dados/armazenamento'
import { useDados } from '../../dados/useDados'
import { ehAtrasada } from '../agenda/agendaUtils'
import BarraProgresso from '../../shared/components/BarraProgresso'
import { EstadoVazio } from '../../shared/components/Estados'
import '../../shared/cores.css'
import {
  corDoTipo,
  diasAte,
  proximasTarefas,
  resumirEntregas,
  resumoDoDia,
  saudacao,
  textoDosDias,
} from './inicioUtils'
import { CartaoSemana, CartaoFaltas, CartaoProva } from './CartoesDoPainel'
import { fraseDoDia } from '../../config/frases'
import GatinhoDormindo from '../../shared/gatinhos/GatinhoDormindo'
import ProgressoGeral from './ProgressoGeral'
import RelatorioDeEntregas from './RelatorioDeEntregas'
import { calcularNotas, formatarNota } from '../notas/notas'
import {
  esquecerMateriasNovas,
  lerMateriasNovas,
} from '../materias/vooDaMateria'
import './InicioPage.css'

/** Uma frase por dia, alternando na ordem da lista. */
function FraseDoDia() {
  const { grupo, texto } = fraseDoDia()

  return (
    <figure className="inicio-frase">
      <span aria-hidden="true">{grupo}</span>
      <blockquote>“{texto}”</blockquote>
    </figure>
  )
}

/**
 * Meu progresso: o anel e os números. Clicar no cartão (ou no ⤢) abre o
 * relatório de entregas, saindo do próprio cartão.
 */
function Progresso({ resumo, atrasadas, tarefas, materias, semestre }) {
  const { concluidas, total, pendentes, percentual } = resumo
  // Aberto: onde estava o cartão, para a janela sair dele (fechado: null)
  const [relatorio, setRelatorio] = useState(null)

  return (
    <section
      className={`inicio-caixa inicio-progresso${total ? ' inicio-progresso-clicavel' : ''}`}
      aria-labelledby="progresso-titulo"
      onClick={(evento) => {
        if (total && !evento.target.closest('.janela-fundo')) {
          setRelatorio(evento.currentTarget.getBoundingClientRect())
        }
      }}
    >
      <div className="inicio-caixa-topo">
        <h2 id="progresso-titulo">Meu progresso</h2>
        {total > 0 && (
          <button
            type="button"
            className="inicio-ampliar"
            aria-label="Ver o relatório de entregas"
            title="Ver o relatório"
          >
            ⤢
          </button>
        )}
      </div>
      {relatorio && (
        <RelatorioDeEntregas
          tarefas={tarefas}
          materias={materias}
          semestre={semestre}
          origem={relatorio}
          aoFechar={() => setRelatorio(null)}
        />
      )}
      {total === 0 ? (
        <EstadoVazio mensagem="Você ainda não tem tarefas no semestre." />
      ) : (
        <>
          <div className="inicio-progresso-corpo">
            <ProgressoGeral percentual={percentual} />
            <dl className="inicio-progresso-numeros">
              <div>
                <dt>Feitas</dt>
                <dd>
                  {concluidas}
                  <small> de {total}</small>
                </dd>
              </div>
              <div>
                <dt>Pendentes</dt>
                <dd>{pendentes}</dd>
              </div>
              <div className={atrasadas > 0 ? 'inicio-numero-alerta' : ''}>
                <dt>Atrasadas</dt>
                <dd>{atrasadas}</dd>
              </div>
            </dl>
          </div>
          <FraseDoDia />
        </>
      )}
    </section>
  )
}

const MES_CURTO = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]

/** "23:59 · em 2 dias" ou "08:00 · (atrasada)". */
function quandoVence(item) {
  const data = new Date(item.prazo)
  const hora = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${hora} · ${
    item.atrasada ? '(atrasada)' : textoDosDias(diasAte(item.prazo))
  }`
}

function Proximas({ proximas, atrasadas }) {
  return (
    <section className="inicio-caixa inicio-proximas">
      <div className="inicio-caixa-topo">
        <h2>Próximas tarefas</h2>
        <Link to="/agenda" state={{ abrindo: true }}>
          Ver tudo →
        </Link>
      </div>

      {atrasadas > 0 && (
        <p className="inicio-alerta" role="status">
          <span aria-hidden="true">⚠ </span>
          {atrasadas === 1
            ? '1 tarefa atrasada'
            : `${atrasadas} tarefas atrasadas`}
        </p>
      )}

      {proximas.length === 0 ? (
        <>
          <GatinhoDormindo />
          <EstadoVazio mensagem="Nenhuma entrega pendente. Bom trabalho!" />
        </>
      ) : (
        <ul>
          {proximas.map((item) => {
            const data = new Date(item.prazo)

            return (
              <li key={item.id}>
                <Link
                  className={`inicio-proxima${
                    item.atrasada ? ' inicio-proxima-atrasada' : ''
                  }`}
                  to={`/materias/${item.materiaId}`}
                >
                  <span
                    className={`inicio-proxima-data materia-cor-${item.materiaCor}`}
                    aria-hidden="true"
                  >
                    <strong>{data.getDate()}</strong>
                    {MES_CURTO[data.getMonth()]}
                  </span>
                  <span className="inicio-proxima-texto">
                    <strong>{item.titulo}</strong>
                    <span className="inicio-proxima-materia">
                      {item.materiaNome}
                    </span>
                    <small>
                      <span className="inicio-proxima-quando">
                        {quandoVence(item)}
                      </span>
                      {item.tipo && (
                        <span className={`etiqueta-${corDoTipo(item.tipo)}`}>
                          {' '}
                          · {item.tipo}
                        </span>
                      )}
                    </small>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function MinhasMaterias({ materias, tarefas }) {
  // Recém-adicionadas (ver vooDaMateria.js): chegam com um pulinho
  const [novas] = useState(lerMateriasNovas)

  useEffect(() => esquecerMateriasNovas(), [])

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
            const { total, concluidas, pendentes } = resumirEntregas(
              tarefas.filter((tarefa) => tarefa.materiaId === materia.id),
            )
            // Média e menção, quando já saiu alguma nota
            const { media, mencao } = calcularNotas(materia, tarefas)

            return (
              <li
                key={materia.id}
                className={
                  novas.has(materia.nome) ? 'inicio-materia-nova' : undefined
                }
              >
                <Link
                  className={`inicio-materia materia-cor-${materia.cor}`}
                  to={`/materias/${materia.id}`}
                >
                  <strong>{materia.nome}</strong>
                  {mencao && (
                    <span
                      className={`inicio-materia-mencao notas-mencao-${mencao.sigla.toLowerCase()}`}
                      title={`Média ${formatarNota(media)} (${mencao.nome})`}
                    >
                      {mencao.sigla} · {formatarNota(media)}
                    </span>
                  )}
                  <span className="inicio-materia-situacao">
                    {total === 0
                      ? 'Sem entregas ainda'
                      : pendentes === 0
                        ? 'Tudo em dia'
                        : `${pendentes} ${pendentes === 1 ? 'pendente' : 'pendentes'}`}
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
/** "quarta-feira, 18 de novembro" */
function dataPorExtenso(data) {
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export default function InicioPage() {
  const { materias, tarefas, semestre } = useDados()
  const resumo = resumirEntregas(tarefas)
  const atrasadas = tarefas.filter(ehAtrasada).length
  const agora = new Date()

  return (
    <section className="inicio">
      <h1 className="titulo-pagina">{saudacao(agora)}!</h1>
      <p className="subtitulo-pagina inicio-subtitulo">
        <span className="inicio-data">{dataPorExtenso(agora)}</span>
        <span aria-hidden="true"> · </span>
        <span>Semestre {nomeDoSemestre(semestre)}</span>
        <span className="inicio-resumo-dia">{resumoDoDia(tarefas, agora)}</span>
      </p>
      <div className="inicio-grade">
        <div className="inicio-principal">
          <div className="inicio-cartoes">
            <CartaoFaltas />
            <CartaoProva />
            <CartaoSemana />
          </div>

          <MinhasMaterias materias={materias} tarefas={tarefas} />
        </div>

        <aside className="inicio-lateral">
          <Progresso
            resumo={resumo}
            atrasadas={atrasadas}
            tarefas={tarefas}
            materias={materias}
            semestre={semestre}
          />
          <Proximas
            proximas={proximasTarefas(tarefas, materias)}
            atrasadas={atrasadas}
          />
        </aside>
      </div>
    </section>
  )
}
