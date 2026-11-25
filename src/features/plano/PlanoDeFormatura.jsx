import { useEffect, useState } from 'react'
import { semestreDaData } from '../../dados/armazenamento'
import { useDados } from '../../dados/useDados'
import { CARGAS } from '../faltas/faltas'
import {
  CREDITOS_PUXADO,
  EVENTO_EXTRAS_RECEBIDOS,
  adicionarSemestre,
  encaixar,
  guardarPlano,
  lerPlano,
  moverItem,
  normalizar,
  ordemDoSemestre,
  paraEncaixar,
  proximoSemestre,
  removerSemestre,
  resumirPlano,
  tirarItem,
} from './plano'
import '../../shared/cores.css'
import './PlanoDeFormatura.css'

const TIRAR = '__tirar'

const creditos = (horas) => Math.round(horas / 15)

/** As mesmas cores do Progresso no curso: obrigatória azul, optativa amarela. */
const corDoTipo = (tipo) =>
  tipo === 'optativa' ? 'materia-cor-amarelo' : 'materia-cor-azul'

/**
 * Plano de formatura: um semestre ao lado do outro, do atual até o último.
 * Em cima, o que ainda falta encaixar (obrigatórias pendentes do histórico
 * ou do fluxograma e vagas de optativa). Cada disciplina vai para um
 * semestre arrastando (no computador) ou pelo menu dela, e pode mudar de
 * semestre ou sair do plano a qualquer hora: replanejar é só mover. É um
 * plano só para todos os semestres: mostra as matérias cadastradas em cada
 * um (não só no escolhido no topo), e as planejadas de agora em diante podem
 * ser cadastradas direto, já no semestre delas. O plano fica salvo sozinho e
 * vai para os outros aparelhos na sincronização.
 */
