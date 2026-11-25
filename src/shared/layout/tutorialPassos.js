/** Guardado depois que a pessoa termina (ou pula) o tutorial. */
export const CHAVE_TUTORIAL = 'wolf-study.tutorial-visto'

/** Abre o tutorial de novo (pelas Configurações). */
export const EVENTO_TUTORIAL = 'wolf-study:tutorial'

/** O passo do alto do menu muda conforme o que a pessoa escolheu ter lá. */
const CANTINHO = {
  gatinho: {
    alvo: '.tamagotchi, .mascote-cantinho, .layout-mascote-celular',
    titulo: 'Este é o seu gatinho',
    texto:
      'Ele fica feliz quando você entrega tudo em dia e chateado com atrasos e faltas. Os botões embaixo da tela dão comida, brincadeira e carinho.',
  },
  relogio: {
    alvo: '.relogio, .relogio-compacto',
    titulo: 'Relógio de estudo',
    texto:
      '25 minutos de foco e 5 de pausa; a cada 4 focos, uma pausa longa. Aperte o play: o tempo aparece até na aba do navegador.',
  },
  hoje: {
    alvo: '.hoje, .hoje-compacto',
    titulo: 'Hoje',
    texto:
      'A data e a próxima entrega, com quanto falta. Se alguma atrasar, ela aparece aqui em vermelho.',
  },
  lembrete: {
    alvo: '.lembrete, .lembrete-compacto',
    titulo: 'Lembrete',
    texto:
      'Escreva aqui o que não pode esquecer (o quanto couber no papel). Ele fica salvo sozinho.',
  },
}

/**
 * Os passos do tour: `alvo` é o que fica em destaque (sem alvo, o cartão
 * aparece no meio da tela). Passos cujo alvo não está na tela (no celular,
 * por exemplo) são pulados. As boas-vindas e o passo do alto do menu
 * dependem do que a pessoa escolheu ter lá (`cantinho`).
 */
export function passosDoTutorial(cantinho = 'gatinho') {
  const comGatinho = cantinho === 'gatinho'

  return [
    {
      titulo: 'Bem-vindo ao Wolf Study!',
      texto: comGatinho
        ? 'Seu caderno do semestre: matérias, provas, faltas e um gatinho que torce por você. Bora dar uma volta rápida?'
        : 'Seu caderno do semestre: matérias, provas, faltas e tudo o que vence na semana. Bora dar uma volta rápida?',
      gatinho: true,
    },
    CANTINHO[cantinho] ?? CANTINHO.gatinho,
    {
      alvo: '.layout-links a[href$="adicionar-materia"]',
      titulo: 'Comece pelas matérias',
      texto:
        'Cadastre as matérias do semestre com a carga horária: é ela que conta o limite de faltas.',
    },
    {
      alvo: '.layout-links a[href$="agenda"]',
      titulo: 'Agenda',
      texto:
        'Lance provas, listas e trabalhos. Clique num dia para ver tudo o que vence nele.',
    },
    {
      alvo: '.layout-links a[href$="post-it"]',
      titulo: 'Post it',
      texto:
        'Um mural para organizar as atividades: arraste entre A fazer, Concluídas e Não realizadas.',
    },
    {
      alvo: '.layout-links a[href$="dashboard"]',
      titulo: 'Dashboard',
      texto:
        'O resumo do dia: próxima prova, faltas, entregas da semana e o seu progresso.',
    },
    {
      alvo: '.semana',
      titulo: 'Esta semana',
      texto: 'O que vence até domingo fica sempre à vista aqui, em post-its.',
    },
    {
      alvo: '.layout-config',
      titulo: 'Configurações',
      texto: comGatinho
        ? 'Troque a cor do tema (tem até o Reino doce!) e o modo escuro, desligue o céu animado, escolha o gatinho ou troque ele por um relógio de estudo, o cartão Hoje ou um lembrete, e faça cópias de segurança.'
        : 'Troque a cor do tema (tem até o Reino doce!) e o modo escuro, desligue o céu animado, escolha o que fica no alto do menu (tem até um gatinho para cuidar) e faça cópias de segurança.',
    },
    {
      titulo: 'Tudo pronto!',
      texto: 'Que tal começar cadastrando a sua primeira matéria?',
      gatinho: true,
      final: true,
    },
  ]
}
