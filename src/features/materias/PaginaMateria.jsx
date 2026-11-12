import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { useDados } from '../../dados/useDados'
import BarraProgresso from '../../shared/components/BarraProgresso'
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

const formatarData = (prazo) =>
  new Date(prazo).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

function Entrega({ entrega, numero, agora, aoAlternar, aoExcluir }) {
  const categoria = categoriaDaEntrega(entrega)
  const atrasada = estaAtrasada(entrega, agora)
  const situacao = SITUACAO[categoria]
  const feita = categoria === 'concluida'

  return (
    <li
      className={`entrega entrega-${situacao.classe}${
        atrasada ? ' entrega-atrasada' : ''
      }`}
    >
      <span className="entrega-numero" aria-hidden="true">
        {numero}
      </span>
      <div className="entrega-conteudo">
        <h3>{entrega.titulo}</h3>
        {entrega.descricao && <p>{entrega.descricao}</p>}
        <div className="entrega-meta">
          {entrega.tipo && <span>{entrega.tipo}</span>}
          <span>
            Prazo:{' '}
            <time dateTime={entrega.prazo}>{formatarData(entrega.prazo)}</time>
          </span>
          {!feita && (
            <strong className="entrega-prazo-texto">
              {descreverPrazo(entrega.prazo, agora)}
            </strong>
          )}
        </div>
      </div>
      <div className="entrega-selos">
        <span className={`entrega-status entrega-status-${situacao.classe}`}>
          {situacao.texto}
        </span>
        {atrasada && <span className="entrega-aviso">Atrasada</span>}
        <button
          type="button"
          className="entrega-botao"
          onClick={() => aoAlternar(entrega)}
          aria-label={
            feita
              ? `Desfazer conclusão de ${entrega.titulo}`
              : `Concluir ${entrega.titulo}`
          }
        >
          {feita ? 'Desfazer' : 'Concluir'}
        </button>
        <button
          type="button"
          className="entrega-botao"
          onClick={() => aoExcluir(entrega)}
          aria-label={`Excluir ${entrega.titulo}`}
        >
          Excluir
        </button>
      </div>
    </li>
  )
}

export default function PaginaMateria() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { materias, tarefas, alterarStatus, removerTarefa, removerMateria } =
    useDados()
  const [filtro, setFiltro] = useState('todas')
  const [confirmando, setConfirmando] = useState(false)
  const materia = materias.find((item) => String(item.id) === id)

  if (!materia) return <Navigate to="/dashboard" replace />

  const entregas = tarefas.filter((tarefa) => tarefa.materiaId === materia.id)
  const agora = new Date()
  const contagem = contarPorCategoria(entregas)
  const pendencias = resumirPendencias(entregas, agora)
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
    <div className="disciplina-layout">
      <div className="disciplina-main">
        <Link className="disciplina-voltar" to="/dashboard">
          ← Voltar para o Dashboard
        </Link>
        <div className={`disciplina-pagina materia-cor-${materia.cor}`}>
          <header className="disciplina-cabecalho">
            <span className="disciplina-icone" aria-hidden="true">
              ▤
            </span>
            <div className="disciplina-cabecalho-texto">
              <h1>{materia.nome}</h1>
              {materia.periodo && <p>Semestre · {materia.periodo}</p>}
              <BarraProgresso
                concluidas={contagem.concluida}
                total={contagem.todas}
                rotulo={`Progresso em ${materia.nome}`}
              />
              {pendencias && (
                <p className="disciplina-pendencias">{pendencias}</p>
              )}
            </div>
          </header>

          <section
            className="disciplina-painel"
            aria-labelledby="entregas-titulo"
          >
            <div className="disciplina-titulo">
              <h2 id="entregas-titulo">Entregas</h2>
              <span>{entregas.length} atividades</span>
            </div>
            <div
              className="disciplina-filtros"
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
                  {opcao.titulo} ({contagem[opcao.chave]})
                </button>
              ))}
            </div>
            {visiveis.length === 0 ? (
              <p className="disciplina-vazio">
                {entregas.length === 0
                  ? 'Nenhuma entrega ainda. Adicione na Agenda.'
                  : 'Nenhuma entrega neste filtro.'}
              </p>
            ) : (
              <ul className="disciplina-entregas">
                {visiveis.map((entrega, posicao) => (
                  <Entrega
                    key={entrega.id}
                    entrega={entrega}
                    numero={posicao + 1}
                    agora={agora}
                    aoAlternar={alternar}
                    aoExcluir={(item) => removerTarefa(item.id)}
                  />
                ))}
              </ul>
            )}
          </section>

          <section
            className="disciplina-painel"
            aria-label="Ajustes da matéria"
          >
            <div className="disciplina-ajustes">
              {confirmando ? (
                <div className="disciplina-confirmar" role="alert">
                  <span>
                    Excluir “{materia.nome}” e as {entregas.length} entregas?
                  </span>
                  <button type="button" onClick={excluirMateria}>
                    Confirmar exclusão
                  </button>
                  <button type="button" onClick={() => setConfirmando(false)}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmando(true)}>
                  Excluir matéria
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