export default function PlanoDeFormatura({ aoCadastrar }) {
  const { todos, progressoCurso, fluxogramaAtivo, cursadas } = useDados()
  // Um plano só para todos os semestres: o "agora" é o semestre de hoje (e
  // não o escolhido no topo), e entram as matérias cadastradas em qualquer
  // semestre, cada uma no seu
  const semestre = semestreDaData()
  const todasAsMaterias = todos.materias.filter((materia) =>
    /^\d{4}\.[12]$/.test(materia.periodo ?? ''),
  )
  const materiasDe = (periodo) =>
    todasAsMaterias.filter((materia) => materia.periodo === periodo)
  // As de agora e as já cadastradas para depois (as de antes já estão no
  // histórico, aprovadas ou não)
  const materias = todasAsMaterias.filter(
    (materia) => ordemDoSemestre(materia.periodo) >= ordemDoSemestre(semestre),
  )
  const [plano, setPlano] = useState(lerPlano)
  const [alvo, setAlvo] = useState(null)

  useEffect(() => guardarPlano(plano), [plano])

  // Mudaram o plano em outro aparelho: mostra o de lá
  useEffect(() => {
    function reler(evento) {
      if (evento.detail?.includes('plano')) setPlano(lerPlano())
    }

    window.addEventListener(EVENTO_EXTRAS_RECEBIDOS, reler)

    return () => window.removeEventListener(EVENTO_EXTRAS_RECEBIDOS, reler)
  }, [])

  // Uma disciplina do plano já cadastrada como matéria no mesmo semestre
  // aparece só como matéria (e não conta duas vezes)
  const cadastradas = new Set(
    todasAsMaterias.map(
      (materia) => `${materia.periodo}|${normalizar(materia.nome)}`,
    ),
  )
  const visivel = {
    ...plano,
    itens: plano.itens.filter(
      (item) => !cadastradas.has(`${item.semestre}|${normalizar(item.nome)}`),
    ),
  }

  const faltando = paraEncaixar({
    plano: visivel,
    materias,
    progresso: progressoCurso,
    fluxogramaAtivo,
    cursadas,
  })
  const resumo = resumirPlano({
    plano: visivel,
    materias: todasAsMaterias,
    semestre,
    faltando,
  })
  const semestres = [
    ...new Set([
      semestre,
      ...plano.semestres,
      ...todasAsMaterias.map((materia) => materia.periodo),
    ]),
  ].sort((a, b) => ordemDoSemestre(a) - ordemDoSemestre(b))
  const ultimo = semestres.at(-1)
  const proximo = proximoSemestre(plano, ultimo)
  // Só dá para cravar a formatura sabendo o que falta no curso
  const sabeOQueFalta = Boolean(progressoCurso?.exigido || fluxogramaAtivo)

  function levarPara(semestreAlvo, oQue) {
    if (oQue.id) setPlano((atual) => moverItem(atual, oQue.id, semestreAlvo))
    else setPlano((atual) => encaixar(atual, oQue, semestreAlvo))
  }

  function soltar(evento, semestreAlvo) {
    evento.preventDefault()
    setAlvo(null)

    try {
      const oQue = JSON.parse(evento.dataTransfer.getData('text/plain'))

      if (oQue?.nome || oQue?.id) levarPara(semestreAlvo, oQue)
    } catch {
      // Soltaram outra coisa aqui: ignora
    }
  }

  return (
    <section className="secao-caixa plano" aria-labelledby="plano-titulo">
      <header className="plano-topo">
        <div>
          <h2 id="plano-titulo">Plano de formatura</h2>
          <p>
            Monte o caminho até a formatura, semestre por semestre. Arraste as
            disciplinas (ou use o menu de cada uma) e mude de ideia quando
            quiser: é só mover de novo.
          </p>
        </div>
        <p className="plano-resumo" aria-live="polite">
          {resumo.formatura && sabeOQueFalta ? (
            <>
              <span>
                <span aria-hidden="true">🎓</span> Formatura em{' '}
                <strong>{resumo.formatura}</strong>
              </span>
              <span className="plano-resumo-sub">
                {resumo.semestresAte}{' '}
                {resumo.semestresAte === 1 ? 'semestre' : 'semestres'}, contando
                o atual
              </span>
            </>
          ) : faltando.length ? (
            <>
              <span>
                Faltam encaixar <strong>{resumo.horasSemSemestre} h</strong>
              </span>
              <span className="plano-resumo-sub">
                {faltando.length}{' '}
                {faltando.length === 1 ? 'disciplina' : 'disciplinas'} sem
                semestre
              </span>
            </>
          ) : resumo.formatura ? (
            <>
              <span>
                Último semestre do plano: <strong>{resumo.formatura}</strong>
              </span>
              <span className="plano-resumo-sub">
                Atualize pelo histórico (ou marque o fluxograma) para saber o
                que falta
              </span>
            </>
          ) : (
            <span>Adicione semestres e disciplinas para ver a formatura.</span>
          )}
        </p>
      </header>

      {faltando.length > 0 && (
        <div className="plano-faltando">
          <h3 className="plano-subtitulo">
            Para encaixar <span>{faltando.length}</span>
          </h3>
          <ul aria-label="Disciplinas para encaixar">
            {faltando.map((disciplina) => (
              <li
                key={disciplina.chave}
                className={`plano-chip ${corDoTipo(disciplina.tipo)}`}
                draggable
                onDragStart={(evento) => {
                  evento.dataTransfer.setData(
                    'text/plain',
                    JSON.stringify(disciplina),
                  )
                  evento.dataTransfer.effectAllowed = 'move'
                }}
              >
                <span className="plano-chip-nome">{disciplina.nome}</span>
                <span className="plano-horas">{disciplina.horas} h</span>
                <select
                  className="plano-menu"
                  aria-label={`Encaixar ${disciplina.nome} em`}
                  title="Encaixar em um semestre"
                  value=""
                  onChange={(evento) =>
                    evento.target.value &&
                    levarPara(evento.target.value, disciplina)
                  }
                >
                  <option value="">Encaixar…</option>
                  {semestres.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {opcao}
                    </option>
                  ))}
                  {proximo && <option value={proximo}>{proximo} (novo)</option>}
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="plano-semestres">
        {semestres.map((periodo) => {
          const atual = periodo === semestre
          const passado = ordemDoSemestre(periodo) < ordemDoSemestre(semestre)
          const itens = visivel.itens.filter(
            (item) => item.semestre === periodo,
          )
          const doSemestre = materiasDe(periodo)
          const horas = resumo.horasPorSemestre[periodo] ?? 0
          const puxado = creditos(horas) > CREDITOS_PUXADO

          return (
            <article
              key={periodo}
              className={`plano-semestre${atual ? ' atual' : ''}${
                passado ? ' passado' : ''
              }${alvo === periodo ? ' alvo' : ''}`}
              aria-label={`Semestre ${periodo}`}
              onDragOver={(evento) => {
                evento.preventDefault()
                if (alvo !== periodo) setAlvo(periodo)
              }}
              onDragLeave={(evento) => {
                if (!evento.currentTarget.contains(evento.relatedTarget))
                  setAlvo(null)
              }}
              onDrop={(evento) => soltar(evento, periodo)}
            >
              <header>
                <h3>{periodo}</h3>
                {atual && <span className="plano-etiqueta">Agora</span>}
                {passado && itens.length > 0 && (
                  <span className="plano-etiqueta aviso">Replanejar</span>
                )}
                <span
                  className={`plano-creditos${puxado ? ' puxado' : ''}`}
                  title={puxado ? 'Semestre puxado' : undefined}
                >
                  {creditos(horas)} cr
                </span>
                {!atual && !doSemestre.length && (
                  <button
                    type="button"
                    className="plano-tirar-semestre"
                    aria-label={`Tirar o semestre ${periodo} do plano`}
                    title="Tirar semestre (as disciplinas voltam para encaixar)"
                    onClick={() =>
                      setPlano((plano) => removerSemestre(plano, periodo))
                    }
                  >
                    ×
                  </button>
                )}
              </header>

              <ul>
                {doSemestre.map((materia) => (
                  <li
                    key={materia.id}
                    className={`plano-item cursando materia-cor-${materia.cor}`}
                  >
                    <span className="plano-item-nome">{materia.nome}</span>
                    <span className="plano-horas">
                      {passado ? 'Cursada' : atual ? 'Cursando' : 'Cadastrada'}
                    </span>
                  </li>
                ))}
                {itens.map((item) => (
                  <li
                    key={item.id}
                    className={`plano-item ${corDoTipo(item.tipo)}`}
                    draggable
                    onDragStart={(evento) => {
                      evento.dataTransfer.setData(
                        'text/plain',
                        JSON.stringify({ id: item.id }),
                      )
                      evento.dataTransfer.effectAllowed = 'move'
                    }}
                  >
                    <span className="plano-item-nome">{item.nome}</span>
                    <span className="plano-horas">{item.horas} h</span>
                    <span className="plano-item-acoes">
                      {!passado && aoCadastrar && (
                        <button
                          type="button"
                          className="plano-cadastrar"
                          aria-label={`Cadastrar ${item.nome} como matéria`}
                          title={`Cadastrar como matéria de ${periodo}`}
                          onClick={() =>
                            // O formulário só aproveita o nome de quem tem
                            // código; uma escrita à mão também vale
                            aoCadastrar({
                              codigo: item.codigo || 'plano',
                              nome: item.nome,
                              cargaHoraria: item.horas,
                              periodo,
                            })
                          }
                        >
                          Cadastrar
                        </button>
                      )}
                      <select
                        className="plano-menu"
                        aria-label={`Mover ${item.nome}`}
                        title="Mover para outro semestre"
                        value=""
                        onChange={(evento) => {
                          const para = evento.target.value

                          if (para === TIRAR)
                            setPlano((plano) => tirarItem(plano, item.id))
                          else if (para) levarPara(para, item)
                        }}
                      >
                        <option value="">Mover…</option>
                        {semestres
                          .filter((opcao) => opcao !== periodo)
                          .map((opcao) => (
                            <option key={opcao} value={opcao}>
                              Para {opcao}
                            </option>
                          ))}
                        {proximo && (
                          <option value={proximo}>Para {proximo} (novo)</option>
                        )}
                        <option value={TIRAR}>Tirar do plano</option>
                      </select>
                    </span>
                  </li>
                ))}
              </ul>

              {!itens.length && !doSemestre.length && (
                <p className="plano-vazio">Solte disciplinas aqui</p>
              )}

              <NovaDisciplina
                semestre={periodo}
                aoAdicionar={(disciplina) => levarPara(periodo, disciplina)}
              />
            </article>
          )
        })}

        {proximo && (
          <button
            type="button"
            className="plano-novo-semestre"
            onClick={() =>
              setPlano((plano) => adicionarSemestre(plano, ultimo))
            }
          >
            <span aria-hidden="true">+</span>
            Semestre {proximo}
          </button>
        )}
      </div>
    </section>
  )
}

/** Escrever uma disciplina à mão (uma eletiva, uma optativa já escolhida). */
function NovaDisciplina({ semestre, aoAdicionar }) {
  const [aberta, setAberta] = useState(false)
  const [nome, setNome] = useState('')
  const [horas, setHoras] = useState(60)

  if (!aberta) {
    return (
      <button
        type="button"
        className="plano-escrever"
        aria-label={`Escrever uma disciplina em ${semestre}`}
        onClick={() => setAberta(true)}
      >
        + Disciplina
      </button>
    )
  }

  function enviar(evento) {
    evento.preventDefault()
    if (!nome.trim()) return
    aoAdicionar({ nome: nome.trim(), codigo: '', horas, tipo: 'obrigatoria' })
    setNome('')
    setAberta(false)
  }

  return (
    <form className="plano-escrever-form" onSubmit={enviar}>
      <input
        type="text"
        aria-label={`Nome da disciplina em ${semestre}`}
        placeholder="Nome da disciplina"
        value={nome}
        maxLength={80}
        autoFocus
        onChange={(evento) => setNome(evento.target.value)}
      />
      <select
        aria-label="Carga horária"
        value={horas}
        onChange={(evento) => setHoras(Number(evento.target.value))}
      >
        {CARGAS.map((opcao) => (
          <option key={opcao} value={opcao}>
            {opcao} h
          </option>
        ))}
      </select>
      <button type="submit" disabled={!nome.trim()}>
        Pôr
      </button>
      <button
        type="button"
        aria-label="Cancelar"
        onClick={() => {
          setNome('')
          setAberta(false)
        }}
      >
        ×
      </button>
    </form>
  )
}
