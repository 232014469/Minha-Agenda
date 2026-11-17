/**
 * Nome e frase do app. Mude aqui para personalizar: aparecem no menu lateral,
 * na aba do navegador, no ícone instalado e no nome do arquivo de backup.
 */
export const APP = {
  nome: 'Wolf Study',
  lema: 'Seu semestre, no seu ritmo.',
  // Nome da gaveta do navegador onde os dados ficam. Escolha uma vez e não
  // mude depois: com outra chave, o app começa vazio (os dados antigos
  // continuam lá, só não são lidos).
  chaveDosDados: 'wolf-study.dados',
  // Gavetas de versões anteriores. Se a atual estiver vazia, os dados da
  // primeira que tiver alguma coisa são trazidos para ela.
  chavesAntigas: ['jeff-study.dados', 'study.dados'],
}
