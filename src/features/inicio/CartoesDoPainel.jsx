import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { useDados } from '../../dados/useDados'
import { EstadoVazio } from '../../shared/components/Estados'
import '../../shared/cores.css'
import BarraDeFaltas from '../faltas/BarraDeFaltas'
import { HORAS_POR_ENCONTRO, situacaoDasFaltas } from '../faltas/faltas'
import {
  diasAte,
  entregasDoMes,
  entregasPorDia,
  formatarPrazoCurto,
  proximaProva,
  textoDosDias,
} from './inicioUtils'
import SeloAvaliativa from '../../shared/components/SeloAvaliativa'
import { MEDIA_PARA_PASSAR, calcularNotas, formatarNota } from '../notas/notas'

/** A linha de notas de uma matéria no cartão: menção, média e o que falta. */
function ResumoDeNotas({ materia, tarefas }) {
  const conta = calcularNotas(materia, tarefas, {
    reprovadoPorFalta: situacaoDasFaltas(materia).nivel === 'reprovado',
  })

  if (conta.situacao === 'sem-notas' && !conta.mencao) return null

  const passar = formatarNota(MEDIA_PARA_PASSAR)
  const frase = {
    precisa: `precisa de ${formatarNota(conta.precisa)} no que falta`,
    aprovado: 'já passou',
    impossivel: `não chega mais a ${passar}`,
    reprovado: 'reprovado por falta',
    fechada: conta.media >= MEDIA_PARA_PASSAR ? 'aprovado' : 'notas fechadas',
    'sem-notas': 'nenhuma nota ainda',
  }[conta.situacao]

  return (
    <span className={`inicio-faltas-notas inicio-notas-${conta.situacao}`}>
      {conta.mencao ? (
        <span
          className={`inicio-materia-mencao notas-mencao-${conta.mencao.sigla.toLowerCase()}`}
          title={conta.mencao.nome}
        >
          {conta.mencao.sigla} · {formatarNota(conta.media)}
        </span>
      ) : (
        <span className="inicio-faltas-notas-rotulo">Notas:</span>
      )}
      <span>{frase}</span>
    </span>
  )
}

/**
 * Faltas e notas de cada matéria do semestre, com "+1 falta" direto daqui.
 * A linha de notas só aparece quando a matéria tem avaliações.
 */
export function CartaoFaltas() {
  const { materias, tarefas, registrarFalta } = useDados()

  return (
    <section
      className="inicio-caixa inicio-faltas"
      aria-labelledby="faltas-painel-titulo"
    >
      <div className="inicio-caixa-topo">
        <h2 id="faltas-painel-titulo">Faltas e notas</h2>
        <span className="inicio-dica" title="Cada +1 é um encontro de 2 h">
          +1 = 2 h de falta
        </span>
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
                <ResumoDeNotas materia={materia} tarefas={tarefas} />
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
          <strong>
            <SeloAvaliativa tarefa={prova} />
            {prova.titulo}
          </strong>
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

/**
 * Barras de entregas pendentes, uma por dia. Cada barra é dividida nas cores
 * das matérias, do tamanho de quantas entregas cada uma tem no dia.
 * `dias`: `[{ chave, rotulo, nome, hoje, fimDeSemana, total, porMateria }]`.
 */
function BarrasDeEntregas({ dias, materias, classe = '' }) {
  const maior = Math.max(1, ...dias.map((dia) => dia.total))
  const materiaDe = (id) => materias.find((materia) => materia.id === id)

  return (
    <ol className={`inicio-semana-barras ${classe}`.trim()}>
      {dias.map((dia, indice) => {
        const partes = dia.porMateria.map(({ materiaId, total }) => {
          const materia = materiaDe(materiaId)

          return {
            materiaId,
            total,
            nome: materia?.nome ?? 'Matéria',
            cor: materia?.cor ?? 'lilas',
          }
        })
        const descricao = partes
          .map((parte) => `${parte.total} de ${parte.nome}`)
          .join(', ')
        const classes = [
          dia.hoje && 'inicio-semana-hoje',
          dia.fimDeSemana && 'inicio-semana-fds',
          dia.marco && 'inicio-semana-marco',
        ].filter(Boolean)

        return (
          <li
            key={dia.chave}
            className={classes.join(' ') || undefined}
            aria-label={`${dia.nome}: ${dia.total} ${
              dia.total === 1 ? 'entrega' : 'entregas'
            }${descricao ? ` (${descricao})` : ''}`}
          >
            <span className="inicio-semana-total">{dia.total || ''}</span>
            <span
              className="inicio-semana-barra"
              style={{
                height: `${(dia.total / maior) * 100}%`,
                '--ordem': indice,
              }}
            >
              {partes.map((parte) => (
                <span
                  key={parte.materiaId}
                  className={`inicio-semana-parte materia-cor-${parte.cor}`}
                  style={{ flexGrow: parte.total }}
                  title={`${parte.nome}: ${parte.total}`}
                />
              ))}
            </span>
            <span className="inicio-semana-dia">{dia.rotulo}</span>
          </li>
        )
      })}
    </ol>
  )
}

const NOME_DO_MES = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
})

/**
 * De onde a janela do mês nasce: o deslocamento do cartão clicado até o meio
 * da área da página (sem o menu) e o tamanho dele perto da janela (ver
 * inicio-mes-abre).
 */
