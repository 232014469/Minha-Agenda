import { useState } from 'react'
import { TIPOS } from '../../dados/armazenamento'
import { useDados } from '../../dados/useDados'
import { ehAvaliativa } from '../../shared/avaliativa'
import Icone from '../../shared/layout/Icone'
import { situacaoDasFaltas } from '../faltas/faltas'
import {
  MEDIA_PARA_PASSAR,
  MODOS,
  calcularNotas,
  formatarNota,
  lerNota,
} from './notas'
import './NotasDaMateria.css'

/** Campo de número que só grava ao sair dele (ou no Enter). */
function CampoDeNota({ valor, rotulo, vazio = '–', aoMudar }) {
  const [texto, setTexto] = useState(null)
  const mostrado = texto ?? (valor === null ? '' : formatarNota(valor))

  function gravar() {
    if (texto === null) return
    aoMudar(lerNota(texto))
    setTexto(null)
  }

  return (
    <input
      className="notas-campo"
      type="text"
      inputMode="decimal"
      value={mostrado}
      placeholder={vazio}
      aria-label={rotulo}
      onChange={(evento) => setTexto(evento.target.value)}
      onBlur={gravar}
      onKeyDown={(evento) => {
        if (evento.key === 'Enter') evento.currentTarget.blur()
      }}
    />
  )
}

/** A frase do que falta, conforme a situação. */
function textoDaSituacao(conta) {
  const passar = formatarNota(MEDIA_PARA_PASSAR)

  switch (conta.situacao) {
    case 'sem-notas':
      return 'Adicione as avaliações aqui embaixo e lance as notas quando saírem.'
    case 'precisa':
      return `Para passar (${passar}), precisa de ${formatarNota(conta.precisa)} no que falta.`
    case 'aprovado':
      return 'Já passou, mesmo tirando zero no que falta. 🎉'
    case 'impossivel':
      return `Só com o que falta não dá mais para chegar a ${passar}. Vale conversar com o professor.`
    case 'reprovado':
      return 'Reprovado por falta: a menção fica SR, qualquer que seja a nota.'
    default:
      return conta.media >= MEDIA_PARA_PASSAR
        ? 'Notas fechadas: aprovado!'
        : 'Notas fechadas.'
  }
}

/**
 * Notas da matéria (na página dela): média, menção da UnB, quanto falta
 * para passar e cada avaliação, com a nota e o peso editáveis ali mesmo.
 * As avaliações nascem aqui: com data viram atividades avaliativas na
 * Agenda (com destaque); sem data ficam só aqui. Dá para marcar uma entrega
 * que já existe como avaliativa e escolher como o professor calcula.
 */
