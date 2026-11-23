import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { useDados } from '../../dados/useDados'
import BarraProgresso from '../../shared/components/BarraProgresso'
import BarraDeFaltas from '../faltas/BarraDeFaltas'
import {
  CARGAS,
  HORAS_POR_ENCONTRO,
  cargaHorariaDe,
  situacaoDasFaltas,
} from '../faltas/faltas'
import GatinhoDormindo from '../../shared/gatinhos/GatinhoDormindo'
import NotasDaMateria from '../notas/NotasDaMateria'
import { formatarNota } from '../notas/notas'
import Icone from '../../shared/layout/Icone'
import '../../shared/cores.css'
import {
  categoriaDaEntrega,
  contarPorCategoria,
  descreverPrazo,
  estaAtrasada,
  ordenarPorUrgencia,
  resumirPendencias,
} from './disciplinaUtils'
import './PaginaMateria.css'

const FILTROS = [
  { chave: 'todas', titulo: 'Todas' },
  { chave: 'afazer', titulo: 'A fazer' },
  { chave: 'andamento', titulo: 'Em andamento' },
  { chave: 'concluida', titulo: 'Concluídas' },
  { chave: 'naorealizada', titulo: 'Não realizadas' },
]

const SITUACAO = {
  afazer: { texto: 'A fazer', classe: 'rosa' },
  andamento: { texto: 'Em andamento', classe: 'amarelo' },
  concluida: { texto: 'Concluída', classe: 'verde' },
  naorealizada: { texto: 'Não realizada', classe: 'cinza' },
}

/** "24/11", com o ano só quando não é o ano corrente. */
function formatarData(prazo, agora) {
  const data = new Date(prazo)
  const mesmoAno = data.getFullYear() === agora.getFullYear()

  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    ...(!mesmoAno && { year: 'numeric' }),
  })
}

function Entrega({ entrega, agora, ordem, aoAlternar, aoExcluir }) {
  const categoria = categoriaDaEntrega(entrega)
  const atrasada = estaAtrasada(entrega, agora)
  const situacao = SITUACAO[categoria]
  const feita = categoria === 'concluida'

  return (
    <li
      className={`entrega entrega-${situacao.classe}${
        atrasada ? ' entrega-atrasada' : ''
      }`}
      style={{ '--ordem': Math.min(ordem, 10) }}
    >
      <div className="entrega-conteudo">
        <div className="entrega-linha">
          <h3>{entrega.titulo}</h3>
          <span className={`entrega-status entrega-status-${situacao.classe}`}>
            {situacao.texto}
          </span>
          {atrasada && <span className="entrega-aviso">Atrasada</span>}
        </div>
        {entrega.descricao && <p>{entrega.descricao}</p>}
        <p className="entrega-meta">
          {entrega.tipo && <span>{entrega.tipo}</span>}
          {typeof entrega.nota === 'number' && (
            <span className="entrega-nota" title="Nota">
              Nota {formatarNota(entrega.nota)}
              {(entrega.notaMaxima ?? 10) !== 10 &&
                ` de ${formatarNota(entrega.notaMaxima)}`}
            </span>
          )}
          <time dateTime={entrega.prazo}>
            {formatarData(entrega.prazo, agora)}
          </time>
          {!feita && (
            <strong className="entrega-prazo-texto">
              {descreverPrazo(entrega.prazo, agora)}
            </strong>
          )}
        </p>
      </div>
      <div className="entrega-acoes">
        <button
          type="button"
          className="entrega-icone entrega-icone-principal"
          onClick={() => aoAlternar(entrega)}
          aria-label={
            feita
              ? `Desfazer conclusão de ${entrega.titulo}`
              : `Concluir ${entrega.titulo}`
          }
          title={feita ? 'Desfazer conclusão' : 'Concluir'}
        >
          <Icone nome={feita ? 'desfazer' : 'check'} tamanho={16} />
        </button>
        <button
          type="button"
          className="entrega-icone"
          onClick={() => aoExcluir(entrega)}
          aria-label={`Excluir ${entrega.titulo}`}
          title="Excluir"
        >
          <Icone nome="lixo" tamanho={16} />
        </button>
      </div>
    </li>
  )
}

/**
 * Página da matéria. A `key` faz a página nascer de novo ao trocar de
 * matéria, para a animação de abertura (e o filtro) recomeçar.
 */
export default function PaginaMateria() {
  const { id } = useParams()

  return <DetalhesDaMateria key={id} id={id} />
}

