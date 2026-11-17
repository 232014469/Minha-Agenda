/**
 * Junta os dados de dois aparelhos que mudaram ao mesmo tempo.
 *
 * - Matérias e tarefas: entra tudo dos dois; se o mesmo item mudou nos dois,
 *   vale a versão deste aparelho.
 * - O que foi excluído em qualquer um dos dois continua excluído.
 * - Disciplinas cursadas: as marcadas em qualquer um dos dois.
 * - Semestre escolhido: o deste aparelho.
 */
export function mesclarDados(local, remoto) {
  const removidos = [...new Set([...remoto.removidos, ...local.removidos])]
  const fora = new Set(removidos)

  const juntar = (deLa, daqui, letra) => {
    const porId = new Map(deLa.map((item) => [item.id, item]))

    for (const item of daqui) porId.set(item.id, item)

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
  }
}
