/**
 * Nome e frase do app. Mude aqui para personalizar: aparecem no menu lateral,
 * na aba do navegador, no ícone instalado e no nome do arquivo de backup.
 *
 * O projeto gera duas versões (veja o README):
 * - "jeff": a pessoal, com o fluxograma do curso (o `npm run dev` usa esta);
 * - "geral": o Study, sem fluxograma, para qualquer pessoa usar.
 */
const EDICOES = {
  jeff: {
    nome: 'Jeff Study',
    lema: 'Seu semestre, no seu ritmo.',
    // Ícones em public/ com este começo no nome ('' = favicon.svg etc.).
    prefixoDosIcones: '',
    // Nome da gaveta do navegador onde os dados ficam. Escolha uma vez e
    // não mude depois: com outra chave, o app começa vazio (os dados antigos
    // continuam lá, só não são lidos).
    chaveDosDados: 'jeff-study.dados',
    comFluxograma: true,
  },
  geral: {
    nome: 'Study',
    lema: 'Seu semestre, no seu ritmo.',
    prefixoDosIcones: 'study-',
    chaveDosDados: 'study.dados',
    comFluxograma: false,
  },
}

/** A configuração de uma versão ("jeff" se o nome não existir). */
export function configDoApp(edicao) {
  return EDICOES[edicao] ?? EDICOES.jeff
}

// A versão vem do build (`vite build --mode geral`); sem nada, é a "jeff".
export const APP = configDoApp(import.meta.env?.VITE_EDICAO)
