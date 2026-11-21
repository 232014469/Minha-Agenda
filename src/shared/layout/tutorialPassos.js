/** Guardado depois que a pessoa termina (ou pula) o tutorial. */
export const CHAVE_TUTORIAL = 'wolf-study.tutorial-visto'

/** Abre o tutorial de novo (pelas Configurações). */
export const EVENTO_TUTORIAL = 'wolf-study:tutorial'

/**
 * Os passos do tour: `alvo` é o que fica em destaque (sem alvo, o cartão
 * aparece no meio da tela). Passos cujo alvo não está na tela (no celular,
 * por exemplo) são pulados.
 */
export const PASSOS = [
  {
    titulo: 'Bem-vindo ao Wolf Study!',
    texto:
      'Seu caderno do semestre: matérias, provas, faltas e um gatinho que torce por você. Bora dar uma volta rápida?',
    gatinho: true,
  },
  {
    alvo: '.tamagotchi, .mascote-cantinho',
    titulo: 'Este é o seu gatinho',
    texto:
      'Ele fica feliz quando você entrega tudo em dia e chateado com atrasos e faltas. Os botões do lado dão comida, brincadeira e carinho.',
  },
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
    texto:
      'Troque a cor do tema, ligue o modo escuro, escolha o gatinho e faça cópias de segurança.',
  },
  {
    titulo: 'Tudo pronto!',
    texto: 'Que tal começar cadastrando a sua primeira matéria?',
    gatinho: true,
    final: true,
  },
]
