import { useState } from 'react'
import JanelaNaPagina from '../../shared/components/JanelaNaPagina'
import { Link } from 'react-router'
import { TIPOS } from '../../dados/armazenamento'
import { useDados } from '../../dados/useDados'
import MenuDeOpcoes from '../../shared/components/MenuDeOpcoes'
import Icone from '../../shared/layout/Icone'
import '../../shared/cores.css'
import {
  compararPrazo,
  ehAtrasada,
  ehConcluida,
  ehNaoRealizada,
} from '../agenda/agendaUtils'
import { formatarPrazoCurto } from '../inicio/inicioUtils'
import './PostItPage.css'
import SeloAvaliativa from '../../shared/components/SeloAvaliativa'

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

/**
 * Formulário do post-it: o mesmo para escrever uma atividade nova e para
 * editar uma já colada (com os campos preenchidos).
 */
function FormularioDoPostIt({
  id,
  materia,
  rotulo,
  inicial = {},
  textoSalvar,
  textoCancelar,
  aoSalvar,
  aoCancelar,
}) {
  const [titulo, setTitulo] = useState(inicial.titulo ?? '')
  const [tipo, setTipo] = useState(
    TIPOS.includes(inicial.tipo) ? inicial.tipo : TIPOS[0],
  )
  const [data, setData] = useState(inicial.prazo?.slice(0, 10) ?? '')
  function salvar(evento) {
    evento.preventDefault()
    if (!titulo.trim() || !data) return

    // Ao editar, mantém a hora que já estava; post-it novo vence às 23:59.
    const hora = inicial.prazo?.slice(10) || 'T23:59:00'
    aoSalvar({ titulo: titulo.trim(), tipo, prazo: `${data}${hora}` })
  }

  return (
    <form className="postit-form" onSubmit={salvar} aria-label={rotulo}>
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
          {textoSalvar}
        </button>
        <button type="button" onClick={aoCancelar}>
          {textoCancelar}
        </button>
      </div>
    </form>
  )
}

/**
 * Post-it em branco: ao clicar, abre a janelinha para escrever a nova
 * atividade (saindo dele). Fechar a janela (Esc ou fora) deixa o post-it em
 * branco esperando; "Descartar" tira ele do mural.
 */
function PostItEmBranco({ rascunho, materia, aoSalvar, aoDescartar }) {
  const [origem, setOrigem] = useState(null)

  return (
    <li className={`postit postit-branco materia-cor-${materia.cor}`}>
      <button
        type="button"
        className="postit-abrir"
        onClick={(evento) =>
          setOrigem(evento.currentTarget.getBoundingClientRect())
        }
        title={materia.nome}
        aria-label={`Clique para escrever a atividade de ${materia.nome}`}
      >
        + Escrever
      </button>
      {origem && (
        <JanelaNaPagina
          origem={origem}
          rotulo={`Nova atividade de ${materia.nome}`}
          className={`postit-janela materia-cor-${materia.cor}`}
          aoFechar={() => setOrigem(null)}
        >
          {(fechar) => (
            <FormularioDoPostIt
              id={`rascunho-${rascunho.chave}`}
              materia={materia}
              rotulo={`Nova atividade de ${materia.nome}`}
              textoSalvar="Colar"
              textoCancelar="Descartar"
              aoSalvar={(campos) =>
                fechar(() =>
                  aoSalvar({ ...campos, materiaId: materia.id, descricao: '' }),
                )
              }
              aoCancelar={() => fechar(aoDescartar)}
            />
          )}
        </JanelaNaPagina>
      )}
    </li>
  )
}

function PostIt({ tarefa, materia, area, colado, aoMover, aoEditar }) {
  // Editando: onde estava o post-it, para a janelinha sair dele
  const [editando, setEditando] = useState(null)
  const atrasada = ehAtrasada(tarefa)
  function editar(evento) {
    // A janelinha é filha do post-it no React: cliques nela não reabrem
    if (evento.target.closest('.janela')) return

    setEditando(evento.currentTarget.closest('.postit').getBoundingClientRect())
  }

  return (
    <li
      className={`postit materia-cor-${materia?.cor ?? 'amarelo'}${
        atrasada ? ' postit-atrasado' : ''
      }${colado ? ' postit-colado' : ''}`}
      draggable
      onDragStart={(evento) => {
        if (!evento.target.closest?.('.janela')) {
          arrastar(evento, `tarefa:${tarefa.id}`)
        }
      }}
      onDoubleClick={editar}
      title={`${tarefa.titulo} · ${materia?.nome ?? ''} · ${tarefa.tipo ?? ''}`}
    >
      <span className="postit-escondido">
        {materia?.nome}, {tarefa.tipo}:
      </span>
      <p className="postit-titulo">
        <SeloAvaliativa tarefa={tarefa} />
        {tarefa.titulo}
      </p>
      <p className="postit-info">
        {formatarPrazoCurto(tarefa.prazo).replace(', 23:59', '')}
        {atrasada && <strong> !</strong>}
        {atrasada && <span className="postit-escondido">atrasada</span>}
      </p>
      <span className="postit-mover">
        <button
          type="button"
          className="postit-editar"
          aria-label={`Editar ${tarefa.titulo}`}
          title="Editar (ou dê dois cliques no post-it)"
          onClick={editar}
        >
          <Icone nome="lapis" tamanho={13} />
        </button>
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
      {editando && (
        <JanelaNaPagina
          origem={editando}
          rotulo={`Editar ${tarefa.titulo}`}
          className={`postit-janela materia-cor-${materia?.cor ?? 'amarelo'}`}
          aoFechar={() => setEditando(null)}
        >
          {(fechar) => (
            <FormularioDoPostIt
              id={`editar-${tarefa.id}`}
              materia={materia ?? { nome: '' }}
              rotulo={`Editar ${tarefa.titulo}`}
              inicial={tarefa}
              textoSalvar="Salvar"
              textoCancelar="Cancelar"
              aoSalvar={(campos) => fechar(() => aoEditar(campos))}
              aoCancelar={() => fechar()}
            />
          )}
        </JanelaNaPagina>
      )}
    </li>
  )
}

/**
 * Mural de post-its: outra forma de ver as tarefas da Agenda. Cada matéria tem
 * um bloco na cor dela; arraste o bloco para Atividades (ou clique nele) e um
 * post-it em branco aparece para você escrever a atividade e a data.
 */
export default function PostItPage() {
  const { materias, tarefas, adicionarTarefa, alterarStatus, editarTarefa } =
    useDados()
  const [rascunhos, setRascunhos] = useState([])
  const [alvo, setAlvo] = useState(null)
  const [proximaChave, setProximaChave] = useState(1)
  // Hora do último post-it colado ou salvo: os mudados desde então dão um
  // pulinho ao aparecer (ver postit-colado)
  const [coladoDesde, setColadoDesde] = useState(null)

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
        <p className="subtitulo-pagina">
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
      <p className="subtitulo-pagina">
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
                              setColadoDesde(Date.now())
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
                            colado={
                              coladoDesde !== null &&
                              (tarefa.alteradoEm ?? 0) >= coladoDesde
                            }
                            aoMover={(destino) => mover(tarefa, destino)}
                            aoEditar={(campos) => {
                              setColadoDesde(Date.now())
                              editarTarefa(tarefa.id, campos)
                            }}
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
