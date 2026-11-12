import { useState } from 'react'
import { useDados } from '../../dados/useDados'
import BarraProgresso from '../../shared/components/BarraProgresso'
import '../../shared/cores.css'
import '../../shared/secao.css'
import {
  CURSO,
  DISCIPLINAS,
  FLUXOGRAMA,
  somarCreditos,
} from './dadosFluxograma'
import { IMPORTAR_HISTORICO_SIGAA } from '../../config/curso'
import { lerHistorico } from './historico'
import './Fluxograma.css'

function nomeCompleto(disciplina, semestre, indice) {
  return disciplina.codigo
    ? disciplina.nome
    : `Optativa ${indice + 1} do ${semestre}º semestre`
}

function Disciplina({
  disciplina,
  nome,
  cursada,
  cursando,
  aoAlternar,
  aoCursar,
}) {
  return (
    <li
      className={`fluxo-disciplina materia-cor-${disciplina.cor}${
        cursada ? ' fluxo-cursada' : ''
      }`}
    >
      <span className="fluxo-cabeca">
        <span className="fluxo-codigo">{disciplina.codigo || 'Optativa'}</span>
        <span className="fluxo-creditos">{disciplina.creditos} cr</span>
      </span>
      <span className="fluxo-nome">{disciplina.codigo && disciplina.nome}</span>
      {cursando && <span className="fluxo-etiqueta">Cursando</span>}
      <div className="fluxo-rodape">
        <button
          type="button"
          className="fluxo-marcar"
          aria-pressed={cursada}
          aria-label={`${nome}: cursada`}
          onClick={aoAlternar}
        >
          {cursada ? '✓ Cursada' : 'Não cursada'}
        </button>
        <button
          type="button"
          className="fluxo-cursar"
          aria-label={`Cursar ${nome} neste semestre`}
          title="Cursar neste semestre"
          onClick={aoCursar}
        >
          +
        </button>
      </div>
    </li>
  )
}

/** Colar o texto do histórico do SIGAA e marcar as aprovadas de uma vez. */
function ImportarHistorico({ aoFechar }) {
  const { cursadas, marcarCursadas } = useDados()
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState(null)

  function importar(evento) {
    evento.preventDefault()

    const lido = lerHistorico(texto)
    const novas = lido.cursadas.filter((id) => !cursadas.includes(id))

    marcarCursadas(lido.cursadas)
    setResultado({ ...lido, novas: novas.length })
    setTexto('')
  }

  return (
    <form className="fluxo-importar" onSubmit={importar}>
      <label htmlFor="fluxo-historico">Texto do histórico</label>
      <p className="fluxo-ajuda">
        No SIGAA, emita o histórico (Ensino → Emitir Histórico), abra o PDF,
        selecione tudo (Cmd+A), copie (Cmd+C) e cole aqui. Só os códigos e as
        situações são lidos, e o texto não fica guardado.
      </p>
      <textarea
        id="fluxo-historico"
        rows={5}
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
      />
      <div className="fluxo-importar-acoes">
        <button type="submit" className="secao-botao" disabled={!texto.trim()}>
          Marcar cursadas
        </button>
        <button
          type="button"
          className="secao-botao fluxo-botao-claro"
          onClick={aoFechar}
        >
          Fechar
        </button>
      </div>
      {resultado && (
        <p role="status" className="fluxo-importar-resultado">
          {resultado.cursadas.length === 0
            ? 'Nenhuma disciplina aprovada do fluxograma foi encontrada nesse texto.'
            : `${resultado.cursadas.length} disciplinas do fluxograma aprovadas no histórico (${resultado.novas} novas marcadas).`}
          {resultado.fora.length > 0 &&
            ` Fora do fluxograma (optativas e eletivas): ${resultado.fora.join(', ')}.`}
        </p>
      )}
    </form>
  )
}

/**
 * O fluxograma do curso, um semestre por coluna. Cada disciplina pode ser
 * marcada como cursada; o "+" preenche o cadastro de matéria com ela.
 */
export default function Fluxograma({ aoCursar }) {
  const { materias, cursadas, alternarCursada } = useDados()
  const [importando, setImportando] = useState(false)
  const feitas = new Set(cursadas)
  const nomesNoSemestre = new Set(
    materias.map((materia) => materia.nome.trim().toLowerCase()),
  )
  const total = somarCreditos(DISCIPLINAS)
  const creditosFeitos = somarCreditos(
    DISCIPLINAS.filter((item) => feitas.has(item.id)),
  )

  return (
    <section className="secao-caixa fluxo" aria-labelledby="fluxo-titulo">
      <header className="fluxo-topo">
        <div>
          <h2 id="fluxo-titulo">Fluxograma</h2>
          <p>{CURSO}</p>
          {IMPORTAR_HISTORICO_SIGAA && !importando && (
            <button
              type="button"
              className="secao-botao fluxo-abrir-importar"
              onClick={() => setImportando(true)}
            >
              Importar do histórico
            </button>
          )}
        </div>
        <div className="fluxo-progresso">
          <span>
            <strong>{creditosFeitos}</strong> de {total} créditos cursados
          </span>
          <BarraProgresso
            concluidas={creditosFeitos}
            total={total}
            rotulo="Créditos cursados no curso"
          />
        </div>
      </header>

      {importando && (
        <ImportarHistorico aoFechar={() => setImportando(false)} />
      )}

      <div className="fluxo-rolagem">
        <ol className="fluxo-grade">
          {FLUXOGRAMA.map((disciplinas, posicao) => {
            const semestre = posicao + 1
            const doSemestre = somarCreditos(disciplinas)
            const feitosNoSemestre = somarCreditos(
              disciplinas.filter((item) => feitas.has(item.id)),
            )
            const optativas = disciplinas.filter((item) => !item.codigo)

            return (
              <li key={semestre} className="fluxo-coluna">
                <h3>
                  {semestre}º semestre
                  <span>
                    {feitosNoSemestre}/{doSemestre} cr
                  </span>
                </h3>
                <ul aria-label={`${semestre}º semestre`}>
                  {disciplinas.map((disciplina) => {
                    const nome = nomeCompleto(
                      disciplina,
                      semestre,
                      optativas.indexOf(disciplina),
                    )

                    return (
                      <Disciplina
                        key={disciplina.id}
                        disciplina={disciplina}
                        nome={nome}
                        cursada={feitas.has(disciplina.id)}
                        cursando={
                          Boolean(disciplina.codigo) &&
                          nomesNoSemestre.has(disciplina.nome.toLowerCase())
                        }
                        aoAlternar={() => alternarCursada(disciplina.id)}
                        aoCursar={() => aoCursar(disciplina)}
                      />
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
