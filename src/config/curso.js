/**
 * O curso de quem usa o app. Para adaptar a outro curso, troque o CURSO e a
 * lista FLUXOGRAMA (um array por semestre). Sem fluxograma? Deixe
 * `FLUXOGRAMA = []` e a seção some da aba Adicionar matéria.
 *
 * Cada disciplina: d(código, nome, créditos, cor). As cores possíveis são
 * lilas, amarelo, verde, rosa, azul, laranja, turquesa e marrom. Optativas
 * sem código: optativa(semestre, n), com um n diferente para cada uma.
 *
 * Fluxograma atual: Engenharia de Software da UnB (Faculdade UnB Gama).
 * Cores como no fluxograma oficial: amarelo (ciclo básico), verde (curso),
 * rosa (optativas e Desenvolvimento de Software), laranja (projetos
 * integradores, estágio e TCC) e marrom (extensão).
 */
export const CURSO = 'Engenharia de Software · UnB Gama'

/**
 * O botão "Importar do histórico" lê o PDF do SIGAA (UnB). Em outra
 * faculdade, deixe `false` para escondê-lo.
 */
export const IMPORTAR_HISTORICO_SIGAA = true

const d = (codigo, nome, creditos, cor) => ({
  id: codigo,
  codigo,
  nome,
  creditos,
  cor,
})

const optativa = (semestre, n) => ({
  id: `OPT-${semestre}-${n}`,
  codigo: '',
  nome: 'Optativa',
  creditos: 4,
  cor: 'rosa',
})

export const FLUXOGRAMA = [
  [
    d('MAT0025', 'Cálculo 1', 6, 'amarelo'),
    d('CIC0004', 'Algoritmos e Programação de Computadores', 6, 'amarelo'),
    d('FGA0168', 'Desenho Industrial Assistido por Computador', 6, 'amarelo'),
    d('FGA0302', 'Engenharia e Ambiente', 4, 'amarelo'),
    d('FGA0163', 'Introdução à Engenharia', 2, 'amarelo'),
  ],
  [
    d('MAT0026', 'Cálculo 2', 6, 'amarelo'),
    d('IFD0171', 'Física 1', 4, 'amarelo'),
    d('IFD0173', 'Física 1 Experimental', 2, 'amarelo'),
    d('MAT0031', 'Introdução à Álgebra Linear', 4, 'amarelo'),
    d(
      'FGA0157',
      'Probabilidade e Estatística Aplicada à Engenharia',
      4,
      'amarelo',
    ),
    d('FGA0084', 'Desenvolvimento de Software', 4, 'rosa'),
  ],
  [
    d('FGA0160', 'Métodos Numéricos para Engenharia', 4, 'amarelo'),
    d('FGA0133', 'Engenharia Econômica', 4, 'amarelo'),
    d('FGA0164', 'Humanidades e Cidadania', 4, 'amarelo'),
    d('FGA0073', 'Teoria de Eletrônica Digital 1', 4, 'amarelo'),
    d('FGA0071', 'Prática de Eletrônica Digital 1', 2, 'amarelo'),
    d('FGA0158', 'Orientação a Objetos', 4, 'verde'),
    d('FGA0085', 'Matemática Discreta 1', 4, 'verde'),
  ],
  [
    d('FGA0307', 'Gestão da Produção e Qualidade', 4, 'amarelo'),
    d('FGA0312', 'Métodos de Desenvolvimento de Software', 4, 'verde'),
    d('FGA0146', 'Estruturas de Dados 1', 4, 'verde'),
    d('FGA0142', 'Fundamentos de Arquiteturas de Computadores', 4, 'verde'),
    d('FGA0108', 'Matemática Discreta 2', 4, 'verde'),
    d('FGA0303', 'Projeto Integrador de Engenharia 1', 4, 'laranja'),
  ],
  [
    d('FGA0173', 'Interação Humano Computador', 4, 'verde'),
    d('FGA0313', 'Requisitos de Software', 4, 'verde'),
    d('FGA0003', 'Compiladores 1', 4, 'verde'),
    d('FGA0170', 'Fundamentos de Sistemas Operacionais', 4, 'verde'),
    d('FGA0137', 'Sistemas de Banco de Dados 1', 4, 'verde'),
    d('FGA0030', 'Estruturas de Dados 2', 4, 'verde'),
  ],
  [
    d('FGA0315', 'Qualidade de Software 1', 4, 'verde'),
    d('FGA0314', 'Testes de Software', 4, 'verde'),
    d('FGA0208', 'Arquitetura e Desenho de Software', 4, 'verde'),
    d('FGA0211', 'Fundamentos de Redes de Computadores', 4, 'verde'),
    d('FGA0060', 'Sistemas de Banco de Dados 2', 4, 'verde'),
    d('FGA0124', 'Projeto e Análise de Algoritmos', 4, 'verde'),
  ],
  [
    d(
      'FGA0242',
      'Técnicas de Programação em Plataformas Emergentes',
      4,
      'verde',
    ),
    d('FGA0210', 'Paradigmas de Programação', 4, 'verde'),
    d('FGA0103', 'Fundamentos de Sistemas Embarcados', 4, 'verde'),
    d(
      'FGA0244',
      'Programação para Sistemas Paralelos e Distribuídos',
      4,
      'verde',
    ),
    optativa(7, 1),
    optativa(7, 2),
  ],
  [
    d('FGA0316', 'Engenharia de Produto de Software', 4, 'verde'),
    d('FGA0317', 'Gerência de Configuração e Evolução de Software', 4, 'verde'),
    optativa(8, 1),
    d('FGA0288', 'Estágio Supervisionado', 14, 'laranja'),
  ],
  [
    optativa(9, 1),
    optativa(9, 2),
    optativa(9, 3),
    d('FGA0287', 'Trabalho de Conclusão de Curso 1', 4, 'laranja'),
    d('FGA0304', 'Projeto Integrador de Engenharia 2', 6, 'laranja'),
  ],
  [
    d('FGA0318', 'Atividade de Extensão Eng. de Software', 3, 'marrom'),
    optativa(10, 1),
    optativa(10, 2),
    d('FGA0290', 'Trabalho de Conclusão de Curso 2', 6, 'laranja'),
  ],
]

/**
 * Código antigo → código atual, para o importador do histórico reconhecer
 * disciplinas de currículos anteriores. Pode ficar vazio: {}.
 */
export const CODIGOS_ANTIGOS = {
  FGA0161: 'FGA0302', // Engenharia e Ambiente
  FGA0184: 'FGA0307', // Gestão da Produção e Qualidade
  FGA0138: 'FGA0312', // Métodos de Desenvolvimento de Software
  FGA0147: 'FGA0146', // Estruturas de Dados 1
  FGA0150: 'FGA0303', // Projeto Integrador de Engenharia 1
  FGA0172: 'FGA0313', // Requisitos de Software
  FGA0278: 'FGA0315', // Qualidade de Software 1
  FGA0238: 'FGA0314', // Testes de Software
  FGA0109: 'FGA0103', // Fundamentos de Sistemas Embarcados
  FGA0206: 'FGA0316', // Engenharia de Produto de Software
  FGA0240: 'FGA0317', // Gerência de Configuração e Evolução de Software
  FGA0021: 'FGA0288', // Estágio Supervisionado
  FGA0009: 'FGA0287', // Trabalho de Conclusão de Curso 1
  FGA0250: 'FGA0304', // Projeto Integrador de Engenharia 2
  FGA0011: 'FGA0290', // Trabalho de Conclusão de Curso 2
}
