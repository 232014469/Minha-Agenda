import { nomeDoSemestre } from '../../dados/armazenamento'
import JanelaNaPagina from '../../shared/components/JanelaNaPagina'
import { relatorioDeEntregas } from './relatorio'
import './RelatorioDeEntregas.css'

function Numero({ rotulo, valor, detalhe, alerta = false }) {
  return (
    <div className={`relatorio-numero${alerta ? ' relatorio-alerta' : ''}`}>
      <dt>{rotulo}</dt>
      <dd>
        {valor}
        {detalhe && <small>{detalhe}</small>}
      </dd>
    </div>
  )
}

/** Uma linha com nome, barra (feitas em cheio, não realizadas apagadas) e conta. */
function Linha({ nome, grupo, className = '' }) {
  const feitas = (grupo.concluidas / grupo.total) * 100
  const perdidas = (grupo.naoRealizadas / grupo.total) * 100

  return (
    <li className={`relatorio-linha ${className}`.trim()}>
      <span className="relatorio-linha-nome" title={nome}>
        {nome}
      </span>
      <span
        className="relatorio-barra"
        role="img"
        aria-label={`${grupo.concluidas} de ${grupo.total} concluídas`}
      >
        <span
          className="relatorio-barra-feitas"
          style={{ width: `${feitas}%` }}
        />
        <span
          className="relatorio-barra-perdidas"
          style={{ width: `${perdidas}%` }}
        />
      </span>
      <span className="relatorio-linha-conta">
        {grupo.concluidas}/{grupo.total}
      </span>
    </li>
  )
}

const ddMm = (data) =>
  `${String(data.getDate()).padStart(2, '0')}/${String(
    data.getMonth() + 1,
  ).padStart(2, '0')}`

/**
 * Relatório das entregas do semestre, aberto pelo cartão "Meu progresso":
 * números gerais, pontualidade, cada matéria, cada tipo e o ritmo das
 * últimas semanas. Sai do cartão e volta para ele ao fechar.
 */
export default function RelatorioDeEntregas({
  tarefas,
  materias,
  semestre,
  origem,
  aoFechar,
  agora = new Date(),
}) {
  const r = relatorioDeEntregas(tarefas, materias, agora)
  const maiorSemana = Math.max(1, ...r.ritmo.map((semana) => semana.total))

  return (
    <JanelaNaPagina
      origem={origem}
      largura={680}
      rotulo="Relatório de entregas"
      className="relatorio"
      aoFechar={aoFechar}
    >
      {(fechar) => (
        <>
          <header className="relatorio-topo">
            <div>
              <h2>Relatório de entregas</h2>
              <p>Semestre {nomeDoSemestre(semestre)}</p>
            </div>
            <button
              type="button"
              className="relatorio-fechar"
              aria-label="Fechar"
              onClick={() => fechar()}
              autoFocus
            >
              ×
            </button>
          </header>

          <dl className="relatorio-numeros">
            <Numero
              rotulo="Concluídas"
              valor={`${r.resumo.percentual}%`}
              detalhe={`${r.resumo.concluidas} de ${r.resumo.total}`}
            />
            <Numero
              rotulo="No prazo"
              valor={
                r.pontualidade.avaliadas ? `${r.pontualidade.percentual}%` : '–'
              }
              detalhe={
                r.pontualidade.avaliadas
                  ? `${r.pontualidade.noPrazo} de ${r.pontualidade.avaliadas}`
                  : 'nenhuma ainda'
              }
            />
            <Numero
              rotulo="Atrasadas"
              valor={r.resumo.atrasadas}
              alerta={r.resumo.atrasadas > 0}
            />
            <Numero rotulo="Não realizadas" valor={r.resumo.naoRealizadas} />
            <Numero
              rotulo="Próximos 7 dias"
              valor={r.proximos7Dias}
              detalhe={
                r.resumo.pendentes ? `${r.resumo.pendentes} pendentes` : ''
              }
            />
          </dl>

          <div className="relatorio-colunas">
            <section className="relatorio-bloco">
              <h3>Por matéria</h3>
              {r.porMateria.length ? (
                <ul>
                  {r.porMateria.map((grupo) => (
                    <Linha
                      key={grupo.chave}
                      nome={grupo.nome}
                      grupo={grupo}
                      className={`materia-cor-${grupo.cor}`}
                    />
                  ))}
                </ul>
              ) : (
                <p className="relatorio-vazio">Sem tarefas ainda.</p>
              )}
            </section>

            <section className="relatorio-bloco">
              <h3>Por tipo</h3>
              {r.porTipo.length ? (
                <ul>
                  {r.porTipo.map((grupo) => (
                    <Linha key={grupo.chave} nome={grupo.chave} grupo={grupo} />
                  ))}
                </ul>
              ) : (
                <p className="relatorio-vazio">Sem tarefas ainda.</p>
              )}
            </section>
          </div>

          <section className="relatorio-bloco">
            <h3>Ritmo das últimas semanas</h3>
            <ol className="relatorio-ritmo">
              {r.ritmo.map((semana) => (
                <li
                  key={semana.inicio.getTime()}
                  className={
                    semana.atual ? 'relatorio-semana-atual' : undefined
                  }
                  aria-label={`Semana de ${ddMm(semana.inicio)}: ${semana.concluidas} de ${semana.total} concluídas`}
                >
                  <span className="relatorio-ritmo-conta">
                    {semana.total ? `${semana.concluidas}/${semana.total}` : ''}
                  </span>
                  <span
                    className="relatorio-ritmo-coluna"
                    style={{ height: `${(semana.total / maiorSemana) * 100}%` }}
                  >
                    <span
                      style={{
                        height: `${semana.total ? (semana.concluidas / semana.total) * 100 : 0}%`,
                      }}
                    />
                  </span>
                  <span className="relatorio-ritmo-data">
                    {semana.atual ? 'esta' : ddMm(semana.inicio)}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <p className="relatorio-nota">
            Nas barras, a parte colorida são as concluídas e a cinza, as não
            realizadas. "No prazo" conta quando a tarefa foi marcada como
            concluída; as semanas seguem a data de entrega de cada tarefa.
          </p>
        </>
      )}
    </JanelaNaPagina>
  )
}
