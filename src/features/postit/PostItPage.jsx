import { useState } from 'react'
import { Link } from 'react-router'
import { TIPOS } from '../../dados/armazenamento'
import { useDados } from '../../dados/useDados'
import MenuDeOpcoes from '../../shared/components/MenuDeOpcoes'
import '../../shared/cores.css'
import {
  compararPrazo,
  ehAtrasada,
  ehConcluida,
  ehNaoRealizada,
} from '../agenda/agendaUtils'
import { formatarPrazoCurto } from '../inicio/inicioUtils'
import './PostItPage.css'

/** As três áreas do mural. `status` é o que a tarefa recebe ao chegar ali. */
const AREAS = [
  { chave: 'atividades', titulo: 'Atividades', status: 'A_FAZER' },
  { chave: 'concluidas', titulo: 'Concluídas', status: 'CONCLUIDA' },
  {
    chave: 'naorealizadas',
    titulo: 'Não realizadas',
    status: 'NAO_REALIZADA',
  },
]

function areaDa(tarefa) {
  if (ehConcluida(tarefa.status)) return 'concluidas'
  if (ehNaoRealizada(tarefa.status)) return 'naorealizadas'

  return 'atividades'
}

/** O que está sendo arrastado: um bloco de matéria ou um post-it já salvo. */
function arrastar(evento, valor) {
  evento.dataTransfer.setData('text/plain', valor)
  evento.dataTransfer.effectAllowed = 'copyMove'
}

