import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { Link, useLocation } from 'react-router'
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
import '../../shared/cores.css'
import './AgendaPage.css'
import SeloAvaliativa from '../../shared/components/SeloAvaliativa'

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
        <SeloAvaliativa tarefa={item} />
        {item.tipo || 'Atividade'}
      </span>
      <span className="agenda-so-leitor">
        {item.titulo}, {item.disciplina}, {descreverStatus(item)}
      </span>
    </li>
  )
}

function Calendario({ ano, mes, porDia, corDe, hoje, aoAbrirDia }) {
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
                <td
                  key={dia.chave}
                  className={classes.join(' ')}
                  onClick={
                    dia.foraDoMes
                      ? undefined
                      : (evento) =>
                          aoAbrirDia(
                            dia,
                            evento.currentTarget.getBoundingClientRect(),
                          )
                  }
                >
                  {dia.foraDoMes ? (
                    <span className="agenda-dia-numero">
                      {String(dia.data.getDate()).padStart(2, '0')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="agenda-dia-numero"
                      aria-label={`Abrir ${formatarPrazoDdMm(dia.data)}, ${
                        itens.length === 1
                          ? '1 atividade'
                          : `${itens.length} atividades`
                      }`}
                    >
                      {String(dia.data.getDate()).padStart(2, '0')}
                    </button>
                  )}
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

// Cartão com todos os detalhes de uma entrega (vista Semana e dia ampliado).
function CartaoDeEntrega({ item, cor, ordem }) {
  return (
    <li
      className={`agenda-cartao agenda-chip-${cor}${
        ehConcluida(item.status) ? ' agenda-chip-concluida' : ''
      }${ehAtrasada(item) ? ' agenda-chip-atrasada' : ''}`}
      style={ordem === undefined ? undefined : { '--ordem': ordem }}
    >
      <span className="agenda-cartao-hora">{formatarHora(item.prazo)}</span>
      <strong>
        <SeloAvaliativa tarefa={item} />
        {item.titulo}
      </strong>
      {item.descricao && <p>{item.descricao}</p>}
      <span className="agenda-cartao-meta">
        {item.disciplina} · {item.tipo}
      </span>
      <span className="agenda-cartao-status">{rotuloDoStatus(item)}</span>
    </li>
  )
}

/**
 * De onde a janela do dia nasce: o deslocamento do quadradinho clicado até
 * o meio da tela e o tamanho dele perto da janela (ver agenda-dia-abre).
 */
function origemDaJanela(origem) {
  if (!origem || typeof window === 'undefined') return undefined

  const x = origem.left + origem.width / 2 - window.innerWidth / 2
  const y = origem.top + origem.height / 2 - window.innerHeight / 2

  return {
    '--de-x': `${Math.round(x)}px`,
    '--de-y': `${Math.round(y)}px`,
    '--de-escala': Math.min(0.5, Math.max(0.12, origem.width / 480)),
  }
}

/** Quanto dura a volta da janela do dia até o quadradinho (ver o CSS). */
const FECHAR_DIA_MS = 260

/** Animar só onde dá (nos testes não há matchMedia) e se a pessoa quiser. */
function podeAnimar() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia) &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// Um dia do mês ampliado, por cima da página: a janela sai do dia clicado
// e, ao fechar (no ×, no Esc ou fora), volta encolhendo até ele.
function DiaAmpliado({ dia, origem, itens, corDe, aoFechar }) {
  const [fechando, setFechando] = useState(false)
  const jaFechando = useRef(false)

  const fechar = useCallback(() => {
    if (jaFechando.current) return
    jaFechando.current = true

    if (!podeAnimar()) {
      aoFechar()
      return
    }

    setFechando(true)
    setTimeout(aoFechar, FECHAR_DIA_MS)
  }, [aoFechar])

  useEffect(() => {
    function tecla(evento) {
      if (evento.key === 'Escape') fechar()
    }

    document.addEventListener('keydown', tecla)

    return () => document.removeEventListener('keydown', tecla)
  }, [fechar])

  const titulo = `${DIAS_POR_EXTENSO[(dia.getDay() + 6) % 7]}, ${formatarPrazoDdMm(dia)}`

  return (
    <div
      className={`agenda-dia-fundo${fechando ? ' fechando' : ''}`}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) fechar()
      }}
    >
      <section
        className="agenda-dia-janela"
        style={origemDaJanela(origem)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="agenda-dia-titulo"
      >
        <header className="agenda-dia-janela-topo">
          <h3 id="agenda-dia-titulo">{titulo}</h3>
          <button
            type="button"
            className="agenda-dia-fechar"
            aria-label="Fechar"
            onClick={fechar}
            autoFocus
          >
            ×
          </button>
        </header>
        {itens.length === 0 ? (
          <p className="agenda-semana-vazio">Sem atividades</p>
        ) : (
          <ul className="agenda-semana-cartoes">
            {itens.map((item, ordem) => (
              <CartaoDeEntrega
                key={item.id}
                item={item}
                cor={corDe(item.disciplina)}
                ordem={Math.min(ordem, 8)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
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
                  <CartaoDeEntrega
                    key={item.id}
                    item={item}
                    cor={corDe(item.disciplina)}
                  />
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
          }${ehConcluida(item.status) ? ' agenda-chip-concluida' : ''}`}
        >
          <strong>{formatarPrazoDdMm(item.prazo)}</strong>
          <span className="agenda-lista-titulo">
            <SeloAvaliativa tarefa={item} />
            {item.titulo}
          </span>
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
        Arraste um cartão para outra coluna, ou use o ícone ⇄ do cartão.
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
              className={`agenda-coluna agenda-coluna-${coluna.chave.toLowerCase()}${
                alvo === coluna.chave ? ' agenda-coluna-alvo' : ''
              }`}
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
                  Arraste um cartão para cá.
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
                        className={`agenda-card materia-cor-${corDe(
                          item.disciplina,
                        )}${atrasada ? ' atrasada' : ''}`}
                      >
                        <h3>
                          <SeloAvaliativa tarefa={item} />
                          {item.titulo}
                        </h3>
                        {item.disciplina && (
                          <span className="agenda-card-materia">
                            {item.disciplina}
                          </span>
                        )}
                        {item.descricao && <p>{item.descricao}</p>}
                        <div className="agenda-card-meta">
                          {item.prazo && (
                            <span className="agenda-prazo">
                              {formatarPrazoDdMm(item.prazo)}
                              {atrasada && (
                                <span
                                  className="agenda-alerta-atraso"
                                  role="status"
                                  aria-label="Atividade atrasada"
                                >
                                  {' '}
                                  (Atrasada)
                                </span>
                              )}
                            </span>
                          )}
                          {item.tipo && (
                            <span className="agenda-badge-tipo">
                              {item.tipo}
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
  // Vindo do "Ver tudo" do Dashboard: a agenda abre com animação
  const abrindo = Boolean(useLocation().state?.abrindo)
  const [alvo, setAlvo] = useState(null)
  const [vista, setVista] = useState('mes')
  const vistasRef = useRef(null)

  // O destaque das vistas corre até o botão escolhido (posicionado direto no
  // elemento, medindo o botão; acompanha mudanças de tamanho)
  useLayoutEffect(() => {
    const grupo = vistasRef.current

    if (!grupo) return undefined

    function posicionar() {
      const ativo = grupo.querySelector('button[aria-pressed="true"]')
      const marcador = grupo.querySelector('.agenda-vistas-marcador')

      if (!ativo || !marcador) return

      marcador.style.transform = `translate(${ativo.offsetLeft}px, ${ativo.offsetTop}px)`
      marcador.style.width = `${ativo.offsetWidth}px`
      marcador.style.height = `${ativo.offsetHeight}px`
      // Só anima depois de já estar no lugar (não corre ao abrir a tela)
      requestAnimationFrame(() => grupo.classList.add('pronto'))
    }

    posicionar()

    if (typeof ResizeObserver === 'undefined') return undefined

    const observador = new ResizeObserver(posicionar)

    observador.observe(grupo)

    return () => observador.disconnect()
  }, [vista])
  const [mostrado, setMostrado] = useState(() => {
    const hoje = new Date()

    return { ano: hoje.getFullYear(), mes: hoje.getMonth() }
  })
  const [semana, setSemana] = useState(() => inicioDaSemana(new Date()))
  const [ocultas, setOcultas] = useState(() => new Set())
  const [diaAberto, setDiaAberto] = useState(null)
  // Onde estava o dia clicado, para a janela nascer dali
  const [origemDoDia, setOrigemDoDia] = useState(null)
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

  function fecharDia() {
    setDiaAberto(null)
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
          <div
            className="agenda-vistas"
            role="group"
            aria-label="Vista"
            ref={vistasRef}
          >
            <span className="agenda-vistas-marcador" aria-hidden="true" />
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
        {/* A key faz a vista nova aparecer com animação a cada troca */}
        <div key={vista} className="agenda-vista">
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
              aoAbrirDia={(dia, origem) => {
                setOrigemDoDia(origem ?? null)
                setDiaAberto(dia.data)
              }}
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
        </div>
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
    <div className={`agenda-pagina${abrindo ? ' agenda-abrindo' : ''}`}>
      <h1 className="titulo-pagina">Agenda</h1>
      <p className="subtitulo-pagina">
        Organize seus compromissos acadêmicos e nunca perca um prazo.
      </p>
      {conteudo}
      {diaAberto && vista === 'mes' && (
        <DiaAmpliado
          dia={diaAberto}
          origem={origemDoDia}
          itens={porDia.get(chaveDoDia(diaAberto)) ?? []}
          corDe={corDe}
          aoFechar={fecharDia}
        />
      )}
    </div>
  )
}
