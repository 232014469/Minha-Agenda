/**
 * Atividade avaliativa: a que vale nota. É criada (ou marcada) no cartão de
 * Notas da matéria; as do Post it e da Agenda são entregas normais. Quem já
 * tinha nota lançada continua contando como avaliativa.
 */
export function ehAvaliativa(tarefa) {
  return tarefa?.avaliativa === true || typeof tarefa?.nota === 'number'
}
