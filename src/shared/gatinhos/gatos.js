/** Os cinco gatinhos do pacote de pixel art (quadros de 32×32). */
export const GATOS = [
  { id: 'gato01', nome: 'Gatinho marrom' },
  { id: 'gato02', nome: 'Gatinho cinza' },
  { id: 'gato03', nome: 'Gatinho laranja' },
  { id: 'gato04', nome: 'Gatinho azulado' },
  { id: 'gato05', nome: 'Gatinho preto' },
]

/** Avisado pelos dados quando uma tarefa é concluída (o gatinho comemora). */
export const EVENTO_CONCLUIU = 'wolf-study:concluiu'

/** Avisado quando uma tarefa vai para "Não realizadas" ou é excluída. */
export const EVENTO_TRISTE = 'wolf-study:triste'

/** Avisado quando mais uma falta é anotada (o gatinho reclama). */
export const EVENTO_FALTA = 'wolf-study:falta'

/**
 * Avisado pelo alerta de entrada ("Pode não!") com os ids de todas as
 * atividades atrasadas ou para hoje: os post-its delas no quadro "Esta
 * semana" piscam.
 */
export const EVENTO_ALERTA_POSTIT = 'wolf-study:alerta-postit'

/** Quantos quadros cada animação tem. */
export const QUADROS = {
  idle_blink: 8,
  walk: 8,
  jump: 5,
  liedown: 24,
  sit: 8,
  crouch: 8,
  hurt: 5,
  attack: 6,
  land: 3,
  run: 4,
  wallgrab: 8,
  wallclimb: 4,
}

const imagens = import.meta.glob('../../assets/gatinhos/*.png', {
  eager: true,
  import: 'default',
})

export function urlDoSprite(gato, animacao) {
  return imagens[`../../assets/gatinhos/${gato}-${animacao}.png`]
}

export const ehGato = (id) => GATOS.some((gato) => gato.id === id)

/** O gatinho escolhido como mascote ou, se não houver um, um sorteado. */
export function gatoDaVez(mascote) {
  return ehGato(mascote)
    ? mascote
    : GATOS[Math.floor(Math.random() * GATOS.length)].id
}
