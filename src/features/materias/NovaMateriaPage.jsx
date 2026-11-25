import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { CORES, nomeDoSemestre } from '../../dados/armazenamento'
import { useDados } from '../../dados/useDados'
import SeletorCor from '../../shared/components/SeletorCor'
import '../../shared/secao.css'
import {
  CARGAS,
  CARGA_PADRAO,
  cargaDoHistorico,
  creditosDoFluxograma,
} from '../faltas/faltas'
import PlanoDeFormatura from '../plano/PlanoDeFormatura'
import Fluxograma from './Fluxograma'
import { lembrarMateriaNova, voarParaODashboard } from './vooDaMateria'
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
  const { materias, semestre, adicionarMateria, progressoCurso } = useDados()
  const [nome, setNome] = useState('')
  const [periodo, setPeriodo] = useState(semestre)
  const [cor, setCor] = useState(() => corSugerida(materias))
  const [carga, setCarga] = useState(CARGA_PADRAO)
  const [adicionada, setAdicionada] = useState(null)
  const campoNome = useRef(null)

  /** O "+" do fluxograma traz a disciplina para o formulário. */
  function cursar(disciplina) {
    setNome(disciplina.codigo ? disciplina.nome : '')
    setCarga(disciplina.cargaHoraria ?? disciplina.creditos * 15)
    setAdicionada(null)
    campoNome.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    campoNome.current?.focus({ preventScroll: true })
  }

  function enviar(evento) {
    evento.preventDefault()
    if (!nome.trim() || !periodo.trim()) return

    adicionarMateria({
      nome: nome.trim(),
      periodo: periodo.trim(),
      cor,
      cargaHoraria: carga,
    })
    // A matéria "voa" até o Dashboard no menu, e lá ela chega com destaque
    voarParaODashboard({
      nome: nome.trim(),
      cor,
      de: evento.currentTarget.querySelector('[type="submit"]'),
    })
    lembrarMateriaNova(nome.trim())
    setAdicionada({ nome: nome.trim(), periodo: periodo.trim() })
    setNome('')
    setCor(corSugerida([...materias, { cor }]))
    setCarga(CARGA_PADRAO)
  }

  /** Ao digitar um nome que existe no fluxograma, a carga vem dos créditos. */
  function mudarNome(texto) {
    setNome(texto)

    const creditos = creditosDoFluxograma(texto)
    const doHistorico = cargaDoHistorico(progressoCurso, texto)

    if (creditos) setCarga(creditos * 15)
    else if (doHistorico) setCarga(doHistorico)
  }

  const opcoesDeCarga = [...new Set([...CARGAS, carga])].sort((a, b) => a - b)

  return (
    <div className="materias-pagina">
      <h1 className="titulo-pagina">Adicionar matéria</h1>
      <p className="subtitulo-pagina">
        Cadastre as matérias do semestre e planeje os próximos até a formatura.
        Depois é só lançar as tarefas na Agenda.
      </p>

      <section className="secao-caixa" aria-labelledby="nova-titulo">
        <header>
          <h2 id="nova-titulo">Nova matéria</h2>
          <p>
            Escolha o nome, o semestre, a carga horária (para contar as faltas)
            e a cor do bloco.
          </p>
        </header>
        <form className="materias-nova" onSubmit={enviar}>
          <label>
            Nome da matéria
            <input
              ref={campoNome}
              type="text"
              value={nome}
              maxLength={80}
              onChange={(evento) => mudarNome(evento.target.value)}
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
          <label>
            Carga horária
            <select
              value={carga}
              onChange={(evento) => setCarga(Number(evento.target.value))}
            >
              {opcoesDeCarga.map((horas) => (
                <option key={horas} value={horas}>
                  {horas} h ({horas / 15} créditos)
                </option>
              ))}
            </select>
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

      <PlanoDeFormatura aoCadastrar={cursar} />

      <Fluxograma aoCursar={cursar} />
    </div>
  )
}
