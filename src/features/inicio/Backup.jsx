import { useRef, useState } from 'react'
import { APP } from '../../config/app'
import { useDados } from '../../dados/useDados'

function baixarBackup(dados) {
  const arquivo = new Blob([JSON.stringify(dados, null, 2)], {
    type: 'application/json',
  })
  const link = document.createElement('a')
  const dia = new Date().toISOString().slice(0, 10)

  link.href = URL.createObjectURL(arquivo)
  const nomeDoArquivo = APP.nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  link.download = `${nomeDoArquivo || 'backup'}-${dia}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}

/** Baixar e restaurar o arquivo .json com tudo (matérias e tarefas). */
export default function Backup() {
  const { todos, importar } = useDados()
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
          : `Esse arquivo não é um backup do ${APP.nome}.`,
      )
    } catch {
      setMensagem('Não foi possível ler o arquivo.')
    }
  }

  return (
    <section
      className="inicio-caixa inicio-backup"
      aria-labelledby="backup-titulo"
    >
      <h2 id="backup-titulo">Backup</h2>
      <p>
        Seus dados ficam só neste navegador. Baixe um backup de vez em quando e
        use-o para levar tudo para outro computador. O backup leva todos os
        semestres.
      </p>
      <div className="inicio-backup-acoes">
        <button type="button" onClick={() => baixarBackup(todos)}>
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
