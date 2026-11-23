import { mesclarExtras } from './extras'

/**
 * Junta os dados de dois aparelhos que mudaram ao mesmo tempo.
 *
 * - Matérias e tarefas: entra tudo dos dois; se o mesmo item mudou nos dois,
 *   vale a mudança mais recente (`alteradoEm`). Empate ou item sem data:
 *   vale a versão deste aparelho.
 * - O que foi excluído em qualquer um dos dois continua excluído.
 * - Disciplinas cursadas: as marcadas em qualquer um dos dois.
 * - Semestre escolhido: o deste aparelho.
 * - Progresso do curso (histórico importado): o importado ou alterado por
 *   último.
 * - Extras (lembrete, tema, preferências, bichinho): cada um, o que mudou por
 *   último.
 */
function maisRecente(daqui, deLa) {
  if (!daqui && !deLa) return {}
  if (!deLa) return { progressoCurso: daqui }
  if (!daqui) return { progressoCurso: deLa }

  return {
    progressoCurso:
      (deLa.alteradoEm ?? 0) > (daqui.alteradoEm ?? 0) ? deLa : daqui,
  }
}

export function mesclarDados(local, remoto) {
  const removidos = [...new Set([...remoto.removidos, ...local.removidos])]
  const fora = new Set(removidos)

  const juntar = (deLa, daqui, letra) => {
    const porId = new Map(deLa.map((item) => [item.id, item]))

    for (const item of daqui) {
      const outro = porId.get(item.id)

      if (!outro || (item.alteradoEm ?? 0) >= (outro.alteradoEm ?? 0)) {
        porId.set(item.id, item)
      }
    }

    return [...porId.values()].filter(
      (item) => !fora.has(`${letra}:${item.id}`),
    )
  }

  const materias = juntar(remoto.materias, local.materias, 'm')
  const ids = new Set(materias.map((materia) => materia.id))

  return {
    ...local,
    materias,
    tarefas: juntar(remoto.tarefas, local.tarefas, 't').filter((tarefa) =>
      ids.has(tarefa.materiaId),
    ),
    cursadas: [...new Set([...remoto.cursadas, ...local.cursadas])],
    fluxogramaAtivo: local.fluxogramaAtivo || remoto.fluxogramaAtivo,
    removidos,
    ...maisRecente(local.progressoCurso, remoto.progressoCurso),
    ...(local.extras || remoto.extras
      ? { extras: mesclarExtras(local.extras, remoto.extras) }
      : {}),
  }
}
