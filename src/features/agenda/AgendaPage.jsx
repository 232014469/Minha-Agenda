import { useState } from 'react'
import { Link } from 'react-router'
import { TIPOS } from '../../dados/armazenamento'
import { useDados } from '../../dados/useDados'
import MenuDeOpcoes from '../../shared/components/MenuDeOpcoes'
import {
  agruparPorDia,
  categorizarEntrega,
  chaveDoDia,
  compararPrazo,
  descreverSemana,
  diasDaSemana,
  ehAtrasada,
  ehNaoRealizada,
  ehConcluida,
  formatarHora,
  formatarPrazoDdMm,
  inicioDaSemana,
  montarSemanas,
  nomeDoMes,
  rotuloDoStatus,
} from './agendaUtils'
import './AgendaPage.css'

const DIAS_DA_SEMANA = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']
const DIAS_POR_EXTENSO = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
]

// `chave` é a coluna em que o item aparece; `status` é o valor que a API recebe.
const COLUNAS = [
  { chave: 'A_FAZER', status: 'A_FAZER', titulo: 'A fazer' },
  { chave: 'EM_ANDAMENTO', status: 'EM_ANDAMENTO', titulo: 'Em andamento' },
  { chave: 'CONCLUIDAS', status: 'CONCLUIDA', titulo: 'Concluídas' },
  { chave: 'NAO_REALIZADA', status: 'NAO_REALIZADA', titulo: 'Não realizadas' },
]

function descreverStatus(item) {
  if (ehConcluida(item.status)) return 'concluída'
  if (ehNaoRealizada(item.status)) return 'não realizada'
  if (ehAtrasada(item)) return 'atrasada'

  return 'a fazer'
}

function Chip({ item, cor }) {
  const classes = ['agenda-chip', `agenda-chip-${cor}`]

  if (ehConcluida(item.status) || ehNaoRealizada(item.status)) {
    classes.push('agenda-chip-concluida')
  }
  if (ehAtrasada(item)) classes.push('agenda-chip-atrasada')

  return (
    <li
      className={classes.join(' ')}
      title={`${item.titulo} · ${item.disciplina ?? ''}`}
    >
      <span className="agenda-chip-tipo" aria-hidden="true">
        {item.tipo || 'Atividade'}
      </span>
      <span className="agenda-so-leitor">
        {item.titulo}, {item.disciplina}, {descreverStatus(item)}
      </span>
    </li>
  )
}

