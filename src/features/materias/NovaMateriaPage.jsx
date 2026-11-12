import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { CORES, nomeDoSemestre } from '../../dados/armazenamento'
import { useDados } from '../../dados/useDados'
import SeletorCor from '../../shared/components/SeletorCor'
import '../../shared/secao.css'
import { FLUXOGRAMA } from './dadosFluxograma'
import Fluxograma from './Fluxograma'
import './NovaMateriaPage.css'

/** Primeira cor que nenhuma matéria usa ainda (ou a próxima da fila). */
function corSugerida(materias) {
  const usadas = new Set(materias.map((materia) => materia.cor))

  return (
    CORES.find((cor) => !usadas.has(cor)) ??
    CORES[materias.length % CORES.length]
  )
}

/** Aba só para cadastrar matérias. Fica na tela para cadastrar várias seguidas. */
export default function NovaMateriaPage() {
  const { materias, semestre, adicionarMateria } = useDados()
  const [nome, setNome] = useState('')
  const [periodo, setPeriodo] = useState(semestre)
  const [cor, setCor] = useState(() => corSugerida(materias))
  const [adicionada, setAdicionada] = useState(null)
  const campoNome = useRef(null)

  /** O "+" do fluxograma traz a disciplina para o formulário. */
  function cursar(disciplina) {
    setNome(disciplina.codigo ? disciplina.nome : '')
    setAdicionada(null)
    campoNome.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    campoNome.current?.focus({ preventScroll: true })
  }

  function enviar(evento) {
    evento.preventDefault()
    if (!nome.trim() || !periodo.trim()) return

    adicionarMateria({ nome: nome.trim(), periodo: periodo.trim(), cor })
    setAdicionada({ nome: nome.trim(), periodo: periodo.trim() })
    setNome('')
    setCor(corSugerida([...materias, { cor }]))
  }

  return (
    <div className="materias-pagina">
      <h1 className="titulo-pagina">Adicionar matéria</h1>
      <p className="materias-subtitulo">
        Cadastre as matérias do semestre. Depois é só lançar as tarefas na
        Agenda.
      </p>

      <section className="secao-caixa" aria-labelledby="nova-titulo">
        <header>
          <h2 id="nova-titulo">Nova matéria</h2>
          <p>Escolha o nome, o semestre e a cor do bloco.</p>
        </header>
        <form className="materias-nova" onSubmit={enviar}>
          <label>
            Nome da matéria
            <input
              ref={campoNome}
              type="text"
              value={nome}
              maxLength={80}
              onChange={(evento) => setNome(evento.target.value)}
            />
          </label>
          <label>
            Semestre
            <input
              type="text"
              value={periodo}
              placeholder="2026.2"
              maxLength={20}
              onChange={(evento) => setPeriodo(evento.target.value)}
            />
          </label>

          <SeletorCor
            legenda="Cor da matéria"
            nome="cor"
            valor={cor}
            aoMudar={setCor}
          />

          <button
            type="submit"
            className="secao-botao"
            disabled={!nome.trim() || !periodo.trim()}
          >
            Adicionar matéria
          </button>
        </form>

        {adicionada && (
          <p className="materias-adicionada" role="status">
            “{adicionada.nome}” adicionada em{' '}
            {nomeDoSemestre(adicionada.periodo)}.{' '}
            <Link to="/dashboard">Ver no Dashboard</Link>
          </p>
        )}
      </section>

      {FLUXOGRAMA.length > 0 && <Fluxograma aoCursar={cursar} />}
    </div>
  )
}
