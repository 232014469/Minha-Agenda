import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { useDados } from '../../dados/useDados'
import BarraProgresso from '../../shared/components/BarraProgresso'
import '../../shared/cores.css'
import './MateriasPage.css'

function baixarBackup(dados) {
  const arquivo = new Blob([JSON.stringify(dados, null, 2)], {
    type: 'application/json',
  })
  const link = document.createElement('a')
  const dia = new Date().toISOString().slice(0, 10)

  link.href = URL.createObjectURL(arquivo)
  link.download = `minha-agenda-${dia}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}

function Backup() {
  const { materias, tarefas, importar } = useDados()
  const entrada = useRef(null)
  const [mensagem, setMensagem] = useState(null)

  async function aoEscolher(evento) {
    const arquivo = evento.target.files[0]

    evento.target.value = ''
    if (!arquivo) return

    try {
      const conteudo = JSON.parse(await arquivo.text())

      setMensagem(
        importar(conteudo)
          ? 'Backup restaurado.'
          : 'Esse arquivo não é um backup da Minha Agenda.',
      )
    } catch {
      setMensagem('Não foi possível ler o arquivo.')
    }
  }

  return (
    <section className="materias-backup" aria-labelledby="backup-titulo">
      <h2 id="backup-titulo">Backup</h2>
      <p>
        Seus dados ficam só neste navegador. Baixe um backup de vez em quando e
        use-o para levar tudo para outro computador.
      </p>
      <div className="materias-backup-acoes">
        <button
          type="button"
          onClick={() => baixarBackup({ versao: 1, materias, tarefas })}
        >
          Baixar backup
        </button>
        <button type="button" onClick={() => entrada.current.click()}>
          Restaurar backup
        </button>
        <input
          ref={entrada}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={aoEscolher}
        />
      </div>
      {mensagem && <p role="status">{mensagem}</p>}
    </section>
  )
}

export default function MateriasPage() {
  const { materias, tarefas, adicionarMateria } = useDados()
  const [nome, setNome] = useState('')
  const [periodo, setPeriodo] = useState('')

  function enviar(evento) {
    evento.preventDefault()
    if (!nome.trim()) return

    adicionarMateria({ nome: nome.trim(), periodo: periodo.trim() })
    setNome('')
    setPeriodo('')
  }

  return (
    <div className="materias-pagina">
      <h1>Matérias</h1>
      <p className="materias-subtitulo">
        Cadastre as matérias do semestre e acompanhe as entregas de cada uma.
      </p>

      <form className="materias-nova" onSubmit={enviar}>
        <label>
          Nome da matéria
          <input
            type="text"
            value={nome}
            maxLength={80}
            onChange={(evento) => setNome(evento.target.value)}
          />
        </label>
        <label>
          Período
          <input
            type="text"
            value={periodo}
            placeholder="2026.2"
            maxLength={20}
            onChange={(evento) => setPeriodo(evento.target.value)}
          />
        </label>
        <button type="submit" disabled={!nome.trim()}>
          Adicionar matéria
        </button>
      </form>

      {materias.length === 0 ? (
        <p className="materias-vazio">Nenhuma matéria cadastrada ainda.</p>
      ) : (
        <ul className="materias-lista">
          {materias.map((materia) => {
            const dela = tarefas.filter(
              (tarefa) => tarefa.materiaId === materia.id,
            )
            const feitas = dela.filter(
              (tarefa) => tarefa.status === 'CONCLUIDA',
            ).length

            return (
              <li
                key={materia.id}
                className={`materias-cartao materia-cor-${materia.cor}`}
              >
                <h2>
                  <Link to={`/materias/${materia.id}`}>{materia.nome}</Link>
                </h2>
                {materia.periodo && <p>Período letivo · {materia.periodo}</p>}
                <BarraProgresso
                  concluidas={feitas}
                  total={dela.length}
                  rotulo={`Progresso em ${materia.nome}`}
                />
              </li>
            )
          })}
        </ul>
      )}

      <Backup />
    </div>
  )
}