function Calendario({ ano, mes, porDia, corDe, hoje }) {
  const semanas = montarSemanas(ano, mes)
  const chaveDeHoje = chaveDoDia(hoje)

  return (
    <table className="agenda-tabela">
      <caption className="agenda-so-leitor">
        Calendário de {nomeDoMes(ano, mes)}
      </caption>
      <thead>
        <tr>
          {DIAS_DA_SEMANA.map((dia) => (
            <th key={dia} scope="col">
              {dia}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {semanas.map((semana) => (
          <tr key={semana[0].chave}>
            {semana.map((dia) => {
              // As atividades de outro mês aparecem só no calendário do mês delas.
              const itens = dia.foraDoMes ? [] : (porDia.get(dia.chave) ?? [])
              const classes = ['agenda-dia']

              if (dia.foraDoMes) classes.push('agenda-dia-fora')
              if (dia.chave === chaveDeHoje) classes.push('agenda-dia-hoje')

              return (
                <td key={dia.chave} className={classes.join(' ')}>
                  <span className="agenda-dia-numero">
                    {String(dia.data.getDate()).padStart(2, '0')}
                  </span>
                  {itens.length > 0 && (
                    <ul className="agenda-chips">
                      {itens.map((item) => (
                        <Chip
                          key={item.id}
                          item={item}
                          cor={corDe(item.disciplina)}
                        />
                      ))}
                    </ul>
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Semana com mais detalhes: um dia por linha, com um cartão para cada entrega.
function SemanaDetalhada({ inicio, porDia, corDe, hoje }) {
  const chaveDeHoje = chaveDoDia(hoje)

  return (
    <div className="agenda-semana">
      {diasDaSemana(inicio).map((data, indice) => {
        const chave = chaveDoDia(data)
        const itens = porDia.get(chave) ?? []

        return (
          <section
            key={chave}
            className={`agenda-semana-dia${
              chave === chaveDeHoje ? ' agenda-dia-hoje' : ''
            }`}
            aria-label={`${DIAS_POR_EXTENSO[indice]}, ${formatarPrazoDdMm(data)}`}
          >
            <h3>
              {DIAS_POR_EXTENSO[indice]}
              <span>{formatarPrazoDdMm(data)}</span>
            </h3>
            {itens.length === 0 ? (
              <p className="agenda-semana-vazio">Sem atividades</p>
            ) : (
              <ul className="agenda-semana-cartoes">
                {itens.map((item) => (
                  <li
                    key={item.id}
                    className={`agenda-cartao agenda-chip-${corDe(
                      item.disciplina,
                    )}${ehConcluida(item.status) ? ' agenda-chip-concluida' : ''}${
                      ehAtrasada(item) ? ' agenda-chip-atrasada' : ''
                    }`}
                  >
                    <span className="agenda-cartao-hora">
                      {formatarHora(item.prazo)}
                    </span>
                    <strong>{item.titulo}</strong>
                    {item.descricao && <p>{item.descricao}</p>}
                    <span className="agenda-cartao-meta">
                      {item.disciplina} · {item.tipo}
                    </span>
                    <span className="agenda-cartao-status">
                      {rotuloDoStatus(item)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

function ListaDoMes({ itens, corDe }) {
  if (itens.length === 0) {
    return <p className="agenda-vazio-mes">Nenhuma atividade neste mês.</p>
  }

  return (
    <ul className="agenda-lista">
      {itens.map((item) => (
        <li
          key={item.id}
          className={`agenda-lista-item agenda-chip-${corDe(item.disciplina)}${
            ehAtrasada(item) ? ' agenda-chip-atrasada' : ''
          }`}
        >
          <strong>{formatarPrazoDdMm(item.prazo)}</strong>
          <span className="agenda-lista-titulo">{item.titulo}</span>
          <span className="agenda-lista-meta">
            {item.disciplina} · {item.tipo} · {descreverStatus(item)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function Filtro({ disciplinas, ocultas, corDe, aoAlternar }) {
  return (
    <section className="agenda-caixa">
      <h2>Filtrar por matéria</h2>
      {disciplinas.length === 0 ? (
        <p className="agenda-nota">Nenhuma matéria na agenda.</p>
      ) : (
        <ul className="agenda-filtro">
          {disciplinas.map((nome) => (
            <li key={nome}>
              <label>
                <input
                  type="checkbox"
                  checked={!ocultas.has(nome)}
                  onChange={() => aoAlternar(nome)}
                />
                <span
                  className={`agenda-ponto agenda-ponto-${corDe(nome)}`}
                  aria-hidden="true"
                />
                {nome}
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function AdicionarTarefa({ materias, aoAdicionar }) {
  const [materiaId, setMateriaId] = useState('')
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState(TIPOS[0])
  const [data, setData] = useState('')
  const [observacao, setObservacao] = useState('')
  const [aviso, setAviso] = useState(null)

  if (materias.length === 0) {
    return (
      <section className="agenda-caixa agenda-adicionar">
        <h2>Adicionar tarefas</h2>
        <p className="agenda-nota">
          Cadastre uma matéria primeiro, em{' '}
          <Link to="/adicionar-materia">Adicionar matéria</Link>.
        </p>
      </section>
    )
  }

  function enviar(evento) {
    evento.preventDefault()

    if (!materiaId || !titulo.trim() || !data) {
      setAviso('Preencha a matéria, o título e a data de entrega.')
      return
    }

    aoAdicionar({
      materiaId: Number(materiaId),
      titulo: titulo.trim(),
      tipo,
      prazo: `${data}T23:59:00`,
      descricao: observacao.trim(),
    })
    setTitulo('')
    setObservacao('')
    setAviso(null)
  }

  return (
    <section className="agenda-caixa agenda-adicionar">
      <h2>Adicionar tarefas</h2>
      <form onSubmit={enviar}>
        <label>
          Matéria
          <select
            value={materiaId}
            onChange={(evento) => setMateriaId(evento.target.value)}
          >
            <option value="">Escolha a matéria</option>
            {materias.map((materia) => (
              <option key={materia.id} value={materia.id}>
                {materia.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          Título
          <input
            type="text"
            value={titulo}
            maxLength={120}
            onChange={(evento) => setTitulo(evento.target.value)}
          />
        </label>
        <label>
          Tipo
          <select
            value={tipo}
            onChange={(evento) => setTipo(evento.target.value)}
          >
            {TIPOS.map((opcao) => (
              <option key={opcao}>{opcao}</option>
            ))}
          </select>
        </label>
        <label>
          Data de entrega
          <input
            type="date"
            value={data}
            onChange={(evento) => setData(evento.target.value)}
          />
        </label>
        <label>
          Observação
          <textarea
            rows="3"
            value={observacao}
            onChange={(evento) => setObservacao(evento.target.value)}
          />
        </label>
        {aviso && (
          <p className="agenda-aviso" role="alert">
            {aviso}
          </p>
        )}
        <button type="submit">Adicionar</button>
      </form>
    </section>
  )
}

// Quadro de três colunas: arrastar o cartão (ou o seletor "Mover para") muda a situação.
function Quadro({ itens, alvo, setAlvo, soltar, mover, erroAcao, corDe }) {
  return (
    <>
      <p className="agenda-dica">
        Arraste um cartão para outra coluna ou use o seletor “Mover para” para
        mudar a situação da entrega.
      </p>
      {erroAcao && (
        <p className="agenda-erro-acao" role="alert">
          {erroAcao}
        </p>
      )}
      <div className="agenda-kanban">
        {COLUNAS.map((coluna) => {
          const atividadesDaColuna = itens
            .filter((item) => categorizarEntrega(item) === coluna.chave)
            .sort(compararPrazo)

          return (
            <section
              key={coluna.chave}
              className={
                alvo === coluna.chave
                  ? 'agenda-coluna agenda-coluna-alvo'
                  : 'agenda-coluna'
              }
              aria-labelledby={`coluna-titulo-${coluna.chave}`}
              onDragOver={(evento) => {
                evento.preventDefault()
                setAlvo(coluna.chave)
              }}
              onDragLeave={() => setAlvo(null)}
              onDrop={(evento) => soltar(evento, coluna.status)}
            >
              <div className="agenda-coluna-topo">
                <h2 id={`coluna-titulo-${coluna.chave}`}>{coluna.titulo}</h2>
                <span
                  className="agenda-coluna-contagem"
                  aria-label={`${atividadesDaColuna.length} atividades em ${coluna.titulo}`}
                >
                  {atividadesDaColuna.length}
                </span>
              </div>

              {atividadesDaColuna.length === 0 ? (
                <p className="agenda-coluna-vazio">
                  Nenhuma atividade nesta coluna.
                </p>
              ) : (
                <ul className="agenda-coluna-lista">
                  {atividadesDaColuna.map((item) => {
                    const atrasada = ehAtrasada(item)
                    return (
                      <li
                        key={item.id}
                        draggable
                        onDragStart={(evento) => {
                          evento.dataTransfer.setData(
                            'text/plain',
                            String(item.id),
                          )
                          evento.dataTransfer.effectAllowed = 'move'
                        }}
                        onDragEnd={() => setAlvo(null)}
                        className={
                          atrasada ? 'agenda-card atrasada' : 'agenda-card'
                        }
                      >
                        <h3>{item.titulo}</h3>
                        {item.descricao && <p>{item.descricao}</p>}
                        <div className="agenda-card-meta">
                          {item.disciplina && (
                            <span
                              className={`agenda-badge-disciplina agenda-chip-${corDe(item.disciplina)}`}
                            >
                              {item.disciplina}
                            </span>
                          )}
                          {item.tipo && (
                            <span className="agenda-badge-tipo">
                              {item.tipo}
                            </span>
                          )}
                          {item.prazo && (
                            <span className="agenda-prazo">
                              Prazo: {formatarPrazoDdMm(item.prazo)}
                              {atrasada && (
                                <span
                                  className="agenda-alerta-atraso"
                                  role="status"
                                  aria-label="Atividade atrasada"
                                >
                                  (Atrasada)
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                        <span className="agenda-mover">
                          <MenuDeOpcoes
                            rotulo={`Mover ${item.titulo} para`}
                            valor={coluna.status}
                            opcoes={COLUNAS.map((opcao) => ({
                              valor: opcao.status,
                              titulo: opcao.titulo,
                            }))}
                            aoMudar={(status) => mover(item.id, status)}
                          />
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}

export default function AgendaPage() {
  const { materias, tarefas, adicionarTarefa, alterarStatus } = useDados()
  const [alvo, setAlvo] = useState(null)
  const [vista, setVista] = useState('mes')
  const [mostrado, setMostrado] = useState(() => {
    const hoje = new Date()

    return { ano: hoje.getFullYear(), mes: hoje.getMonth() }
  })
  const [semana, setSemana] = useState(() => inicioDaSemana(new Date()))
  const [ocultas, setOcultas] = useState(() => new Set())
  const itens = tarefas.map((tarefa) => ({
    ...tarefa,
    disciplina: materias.find((materia) => materia.id === tarefa.materiaId)
      ?.nome,
  }))

  function mover(id, status) {
    const atual = itens.find((item) => item.id === id)

    if (
      !atual ||
      categorizarEntrega(atual) === categorizarEntrega({ status })
    ) {
      return
    }

    alterarStatus(id, status)
  }

  function soltar(evento, status) {
    evento.preventDefault()
    setAlvo(null)

    const id = Number(evento.dataTransfer.getData('text/plain'))

    if (!Number.isNaN(id)) {
      mover(id, status)
    }
  }

  function mudarMes(passo) {
    setMostrado(({ ano, mes }) => {
      const data = new Date(ano, mes + passo, 1)

      return { ano: data.getFullYear(), mes: data.getMonth() }
    })
  }

  function mudarSemana(passo) {
    setSemana(
      (inicio) =>
        new Date(
          inicio.getFullYear(),
          inicio.getMonth(),
          inicio.getDate() + passo * 7,
        ),
    )
  }

  function navegar(passo) {
    if (vista === 'semana') mudarSemana(passo)
    else mudarMes(passo)
  }

  // Ao trocar de vista, a nova começa no período que o aluno estava olhando.
  function escolherVista(nova) {
    if (nova === 'semana' && vista !== 'semana') {
      const hoje = new Date()
      const nesteMes =
        hoje.getFullYear() === mostrado.ano && hoje.getMonth() === mostrado.mes

      setSemana(
        inicioDaSemana(
          nesteMes ? hoje : new Date(mostrado.ano, mostrado.mes, 1),
        ),
      )
    } else if (nova !== 'semana' && vista === 'semana') {
      // Se a semana tem o dia de hoje, vale o mês de hoje; senão, o da quinta-feira.
      const dias = diasDaSemana(semana)
      const chaveDeHoje = chaveDoDia(new Date())
      const referencia =
        dias.find((dia) => chaveDoDia(dia) === chaveDeHoje) ?? dias[3]

      setMostrado({
        ano: referencia.getFullYear(),
        mes: referencia.getMonth(),
      })
    }
    setVista(nova)
  }

  function alternarMateria(nome) {
    setOcultas((anteriores) => {
      const novas = new Set(anteriores)

      if (novas.has(nome)) novas.delete(nome)
      else novas.add(nome)

      return novas
    })
  }

  const disciplinas = materias.map((materia) => materia.nome)
  const corDe = (nome) =>
    materias.find((materia) => materia.nome === nome)?.cor ?? 'lilas'
  const visiveis = itens.filter((item) => !ocultas.has(item.disciplina))
  const porDia = agruparPorDia(visiveis)
  const doMes = visiveis
    .filter((item) => {
      const data = new Date(item.prazo)

      return (
        data.getFullYear() === mostrado.ano && data.getMonth() === mostrado.mes
      )
    })
    .sort((a, b) => new Date(a.prazo) - new Date(b.prazo))

  const conteudo = (
    <div
      className={`agenda-grade${vista === 'quadro' ? ' agenda-grade-quadro' : ''}`}
    >
      <section className="agenda-calendario" aria-label="Calendário">
        <div className="agenda-barra">
          <div className="agenda-vistas" role="group" aria-label="Vista">
            <button
              type="button"
              aria-pressed={vista === 'mes'}
              onClick={() => escolherVista('mes')}
            >
              Mês
            </button>
            <button
              type="button"
              aria-pressed={vista === 'semana'}
              onClick={() => escolherVista('semana')}
            >
              Semana
            </button>
            <button
              type="button"
              aria-pressed={vista === 'lista'}
              onClick={() => escolherVista('lista')}
            >
              Lista
            </button>
            <button
              type="button"
              aria-pressed={vista === 'quadro'}
              onClick={() => escolherVista('quadro')}
            >
              Quadro
            </button>
          </div>
          {vista !== 'quadro' && (
            <div className="agenda-navegacao">
              <button
                type="button"
                aria-label={
                  vista === 'semana' ? 'Semana anterior' : 'Mês anterior'
                }
                onClick={() => navegar(-1)}
              >
                ‹
              </button>
              <h2 aria-live="polite">
                {vista === 'semana'
                  ? descreverSemana(semana)
                  : nomeDoMes(mostrado.ano, mostrado.mes)}
              </h2>
              <button
                type="button"
                aria-label={
                  vista === 'semana' ? 'Próxima semana' : 'Próximo mês'
                }
                onClick={() => navegar(1)}
              >
                ›
              </button>
            </div>
          )}
        </div>
        {vista === 'quadro' ? (
          <Quadro
            itens={itens}
            alvo={alvo}
            setAlvo={setAlvo}
            soltar={soltar}
            mover={mover}
            corDe={corDe}
          />
        ) : vista === 'mes' ? (
          <Calendario
            ano={mostrado.ano}
            mes={mostrado.mes}
            porDia={porDia}
            corDe={corDe}
            hoje={new Date()}
          />
        ) : vista === 'semana' ? (
          <SemanaDetalhada
            inicio={semana}
            porDia={porDia}
            corDe={corDe}
            hoje={new Date()}
          />
        ) : (
          <ListaDoMes itens={doMes} corDe={corDe} />
        )}
      </section>
      {vista !== 'quadro' && (
        <aside className="agenda-lateral">
          <Filtro
            disciplinas={disciplinas}
            ocultas={ocultas}
            corDe={corDe}
            aoAlternar={alternarMateria}
          />
          <AdicionarTarefa materias={materias} aoAdicionar={adicionarTarefa} />
        </aside>
      )}
    </div>
  )

  return (
    <div className="agenda-pagina">
      <h1 className="titulo-pagina">Agenda</h1>
      <p className="agenda-subtitulo">
        Organize seus compromissos acadêmicos e nunca perca um prazo.
      </p>
      {conteudo}
    </div>
  )
}