export default function NotasDaMateria({ materia }) {
  const { tarefas, editarTarefa, adicionarTarefa, ajustarNotasDaMateria } =
    useDados()
  // Nova avaliação: com data entra na Agenda; sem data fica só aqui
  const [nova, setNova] = useState({ nome: '', tipo: 'Prova', data: '' })
  const reprovadoPorFalta = situacaoDasFaltas(materia).nivel === 'reprovado'
  const conta = calcularNotas(materia, tarefas, { reprovadoPorFalta })
  const { regra } = conta
  const avulsas = materia.avaliacoes ?? []
  const pontos = regra.modo === 'pontos'

  function mudarRegra(mudancas) {
    ajustarNotasDaMateria(materia.id, {
      regraDeNotas: { ...(materia.regraDeNotas ?? {}), ...mudancas },
    })
  }

  function mudarItem(item, campo, valor) {
    if (item.tarefaId !== undefined) {
      editarTarefa(item.tarefaId, { [campo]: valor })
      return
    }

    ajustarNotasDaMateria(materia.id, {
      avaliacoes: avulsas.map((avulsa) =>
        avulsa.id === item.avulsaId ? { ...avulsa, [campo]: valor } : avulsa,
      ),
    })
  }

  function escolherSubstitutiva(id) {
    for (const item of conta.itens) {
      const marcar = item.id === id

      if (item.substitutiva !== marcar) mudarItem(item, 'substitutiva', marcar)
    }
  }

  function adicionarAvaliacao(evento) {
    evento.preventDefault()
    const nome = nova.nome.trim()

    if (!nome) return

    if (nova.data) {
      adicionarTarefa({
        materiaId: materia.id,
        titulo: nome,
        tipo: nova.tipo,
        prazo: `${nova.data}T23:59:00`,
        avaliativa: true,
      })
    } else {
      ajustarNotasDaMateria(materia.id, {
        avaliacoes: [...avulsas, { id: Date.now(), nome, nota: null, peso: 1 }],
      })
    }

    setNova({ nome: '', tipo: nova.tipo, data: '' })
  }

  // Tirar das notas: a avulsa some; a atividade volta a ser uma entrega
  // normal (continua na Agenda)
  function tirar(item) {
    if (item.tarefaId !== undefined) {
      editarTarefa(item.tarefaId, { avaliativa: false, nota: null })
      return
    }

    ajustarNotasDaMateria(materia.id, {
      avaliacoes: avulsas.filter((avulsa) => avulsa.id !== item.avulsaId),
    })
  }

  // Entregas da matéria que ainda não valem nota (para marcar uma delas)
  const naoAvaliativas = tarefas.filter(
    (tarefa) => tarefa.materiaId === materia.id && !ehAvaliativa(tarefa),
  )

  return (
    <section className="materia-caixa notas" aria-labelledby="notas-titulo">
      <div className="materia-caixa-topo">
        <h2 id="notas-titulo">Notas</h2>
        {conta.mencao && (
          <span
            className={`notas-mencao notas-mencao-${conta.mencao.sigla.toLowerCase()}`}
            title={conta.mencao.nome}
          >
            {conta.mencao.sigla}
          </span>
        )}
      </div>

      {conta.media !== null && (
        <p className="notas-media">
          <strong>{formatarNota(conta.media)}</strong>
          <span>
            média até agora
            {conta.falta > 0 && (
              <>
                {' · '}
                {Math.round(conta.falta * 100)}% ainda não saiu
              </>
            )}
          </span>
        </p>
      )}
      <p className={`notas-situacao notas-situacao-${conta.situacao}`}>
        {textoDaSituacao(conta)}
      </p>

      {conta.itens.length > 0 && (
        <ul className="notas-lista">
          {conta.itens.map((item) => (
            <li
              key={item.id}
              className={
                item.descartada || (!item.conta && !item.substitutiva)
                  ? 'notas-fora'
                  : undefined
              }
            >
              <span className="notas-nome" title={item.nome}>
                {item.nome}
                {item.substitutiva && <small> · substitutiva</small>}
                {item.substituida && <small> · trocada pela sub</small>}
                {item.descartada && <small> · descartada</small>}
              </span>
              <CampoDeNota
                valor={
                  item.tarefaId !== undefined || item.avulsaId !== undefined
                    ? (tarefas.find((t) => t.id === item.tarefaId)?.nota ??
                      avulsas.find((a) => a.id === item.avulsaId)?.nota ??
                      null)
                    : null
                }
                rotulo={`Nota de ${item.nome}`}
                aoMudar={(valor) => mudarItem(item, 'nota', valor)}
              />
              {pontos ? (
                <span className="notas-de">
                  /
                  <CampoDeNota
                    valor={item.maxima}
                    rotulo={`Quanto vale ${item.nome}`}
                    aoMudar={(valor) =>
                      mudarItem(item, 'notaMaxima', valor || 10)
                    }
                  />
                </span>
              ) : regra.modo === 'ponderada' ? (
                <span className="notas-de" title="Peso na média">
                  ×
                  <CampoDeNota
                    valor={item.peso}
                    rotulo={`Peso de ${item.nome}`}
                    aoMudar={(valor) => mudarItem(item, 'peso', valor ?? 1)}
                  />
                </span>
              ) : null}
              <button
                type="button"
                className="notas-remover"
                aria-label={`Tirar ${item.nome} das notas`}
                title={
                  item.tarefaId !== undefined
                    ? 'Tirar das notas (continua na Agenda)'
                    : 'Tirar'
                }
                onClick={() => tirar(item)}
              >
                <Icone nome="lixo" tamanho={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="notas-nova"
        onSubmit={adicionarAvaliacao}
        aria-label="Nova avaliação"
      >
        <span className="notas-nova-titulo">Nova avaliação</span>
        <input
          type="text"
          value={nova.nome}
          maxLength={80}
          placeholder="Ex.: P1, Projeto final, Participação"
          aria-label="Nome da avaliação"
          onChange={(evento) => setNova({ ...nova, nome: evento.target.value })}
        />
        <div className="notas-nova-linha">
          <select
            value={nova.tipo}
            aria-label="Tipo da avaliação"
            onChange={(evento) =>
              setNova({ ...nova, tipo: evento.target.value })
            }
          >
            {TIPOS.map((tipo) => (
              <option key={tipo}>{tipo}</option>
            ))}
          </select>
          <input
            type="date"
            value={nova.data}
            aria-label="Data da avaliação"
            onChange={(evento) =>
              setNova({ ...nova, data: evento.target.value })
            }
          />
          <button type="submit" disabled={!nova.nome.trim()}>
            Adicionar
          </button>
        </div>
        <span className="notas-dica">
          Com data, ela entra na Agenda com a ★. Sem data (ex.: participação),
          fica só aqui.
        </span>
      </form>

      {naoAvaliativas.length > 0 && (
        <label className="notas-opcao notas-marcar">
          <span>Marcar entrega como avaliativa</span>
          <select
            value=""
            onChange={(evento) => {
              if (evento.target.value) {
                editarTarefa(Number(evento.target.value), { avaliativa: true })
              }
            }}
          >
            <option value="">Escolher…</option>
            {naoAvaliativas.map((tarefa) => (
              <option key={tarefa.id} value={tarefa.id}>
                {tarefa.titulo}
              </option>
            ))}
          </select>
        </label>
      )}

      <details className="notas-regra">
        <summary>Como o professor calcula</summary>
        <div className="notas-modos" role="radiogroup" aria-label="Cálculo">
          {MODOS.map((modo) => (
            <label key={modo.id}>
              <input
                type="radio"
                name={`modo-${materia.id}`}
                checked={regra.modo === modo.id}
                onChange={() => mudarRegra({ modo: modo.id })}
              />
              {modo.nome}
            </label>
          ))}
        </div>
        <p className="notas-dica">
          {pontos
            ? 'Cada avaliação vale os pontos ao lado da barra (ex.: 30 + 30 + 40).'
            : regra.modo === 'ponderada'
              ? 'O número depois do × é o peso de cada avaliação.'
              : 'Todas as avaliações valem o mesmo.'}{' '}
          Peso 0 tira da conta.
        </p>
        <label className="notas-opcao">
          <span>Substitutiva</span>
          <select
            value={conta.itens.find((item) => item.substitutiva)?.id ?? ''}
            onChange={(evento) => escolherSubstitutiva(evento.target.value)}
          >
            <option value="">Não tem</option>
            {conta.itens.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="notas-opcao">
          <input
            type="checkbox"
            checked={regra.descartarPior}
            onChange={(evento) =>
              mudarRegra({ descartarPior: evento.target.checked })
            }
          />
          Descartar a pior nota
        </label>
        <label className="notas-opcao">
          <span>Ponto extra na média</span>
          <CampoDeNota
            valor={regra.extra || null}
            rotulo="Ponto extra na média"
            vazio="0"
            aoMudar={(valor) => mudarRegra({ extra: valor ?? 0 })}
          />
        </label>
      </details>
    </section>
  )
}