function DetalhesDaMateria({ id }) {
  const navegar = useNavigate()
  const {
    materias,
    tarefas,
    alterarStatus,
    removerTarefa,
    removerMateria,
    registrarFalta,
    definirCargaHoraria,
  } = useDados()
  const [filtro, setFiltro] = useState('todas')
  const [confirmando, setConfirmando] = useState(false)
  const materia = materias.find((item) => String(item.id) === id)

  if (!materia) return <Navigate to="/dashboard" replace />

  const entregas = tarefas.filter((tarefa) => tarefa.materiaId === materia.id)
  const agora = new Date()
  const contagem = contarPorCategoria(entregas)
  const pendencias = resumirPendencias(entregas, agora)
  const faltas = situacaoDasFaltas(materia)
  const pendentes = contagem.afazer + contagem.andamento
  const visiveis = ordenarPorUrgencia(
    entregas.filter(
      (entrega) => filtro === 'todas' || categoriaDaEntrega(entrega) === filtro,
    ),
    agora,
  )

  function alternar(entrega) {
    alterarStatus(
      entrega.id,
      entrega.status === 'CONCLUIDA' ? 'A_FAZER' : 'CONCLUIDA',
    )
  }

  function excluirMateria() {
    removerMateria(materia.id)
    navegar('/dashboard', { replace: true })
  }

  return (
    <div className={`materia-pagina materia-cor-${materia.cor}`}>
      <Link className="materia-voltar" to="/dashboard">
        ← Dashboard
      </Link>

      <header className="materia-topo">
        <div className="materia-topo-titulo">
          <h1>{materia.nome}</h1>
          <div className="materia-etiquetas">
            {materia.periodo && <span>Semestre {materia.periodo}</span>}
            <span>{faltas.carga} h</span>
          </div>
        </div>
        <dl className="materia-resumo">
          <div>
            <dt>Pendentes</dt>
            <dd>{pendentes}</dd>
          </div>
          <div>
            <dt>Concluídas</dt>
            <dd>{contagem.concluida}</dd>
          </div>
          <div>
            <dt>Faltas</dt>
            <dd>
              {faltas.faltas}
              <small> / {faltas.limite} h</small>
            </dd>
          </div>
        </dl>
        <BarraProgresso
          concluidas={contagem.concluida}
          total={contagem.todas}
          rotulo={`Progresso em ${materia.nome}`}
        />
        {pendencias && <p className="materia-pendencias">{pendencias}</p>}
      </header>

      <div className="materia-grade">
        <section className="materia-caixa" aria-labelledby="entregas-titulo">
          <div className="materia-caixa-topo">
            <h2 id="entregas-titulo">Entregas</h2>
            <div
              className="materia-filtros"
              role="group"
              aria-label="Filtrar entregas"
            >
              {FILTROS.map((opcao) => (
                <button
                  key={opcao.chave}
                  type="button"
                  aria-pressed={filtro === opcao.chave}
                  onClick={() => setFiltro(opcao.chave)}
                >
                  {opcao.titulo}
                  <span>{contagem[opcao.chave]}</span>
                </button>
              ))}
            </div>
          </div>
          {visiveis.length === 0 ? (
            <div>
              {entregas.length === 0 && <GatinhoDormindo />}
              <p className="materia-vazio">
                {entregas.length === 0
                  ? 'Nenhuma entrega ainda. Adicione na Agenda ou no Post it.'
                  : 'Nenhuma entrega neste filtro.'}
              </p>
            </div>
          ) : (
            <ul className="materia-entregas" key={filtro}>
              {visiveis.map((entrega, ordem) => (
                <Entrega
                  key={entrega.id}
                  entrega={entrega}
                  agora={agora}
                  ordem={ordem}
                  aoAlternar={alternar}
                  aoExcluir={(item) => removerTarefa(item.id)}
                />
              ))}
            </ul>
          )}
        </section>

        <aside className="materia-lateral">
          <NotasDaMateria materia={materia} />
          <section
            className="materia-caixa materia-faltas"
            aria-labelledby="faltas-titulo"
          >
            <div className="materia-caixa-topo">
              <h2 id="faltas-titulo">Faltas</h2>
              <span className="materia-dica">limite de 25%</span>
            </div>
            <BarraDeFaltas materia={materia} comNome={false} />
            <div className="materia-faltas-acoes">
              <button
                type="button"
                className="materia-botao materia-botao-forte"
                onClick={() => registrarFalta(materia.id, HORAS_POR_ENCONTRO)}
              >
                +1 falta ({HORAS_POR_ENCONTRO} h)
              </button>
              <button
                type="button"
                className="materia-botao"
                disabled={!materia.faltas}
                onClick={() => registrarFalta(materia.id, -HORAS_POR_ENCONTRO)}
              >
                Desfazer 1 falta
              </button>
            </div>
            <label className="materia-carga">
              Carga horária
              <select
                value={cargaHorariaDe(materia)}
                onChange={(evento) =>
                  definirCargaHoraria(materia.id, Number(evento.target.value))
                }
              >
                {[...new Set([...CARGAS, cargaHorariaDe(materia)])]
                  .sort((a, b) => a - b)
                  .map((horas) => (
                    <option key={horas} value={horas}>
                      {horas} h
                    </option>
                  ))}
              </select>
            </label>
          </section>

          <div className="materia-excluir">
            {confirmando ? (
              <div className="materia-confirmar" role="alert">
                <span>
                  Excluir “{materia.nome}” e as {entregas.length} entregas?
                </span>
                <div>
                  <button
                    type="button"
                    className="materia-botao materia-botao-perigo"
                    onClick={excluirMateria}
                  >
                    Confirmar exclusão
                  </button>
                  <button
                    type="button"
                    className="materia-botao"
                    onClick={() => setConfirmando(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="materia-link-perigo"
                onClick={() => setConfirmando(true)}
              >
                Excluir matéria
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
