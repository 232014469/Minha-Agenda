import { useCallback, useMemo, useState } from 'react'
import { DadosContexto } from './contexto'
import {
  CORES,
  lerDados,
  proximoId,
  salvarDados,
  semestreDaData,
  validarDados,
  validarProgressoCurso,
} from './armazenamento'
import { EVENTO_CONCLUIU, EVENTO_TRISTE } from '../shared/gatinhos/gatos'
import { useSincronizacao } from '../sync/useSincronizacao'

// Quando o item mudou, para a sincronização saber qual versão é a mais nova.
const agora = () => Date.now()

/**
 * Guarda as matérias e tarefas no navegador e entrega as ações para
 * as telas. As telas recebem só o que é do semestre escolhido; o backup usa
 * `todos`, com todos os semestres.
 */
export default function DadosProvider({ children, opcoesDaSincronizacao }) {
  const [dados, setDados] = useState(lerDados)
  // Dados que chegam de outro aparelho pela sincronização.
  const substituir = useCallback((novos) => setDados(novos), [])
  const sincronizacao = useSincronizacao(
    dados,
    substituir,
    opcoesDaSincronizacao,
  )
  // Salva a cada mudança. Gravar de novo os mesmos dados não tem efeito
  // nenhum, então pode rodar durante a renderização.
  const salvou = useMemo(() => salvarDados(dados), [dados])

  const escolherSemestre = useCallback((semestre) => {
    setDados((atuais) => ({ ...atuais, semestre }))
  }, [])

  /** Soma (ou tira, com número negativo) horas de falta numa matéria. */
  const registrarFalta = useCallback((id, horas) => {
    setDados((atuais) => ({
      ...atuais,
      materias: atuais.materias.map((materia) =>
        materia.id === id
          ? {
              ...materia,
              faltas: Math.max(0, (materia.faltas ?? 0) + horas),
              alteradoEm: agora(),
            }
          : materia,
      ),
    }))
  }, [])

  const definirCargaHoraria = useCallback((id, horas) => {
    setDados((atuais) => ({
      ...atuais,
      materias: atuais.materias.map((materia) =>
        materia.id === id
          ? { ...materia, cargaHoraria: horas, alteradoEm: agora() }
          : materia,
      ),
    }))
  }, [])

  /** Cadastra a matéria e passa a mostrar o semestre dela. */
  const adicionarMateria = useCallback(
    ({ nome, periodo, cor, cargaHoraria }) => {
      setDados((atuais) => ({
        ...atuais,
        semestre: periodo || '',
        materias: [
          ...atuais.materias,
          {
            id: proximoId(atuais.materias),
            nome,
            periodo: periodo || '',
            ...(cargaHoraria && { cargaHoraria }),
            cor: CORES.includes(cor)
              ? cor
              : CORES[atuais.materias.length % CORES.length],
            alteradoEm: agora(),
          },
        ],
      }))
    },
    [],
  )

  const removerMateria = useCallback((id) => {
    setDados((atuais) => ({
      ...atuais,
      materias: atuais.materias.filter((materia) => materia.id !== id),
      tarefas: atuais.tarefas.filter((tarefa) => tarefa.materiaId !== id),
      removidos: [
        ...atuais.removidos,
        `m:${id}`,
        ...atuais.tarefas
          .filter((tarefa) => tarefa.materiaId === id)
          .map((tarefa) => `t:${tarefa.id}`),
      ],
    }))
  }, [])

  const adicionarTarefa = useCallback((tarefa) => {
    setDados((atuais) => ({
      ...atuais,
      tarefas: [
        ...atuais.tarefas,
        {
          ...tarefa,
          id: proximoId(atuais.tarefas),
          status: 'A_FAZER',
          alteradoEm: agora(),
        },
      ],
    }))
  }, [])

  const alterarStatus = useCallback((id, status) => {
    setDados((atuais) => ({
      ...atuais,
      tarefas: atuais.tarefas.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, status, alteradoEm: agora() } : tarefa,
      ),
    }))

    // O mascote comemora ou fica triste (ver Mascote).
    if (status === 'CONCLUIDA') {
      window.dispatchEvent(new CustomEvent(EVENTO_CONCLUIU))
    } else if (status === 'NAO_REALIZADA') {
      window.dispatchEvent(new CustomEvent(EVENTO_TRISTE))
    }
  }, [])

  /** Muda título, tipo, data ou descrição de uma tarefa já salva. */
  const editarTarefa = useCallback((id, mudancas) => {
    const permitidas = ['titulo', 'tipo', 'prazo', 'descricao']
    const limpas = Object.fromEntries(
      Object.entries(mudancas).filter(([campo]) => permitidas.includes(campo)),
    )

    setDados((atuais) => ({
      ...atuais,
      tarefas: atuais.tarefas.map((tarefa) =>
        tarefa.id === id
          ? { ...tarefa, ...limpas, alteradoEm: agora() }
          : tarefa,
      ),
    }))
  }, [])

  const removerTarefa = useCallback((id) => {
    setDados((atuais) => ({
      ...atuais,
      tarefas: atuais.tarefas.filter((tarefa) => tarefa.id !== id),
      removidos: [...atuais.removidos, `t:${id}`],
    }))
    window.dispatchEvent(new CustomEvent(EVENTO_TRISTE))
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

  /**
   * Resultado da importação do histórico: marca as aprovadas (sem desmarcar
   * nada) e mostra o fluxograma.
   */
  const aplicarHistorico = useCallback((ids) => {
    setDados((atuais) => ({
      ...atuais,
      cursadas: [...new Set([...atuais.cursadas, ...ids])],
      fluxogramaAtivo: true,
    }))
  }, [])

  /** Esconde o fluxograma de novo. As marcações ficam guardadas. */
  const esconderFluxograma = useCallback(() => {
    setDados((atuais) => ({
      ...atuais,
      fluxogramaAtivo: false,
      ...(atuais.progressoCurso && {
        progressoCurso: {
          ...atuais.progressoCurso,
          oculto: true,
          alteradoEm: agora(),
        },
      }),
    }))
  }, [])

  /** Guarda o progresso no curso lido do histórico (qualquer curso). */
  const guardarProgressoCurso = useCallback((lido) => {
    setDados((atuais) => {
      const progressoCurso = validarProgressoCurso({
        ...lido,
        oculto: false,
        alteradoEm: agora(),
      })

      return progressoCurso ? { ...atuais, progressoCurso } : atuais
    })
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
      sincronizacao,
      cursadas: dados.cursadas,
      fluxogramaAtivo: dados.fluxogramaAtivo,
      progressoCurso:
        dados.progressoCurso && !dados.progressoCurso.oculto
          ? dados.progressoCurso
          : null,
      guardarProgressoCurso,
      alternarCursada,
      aplicarHistorico,
      esconderFluxograma,
      semestre,
      semestres,
      escolherSemestre,
      salvou,
      registrarFalta,
      definirCargaHoraria,
      adicionarMateria,
      removerMateria,
      adicionarTarefa,
      alterarStatus,
      editarTarefa,
      removerTarefa,
      importar,
    }),
    [
      doSemestre,
      dados,
      sincronizacao,
      semestre,
      semestres,
      escolherSemestre,
      salvou,
      alternarCursada,
      aplicarHistorico,
      esconderFluxograma,
      guardarProgressoCurso,
      registrarFalta,
      definirCargaHoraria,
      adicionarMateria,
      removerMateria,
      adicionarTarefa,
      alterarStatus,
      editarTarefa,
      removerTarefa,
      importar,
    ],
  )

  return <DadosContexto value={valor}>{children}</DadosContexto>
}
