import { useCallback, useEffect, useMemo, useState } from 'react'
import { DadosContexto } from './contexto'
import {
  CORES,
  lerDados,
  proximoId,
  salvarDados,
  validarDados,
} from './armazenamento'

/** Guarda as matérias e tarefas no navegador e entrega as ações para as telas. */
export default function DadosProvider({ children }) {
  const [dados, setDados] = useState(lerDados)
  const [salvou, setSalvou] = useState(true)

  useEffect(() => {
    setSalvou(salvarDados(dados))
  }, [dados])

  const adicionarMateria = useCallback(({ nome, periodo }) => {
    setDados((atuais) => ({
      ...atuais,
      materias: [
        ...atuais.materias,
        {
          id: proximoId(atuais.materias),
          nome,
          periodo: periodo || '',
          cor: CORES[atuais.materias.length % CORES.length],
        },
      ],
    }))
  }, [])

  const removerMateria = useCallback((id) => {
    setDados((atuais) => ({
      ...atuais,
      materias: atuais.materias.filter((materia) => materia.id !== id),
      tarefas: atuais.tarefas.filter((tarefa) => tarefa.materiaId !== id),
    }))
  }, [])

  const mudarCorDaMateria = useCallback((id, cor) => {
    setDados((atuais) => ({
      ...atuais,
      materias: atuais.materias.map((materia) =>
        materia.id === id ? { ...materia, cor } : materia,
      ),
    }))
  }, [])

  const adicionarTarefa = useCallback((tarefa) => {
    setDados((atuais) => ({
      ...atuais,
      tarefas: [
        ...atuais.tarefas,
        { ...tarefa, id: proximoId(atuais.tarefas), status: 'A_FAZER' },
      ],
    }))
  }, [])

  const alterarStatus = useCallback((id, status) => {
    setDados((atuais) => ({
      ...atuais,
      tarefas: atuais.tarefas.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, status } : tarefa,
      ),
    }))
  }, [])

  const removerTarefa = useCallback((id) => {
    setDados((atuais) => ({
      ...atuais,
      tarefas: atuais.tarefas.filter((tarefa) => tarefa.id !== id),
    }))
  }, [])

  /** Troca tudo pelo conteúdo de um backup. Devolve `false` se o arquivo não servir. */
  const importar = useCallback((conteudo) => {
    const validos = validarDados(conteudo)

    if (!validos) return false

    setDados(validos)
    return true
  }, [])

  const valor = useMemo(
    () => ({
      materias: dados.materias,
      tarefas: dados.tarefas,
      salvou,
      adicionarMateria,
      removerMateria,
      mudarCorDaMateria,
      adicionarTarefa,
      alterarStatus,
      removerTarefa,
      importar,
    }),
    [
      dados,
      salvou,
      adicionarMateria,
      removerMateria,
      mudarCorDaMateria,
      adicionarTarefa,
      alterarStatus,
      removerTarefa,
      importar,
    ],
  )

  return <DadosContexto value={valor}>{children}</DadosContexto>
}
