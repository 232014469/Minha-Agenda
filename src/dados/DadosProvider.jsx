import { useCallback, useMemo, useState } from 'react'
import { DadosContexto } from './contexto'
import {
  CORES,
  lerDados,
  proximoId,
  salvarDados,
  semestreDaData,
  validarDados,
} from './armazenamento'

/**
 * Guarda as matérias e tarefas no navegador e entrega as ações para
 * as telas. As telas recebem só o que é do semestre escolhido; o backup usa
 * `todos`, com todos os semestres.
 */
export default function DadosProvider({ children }) {
  const [dados, setDados] = useState(lerDados)
  // Salva a cada mudança. Gravar de novo os mesmos dados não tem efeito
  // nenhum, então pode rodar durante a renderização.
  const salvou = useMemo(() => salvarDados(dados), [dados])

  const escolherSemestre = useCallback((semestre) => {
    setDados((atuais) => ({ ...atuais, semestre }))
  }, [])

  /** Cadastra a matéria e passa a mostrar o semestre dela. */
  const adicionarMateria = useCallback(({ nome, periodo, cor }) => {
    setDados((atuais) => ({
      ...atuais,
      semestre: periodo || '',
      materias: [
        ...atuais.materias,
        {
          id: proximoId(atuais.materias),
          nome,
          periodo: periodo || '',
          cor: CORES.includes(cor)
            ? cor
            : CORES[atuais.materias.length % CORES.length],
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

  /** Marca ou desmarca uma disciplina do fluxograma como cursada. */
  const alternarCursada = useCallback((id) => {
    setDados((atuais) => ({
      ...atuais,
      cursadas: atuais.cursadas.includes(id)
        ? atuais.cursadas.filter((item) => item !== id)
        : [...atuais.cursadas, id],
    }))
  }, [])

  /** Marca várias de uma vez (importação do histórico), sem desmarcar nada. */
  const marcarCursadas = useCallback((ids) => {
    setDados((atuais) => ({
      ...atuais,
      cursadas: [...new Set([...atuais.cursadas, ...ids])],
    }))
  }, [])

  /** Troca tudo pelo conteúdo de um backup. Devolve `false` se o arquivo não servir. */
  const importar = useCallback((conteudo) => {
    const validos = validarDados(conteudo)

    if (!validos) return false

    setDados(validos)
    return true
  }, [])

  const semestre = dados.semestre ?? semestreDaData()

  const doSemestre = useMemo(() => {
    const materias = dados.materias.filter(
      (materia) => materia.periodo === semestre,
    )
    const ids = new Set(materias.map((materia) => materia.id))

    return {
      materias,
      tarefas: dados.tarefas.filter((tarefa) => ids.has(tarefa.materiaId)),
    }
  }, [dados, semestre])

  // O semestre de hoje sempre aparece na lista, para começar um novo.
  const semestres = useMemo(
    () =>
      [
        ...new Set([
          semestreDaData(),
          semestre,
          ...dados.materias.map((materia) => materia.periodo),
        ]),
      ].sort((a, b) => (a && b ? b.localeCompare(a) : a ? -1 : 1)),
    [dados.materias, semestre],
  )

  const valor = useMemo(
    () => ({
      ...doSemestre,
      todos: dados,
      cursadas: dados.cursadas,
      alternarCursada,
      marcarCursadas,
      semestre,
      semestres,
      escolherSemestre,
      salvou,
      adicionarMateria,
      removerMateria,
      adicionarTarefa,
      alterarStatus,
      removerTarefa,
      importar,
    }),
    [
      doSemestre,
      dados,
      semestre,
      semestres,
      escolherSemestre,
      salvou,
      alternarCursada,
      marcarCursadas,
      adicionarMateria,
      removerMateria,
      adicionarTarefa,
      alterarStatus,
      removerTarefa,
      importar,
    ],
  )

  return <DadosContexto value={valor}>{children}</DadosContexto>
}