/** Post-it em branco: ao clicar, vira o formulário da nova atividade. */
function PostItEmBranco({ rascunho, materia, aoSalvar, aoDescartar }) {
  const [aberto, setAberto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState(TIPOS[0])
  const [data, setData] = useState('')
  const id = `rascunho-${rascunho.chave}`

  function salvar(evento) {
    evento.preventDefault()
    if (!titulo.trim() || !data) return

    aoSalvar({
      materiaId: materia.id,
      titulo: titulo.trim(),
      tipo,
      prazo: `${data}T23:59:00`,
      descricao: '',
    })
  }

  if (!aberto) {
    return (
      <li className={`postit postit-branco materia-cor-${materia.cor}`}>
        <button
          type="button"
          className="postit-abrir"
          onClick={() => setAberto(true)}
          title={materia.nome}
          aria-label={`Clique para escrever a atividade de ${materia.nome}`}
        >
          + Escrever
        </button>
      </li>
    )
  }

  return (
    <li
      className={`postit postit-branco postit-aberto materia-cor-${materia.cor}`}
    >
      <form
        className="postit-form"
        onSubmit={salvar}
        aria-label={`Nova atividade de ${materia.nome}`}
      >
        <span className="postit-materia">{materia.nome}</span>
        <label htmlFor={`${id}-titulo`}>Atividade</label>
        <input
          id={`${id}-titulo`}
          type="text"
          value={titulo}
          maxLength={120}
          autoFocus
          onChange={(evento) => setTitulo(evento.target.value)}
        />
        <label htmlFor={`${id}-tipo`}>Tipo</label>
        <select
          id={`${id}-tipo`}
          value={tipo}
          onChange={(evento) => setTipo(evento.target.value)}
        >
          {TIPOS.map((opcao) => (
            <option key={opcao}>{opcao}</option>
          ))}
        </select>
        <label htmlFor={`${id}-data`}>Data de entrega</label>
        <input
          id={`${id}-data`}
          type="date"
          value={data}
          onChange={(evento) => setData(evento.target.value)}
        />
        <div className="postit-acoes">
          <button type="submit" disabled={!titulo.trim() || !data}>
            Colar
          </button>
          <button type="button" onClick={aoDescartar}>
            Descartar
          </button>
        </div>
      </form>
    </li>
  )
}

function PostIt({ tarefa, materia, area, aoMover }) {
  const atrasada = ehAtrasada(tarefa)

  return (
    <li
      className={`postit materia-cor-${materia?.cor ?? 'amarelo'}${
        atrasada ? ' postit-atrasado' : ''
      }`}
      draggable
      onDragStart={(evento) => arrastar(evento, `tarefa:${tarefa.id}`)}
      title={`${tarefa.titulo} · ${materia?.nome ?? ''} · ${tarefa.tipo ?? ''}`}
    >
      <span className="postit-escondido">
        {materia?.nome}, {tarefa.tipo}:
      </span>
      <p className="postit-titulo">{tarefa.titulo}</p>
      <p className="postit-info">
        {formatarPrazoCurto(tarefa.prazo).replace(', 23:59', '')}
        {atrasada && <strong> !</strong>}
        {atrasada && <span className="postit-escondido">atrasada</span>}
      </p>
      <span className="postit-mover">
        <MenuDeOpcoes
          rotulo={`Mover ${tarefa.titulo} para`}
          valor={area}
          opcoes={AREAS.map((opcao) => ({
            valor: opcao.chave,
            titulo: opcao.titulo,
          }))}
          aoMudar={aoMover}
          tamanho={14}
        />
      </span>
    </li>
  )
}

/**
 * Mural de post-its: outra forma de ver as tarefas da Agenda. Cada matéria tem
 * um bloco na cor dela; arraste o bloco para Atividades (ou clique nele) e um
 * post-it em branco aparece para você escrever a atividade e a data.
 */
export default function PostItPage() {
  const { materias, tarefas, adicionarTarefa, alterarStatus } = useDados()
  const [rascunhos, setRascunhos] = useState([])
  const [alvo, setAlvo] = useState(null)
  const [proximaChave, setProximaChave] = useState(1)

  const materiaDe = (id) => materias.find((materia) => materia.id === id)

  function novoRascunho(materiaId) {
    if (!materiaDe(materiaId)) return

    setRascunhos((atuais) => [...atuais, { chave: proximaChave, materiaId }])
    setProximaChave((chave) => chave + 1)
  }

  function tirarRascunho(chave) {
    setRascunhos((atuais) => atuais.filter((item) => item.chave !== chave))
  }

  function mover(tarefa, area) {
    if (areaDa(tarefa) === area) return

    alterarStatus(tarefa.id, AREAS.find((opcao) => opcao.chave === area).status)
  }

  function soltar(evento, area) {
    evento.preventDefault()
    setAlvo(null)

    const [tipo, id] = evento.dataTransfer.getData('text/plain').split(':')

    if (tipo === 'materia' && area === 'atividades') {
      novoRascunho(Number(id))
    }
    if (tipo === 'tarefa') {
      const tarefa = tarefas.find((item) => item.id === Number(id))

      if (tarefa) mover(tarefa, area)
    }
  }

  if (materias.length === 0) {
    return (
      <div className="postit-pagina">
        <h1 className="titulo-pagina">Post it</h1>
        <p className="postit-subtitulo">
          Cadastre uma matéria primeiro, em{' '}
          <Link to="/adicionar-materia">Adicionar matéria</Link>. Cada matéria
          ganha um bloco de post-it na cor dela.
        </p>
      </div>
    )
  }

  return (
    <div className="postit-pagina">
      <h1 className="titulo-pagina">Post it</h1>
      <p className="postit-subtitulo">
        Arraste o bloco de uma matéria para Atividades (ou clique nele) e
        escreva a atividade no post-it. Tudo aparece também na Agenda.
      </p>

      <section className="postit-blocos" aria-labelledby="postit-blocos">
        <h2 id="postit-blocos">Blocos</h2>
        <ul>
          {materias.map((materia) => (
            <li key={materia.id}>
              <button
                type="button"
                className={`postit-bloco materia-cor-${materia.cor}`}
                draggable
                onDragStart={(evento) =>
                  arrastar(evento, `materia:${materia.id}`)
                }
                onClick={() => novoRascunho(materia.id)}
                aria-label={`Novo post-it de ${materia.nome}`}
                title={materia.nome}
              >
                <span className="postit-bloco-nome">{materia.nome}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="postit-areas">
        {AREAS.map((area) => {
          const daArea = tarefas
            .filter((tarefa) => areaDa(tarefa) === area.chave)
            .sort(compararPrazo)
          const embranco =
            area.chave === 'atividades'
              ? rascunhos.filter((item) => materiaDe(item.materiaId))
              : []
          const vazia = daArea.length === 0 && embranco.length === 0
          // Uma fileira por matéria, na mesma ordem dos blocos.
          const grupos = materias
            .map((materia) => ({
              materia,
              rascunhos: embranco.filter(
                (item) => item.materiaId === materia.id,
              ),
              tarefas: daArea.filter(
                (tarefa) => tarefa.materiaId === materia.id,
              ),
            }))
            .filter(
              (grupo) => grupo.rascunhos.length + grupo.tarefas.length > 0,
            )

          return (
            <section
              key={area.chave}
              className={`postit-area postit-area-${area.chave}${
                alvo === area.chave ? ' postit-area-alvo' : ''
              }`}
              aria-labelledby={`postit-area-${area.chave}`}
              onDragOver={(evento) => {
                evento.preventDefault()
                setAlvo(area.chave)
              }}
              onDragLeave={() => setAlvo(null)}
              onDrop={(evento) => soltar(evento, area.chave)}
            >
              <h2 id={`postit-area-${area.chave}`}>
                {area.titulo} <span>({daArea.length})</span>
              </h2>

              {vazia ? (
                <p className="postit-vazio">
                  {area.chave === 'atividades'
                    ? 'Arraste um bloco para cá.'
                    : 'Arraste um post-it para cá.'}
                </p>
              ) : (
                <div className="postit-grupos">
                  {grupos.map(
                    ({ materia, rascunhos: brancos, tarefas: dela }) => (
                      <ul
                        key={materia.id}
                        className="postit-lista"
                        aria-label={`${area.titulo}: ${materia.nome}`}
                      >
                        {brancos.map((rascunho) => (
                          <PostItEmBranco
                            key={`r${rascunho.chave}`}
                            rascunho={rascunho}
                            materia={materia}
                            aoSalvar={(tarefa) => {
                              adicionarTarefa(tarefa)
                              tirarRascunho(rascunho.chave)
                            }}
                            aoDescartar={() => tirarRascunho(rascunho.chave)}
                          />
                        ))}
                        {dela.map((tarefa) => (
                          <PostIt
                            key={tarefa.id}
                            tarefa={tarefa}
                            materia={materia}
                            area={area.chave}
                            aoMover={(destino) => mover(tarefa, destino)}
                          />
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
