import { useState } from 'react'
import { useDados } from '../../dados/useDados'
import BarraDividida from '../../shared/components/BarraDividida'
import BarraProgresso from '../../shared/components/BarraProgresso'
import '../../shared/cores.css'
import '../../shared/secao.css'
import {
  CURSO,
  DISCIPLINAS,
  FLUXOGRAMA,
  somarCreditos,
} from './dadosFluxograma'
import { lerHistorico, lerHistoricoGeral, nomeBonito } from './historico'
import ProgressoNoCurso from './ProgressoNoCurso'
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
  const { cursadas, aplicarHistorico, guardarProgressoCurso } = useDados()
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState(null)

  function importar(evento) {
    evento.preventDefault()

    const lido = lerHistorico(texto)
    const geral = lerHistoricoGeral(texto)
    const novas = lido.cursadas.filter((id) => !cursadas.includes(id))

    // Engenharia de Software tem o fluxograma completo; qualquer outro curso
    // fica com o progresso lido do histórico.
    if (lido.doCurso) aplicarHistorico(lido.cursadas)
    if (geral) guardarProgressoCurso(geral)
    setResultado({ ...lido, geral, novas: novas.length })
    setTexto('')
  }

  return (
    <form className="fluxo-importar" onSubmit={importar}>
      <label htmlFor="fluxo-historico">Texto do histórico</label>
      <p className="fluxo-ajuda">
        No SIGAA, emita o histórico (Ensino → Emitir Histórico), abra o PDF,
        selecione tudo (Cmd+A), copie (Cmd+C) e cole aqui. Só o curso, as
        disciplinas e as horas são guardados: nada de nome, matrícula, CPF ou
        notas.
      </p>
      <textarea
        id="fluxo-historico"
        rows={5}
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
      />
      <div className="fluxo-importar-acoes">
        <button type="submit" className="secao-botao" disabled={!texto.trim()}>
          Importar histórico
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
          {!resultado.doCurso
            ? resultado.geral
              ? `Histórico de ${nomeBonito(resultado.geral.curso || 'seu curso')} importado: ${resultado.geral.pendentes.length} ${resultado.geral.pendentes.length === 1 ? 'obrigatória falta' : 'obrigatórias faltam'}.`
              : 'Esse texto não parece ser um histórico do SIGAA. Copie o PDF inteiro (Cmd+A, Cmd+C) e cole de novo.'
            : resultado.cursadas.length === 0
              ? 'Histórico reconhecido, mas nenhuma disciplina do fluxograma aparece como aprovada.'
              : resultado.cursadas.length === 1
                ? `1 disciplina do fluxograma aprovada no histórico (${resultado.novas === 1 ? '1 nova marcada' : 'já estava marcada'}).`
                : `${resultado.cursadas.length} disciplinas do fluxograma aprovadas no histórico (${resultado.novas} novas marcadas).`}
          {resultado.doCurso &&
            resultado.fora.length > 0 &&
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
  const {
    materias,
    cursadas,
    fluxogramaAtivo,
    progressoCurso,
    alternarCursada,
    esconderFluxograma,
  } = useDados()
  const [importando, setImportando] = useState(false)

  // Qualquer outro curso: o progresso lido do histórico.
  if (!fluxogramaAtivo && progressoCurso) {
    return (
      <ProgressoNoCurso
        progresso={progressoCurso}
        importar={
          importando && (
            <ImportarHistorico aoFechar={() => setImportando(false)} />
          )
        }
        aoAbrirImportar={() => setImportando(true)}
        aoCursar={aoCursar}
      />
    )
  }

  // Escondido até importar um histórico do curso: só o convite para importar.
  if (!fluxogramaAtivo) {
    return (
      <section className="secao-caixa fluxo" aria-labelledby="fluxo-titulo">
        <header>
          <h2 id="fluxo-titulo">Fluxograma</h2>
          <p>
            Importe o seu histórico do SIGAA (UnB) para ver quanto do curso você
            já cumpriu e as obrigatórias que faltam. Funciona com qualquer
            curso; para {CURSO}, mostra o fluxograma completo por semestre.
          </p>
          {!importando && (
            <button
              type="button"
              className="secao-botao fluxo-abrir-importar"
              onClick={() => setImportando(true)}
            >
              Importar do histórico
            </button>
          )}
        </header>
        {importando && (
          <ImportarHistorico aoFechar={() => setImportando(false)} />
        )}
      </section>
    )
  }

  // O número oficial do SIGAA (horas integralizadas / exigidas), que conta
  // também optativas fora do fluxograma, equivalências e complementares.
  const integralizacao = progressoCurso?.exigido?.total
    ? {
        cumpridas: progressoCurso.integralizado?.total ?? 0,
        exigidas: progressoCurso.exigido.total,
      }
    : null
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
          <div className="fluxo-topo-acoes">
            {!importando && (
              <button
                type="button"
                className="secao-botao fluxo-abrir-importar"
                onClick={() => setImportando(true)}
              >
                Importar do histórico
              </button>
            )}
            <button
              type="button"
              className="secao-botao fluxo-botao-claro fluxo-abrir-importar"
              onClick={esconderFluxograma}
            >
              Esconder fluxograma
            </button>
          </div>
        </div>
        <div className="fluxo-progresso">
          {integralizacao && (
            <>
              <span>
                Integralização no SIGAA:{' '}
                <strong>
                  {integralizacao.cumpridas} de {integralizacao.exigidas} h
                </strong>
              </span>
              <BarraProgresso
                concluidas={integralizacao.cumpridas}
                total={integralizacao.exigidas}
                rotulo="Integralização do curso no SIGAA"
              />
              <BarraDividida
                exigido={progressoCurso.exigido}
                integralizado={progressoCurso.integralizado}
              />
            </>
          )}
          <span className={integralizacao ? 'fluxo-progresso-menor' : ''}>
            <strong>{creditosFeitos}</strong> de {total} créditos marcados no
            fluxograma
          </span>
          {!integralizacao && (
            <BarraProgresso
              concluidas={creditosFeitos}
              total={total}
              rotulo="Créditos cursados no curso"
            />
          )}
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
