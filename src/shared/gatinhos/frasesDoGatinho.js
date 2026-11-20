import { APP } from '../../config/app'

/**
 * Frases embaixo da casinha, conforme o humor do gatinho (da felicidade).
 * Uma por dia: triste, um empurrãozinho para não desistir; radiante,
 * comemoração.
 */
export const FRASES_DO_GATINHO = {
  triste: [
    'Respira. Um passo de cada vez, eu tô aqui.',
    'Atrasou? Acontece. Bora fazer só a próxima.',
    'Não desiste não, a gente ainda vira esse jogo.',
    'Até gato cai do muro. O importante é levantar.',
    'Começa pela tarefa menor. Já é um começo.',
  ],
  chateado: [
    'Tem coisa acumulando... vamos dar uma olhada?',
    'Um pouquinho hoje já me deixa mais feliz.',
    'Cuidado com as faltas, viu? Eu tô de olho.',
    'Uma entrega de cada vez e o sol volta.',
  ],
  feliz: [
    APP.lema,
    'Tá indo bem! Continua assim.',
    'Constância vale mais que pressa.',
    'Pausa pro café (e pro sachê) também conta.',
  ],
  radiante: [
    'Tudo em dia! O jardim tá florindo.',
    'Arrasou! Merece um cochilo no sol.',
    'Orgulho define. Miau!',
    'Que semestre lindo você tá fazendo.',
  ],
}

/**
 * A frase do dia para o humor: troca à meia-noite (hora local) e segue a
 * ordem da lista, recomeçando depois da última.
 */
export function fraseDoGatinho(humor, agora = new Date()) {
  const frases = FRASES_DO_GATINHO[humor] ?? FRASES_DO_GATINHO.feliz
  const dia = Math.floor(
    Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()) / 86400000,
  )

  return frases[dia % frases.length]
}
