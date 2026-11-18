/**
 * Frases do cartão "Meu progresso": uma por dia, na ordem da lista, e
 * recomeça depois da última. `grupo` é o emoji que aparece ao lado.
 */
export const FRASES = [
  {
    grupo: '🧠',
    texto:
      'Eu aprendi com a minha vida que a gente tem sempre que ser pessimista... achando que vai ser o fracasso, se for fracasso você acertou. E se for sucesso, é uma surpresa...',
  },
  {
    grupo: '🧠',
    texto:
      'Da mesma forma que a pessoa pode subir, a pessoa pode cair também. Por isso que eu nem comemoro!',
  },
  {
    grupo: '🧠',
    texto:
      'Deve-se normalizar o desistir. Vamos normalizar o desistir. As pessoas sempre fracassam. Desistam, não vale a pena.',
  },
  { grupo: '🧠', texto: 'Não desista, errado já tá dando faz tempo!' },
  { grupo: '🧠', texto: 'Não aceite sua feiura, vire padrão!' },
  {
    grupo: '💅',
    texto:
      'Eu estou exercendo o meu direito. Está na lei que eu posso ser feia.',
  },
  {
    grupo: '💅',
    texto:
      'Amor, eu não perguntei nada, então a sua opinião pra mim é insignificante e irrelevante...',
  },
  {
    grupo: '💅',
    texto: 'Quer silêncio, quer viver na tranquilidade? Vai morar num sítio.',
  },
  {
    grupo: '💅',
    texto:
      'Eu não quero refletir, não quero saber de frase do dia... A gente quer é gozar e baixaria!',
  },
  {
    grupo: '💅',
    texto: 'Se olhe no espelho, às vezes o problema é a gente mesmo.',
  },
  { grupo: '🔊', texto: 'E aí começou o barraco, quebra, quebra!' },
  { grupo: '🔊', texto: 'Tira do plástico, porra!' },
  { grupo: '🔊', texto: 'Não tô pensando em nada, tô com a mente voando.' },
  {
    grupo: '🔊',
    texto:
      'Busque a humilhação para não desistir. Vá atrás da pessoa e declare seu amor.',
  },
  { grupo: '🔊', texto: 'Não tenho marido nem dinheiro.' },
]

/** A frase do dia: troca à meia-noite (hora local) e segue a ordem da lista. */
export function fraseDoDia(agora = new Date(), frases = FRASES) {
  const dia = Math.floor(
    Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()) / 86400000,
  )

  return frases[dia % frases.length]
}