function origemDaJanela(origem) {
  if (!origem) return undefined

  const pagina = document
    .querySelector('.layout-coluna')
    ?.getBoundingClientRect()
  const meio = pagina ? pagina.left + pagina.width / 2 : window.innerWidth / 2
  const x = origem.left + origem.width / 2 - meio
  const y = origem.top + origem.height / 2 - window.innerHeight / 2

  return {
    '--de-x': `${Math.round(x)}px`,
    '--de-y': `${Math.round(y)}px`,
    '--de-escala': Math.min(0.6, Math.max(0.15, origem.width / 960)),
  }
}

/**
 * O cartão ampliado, por cima da página (fora do conteúdo, para o menu não
 * cobrir a janela, mas sem cobrir o menu): as entregas do mês inteiro, com setas para os outros
 * meses. Abre saindo do cartão clicado; fecha no ×, no Esc ou clicando fora.
 */
/** Quanto dura a volta da janela do mês até o cartão (ver o CSS). */
const FECHAR_MES_MS = 260

/** Animar só onde dá (nos testes não há matchMedia) e se a pessoa quiser. */
function podeAnimar() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia) &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function EntregasDoMes({ tarefas, materias, agora, origem, aoFechar }) {
  const [mes, setMes] = useState(
    () => new Date(agora.getFullYear(), agora.getMonth(), 1),
  )
  // Fechando: a janela volta encolhendo até o cartão antes de sumir
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
    setTimeout(aoFechar, FECHAR_MES_MS)
  }, [aoFechar])

  useEffect(() => {
    function tecla(evento) {
      if (evento.key === 'Escape') fechar()
    }

    document.addEventListener('keydown', tecla)

    return () => document.removeEventListener('keydown', tecla)
  }, [fechar])

  const dias = entregasDoMes(
    tarefas,
    mes.getFullYear(),
    mes.getMonth(),
    agora,
  ).map((dia) => ({
    ...dia,
    chave: dia.dia,
    rotulo: dia.dia,
    nome: `Dia ${dia.dia}`,
    // No celular, só estes dias mostram o número embaixo da barra.
    marco: dia.dia === 1 || dia.dia % 5 === 0 || dia.hoje,
  }))
  const total = dias.reduce((soma, dia) => soma + dia.total, 0)
  const doMes = new Map()

  for (const dia of dias) {
    for (const { materiaId, total: quantas } of dia.porMateria) {
      doMes.set(materiaId, (doMes.get(materiaId) ?? 0) + quantas)
    }
  }

  const titulo = NOME_DO_MES.format(mes)
  const andar = (passo) =>
    setMes(new Date(mes.getFullYear(), mes.getMonth() + passo, 1))

  return createPortal(
    <div
      className={`inicio-mes-fundo${fechando ? ' fechando' : ''}`}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) fechar()
      }}
    >
      <section
        className="inicio-mes-janela"
        style={origemDaJanela(origem)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inicio-mes-titulo"
      >
        <header className="inicio-mes-topo">
          <button
            type="button"
            className="inicio-mes-seta"
            aria-label="Mês anterior"
            onClick={() => andar(-1)}
          >
            ‹
          </button>
          <h2 id="inicio-mes-titulo">
            Entregas de {titulo}
            <span>
              {total === 0
                ? 'Nada pendente'
                : `${total} ${total === 1 ? 'pendente' : 'pendentes'}`}
            </span>
          </h2>
          <button
            type="button"
            className="inicio-mes-seta"
            aria-label="Próximo mês"
            onClick={() => andar(1)}
          >
            ›
          </button>
          <button
            type="button"
            className="inicio-mes-fechar"
            aria-label="Fechar"
            onClick={fechar}
            autoFocus
          >
            ×
          </button>
        </header>

        <BarrasDeEntregas
          dias={dias}
          materias={materias}
          classe="inicio-mes-barras"
        />

        {doMes.size > 0 && (
          <ul className="inicio-mes-legenda" aria-label="Por matéria">
            {[...doMes].map(([materiaId, quantas]) => {
              const materia = materias.find((item) => item.id === materiaId)

              return (
                <li
                  key={materiaId}
                  className={`materia-cor-${materia?.cor ?? 'lilas'}`}
                >
                  {materia?.nome ?? 'Matéria'} <strong>{quantas}</strong>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>,
    document.body,
  )
}

/**
 * Entregas da semana, com as cores das matérias. Um clique amplia o cartão
 * para o mês inteiro, sem sair do Dashboard.
 */
export function CartaoSemana({ agora = new Date() }) {
  const { materias, tarefas } = useDados()
  // Aberto: onde estava o cartão, para a janela sair dele (fechado: null)
  const [ampliado, setAmpliado] = useState(null)
  const dias = entregasPorDia(tarefas, agora).map((dia) => ({
    ...dia,
    chave: dia.dia,
    rotulo: dia.dia,
    nome: dia.dia,
  }))

  return (
    <section
      className="inicio-caixa inicio-semana-cartao"
      aria-labelledby="semana-painel-titulo"
      onClick={(evento) => {
        if (!evento.target.closest('.inicio-mes-fundo')) {
          setAmpliado(evento.currentTarget.getBoundingClientRect())
        }
      }}
    >
      <div className="inicio-caixa-topo">
        <h2 id="semana-painel-titulo">Entregas da semana</h2>
        <button
          type="button"
          className="inicio-ampliar"
          aria-label="Ver as entregas do mês"
          title="Ver o mês"
        >
          ⤢
        </button>
      </div>
      <BarrasDeEntregas dias={dias} materias={materias} />
      {ampliado && (
        <EntregasDoMes
          tarefas={tarefas}
          materias={materias}
          agora={agora}
          origem={ampliado}
          aoFechar={() => setAmpliado(null)}
        />
      )}
    </section>
  )
}
