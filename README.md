# Jeff Study

Agenda pessoal para a faculdade: matérias, entregas e prazos em um só lugar.
Feita com React + Vite, reaproveitando telas do projeto cAnCHA.

## O que tem

- **Dashboard**: resumo do semestre, progresso, matérias e próximas entregas, além do backup dos dados.
- **Agenda**: vistas Mês, Semana, Lista e Quadro (A fazer, Em andamento, Concluídas, Não realizadas), filtro por matéria e cadastro de tarefas com tipo de entrega.
- **Post it**: outra forma de ver as tarefas. Arraste o bloco de uma matéria, escreva a atividade e a data e mova o post-it entre Atividades, Concluídas e Não realizadas.
- **Adicionar matéria**: cadastro com semestre e cor, mais o **fluxograma do curso** para marcar o que já foi cursado (com importação do histórico do SIGAA).
- **Semestres**: cada matéria pertence a um semestre, e o seletor no topo mostra só o semestre escolhido.
- **Esta semana**: quadro fixo no menu lateral com as tarefas pendentes da semana.

Não há servidor nem login: tudo fica guardado no navegador (`localStorage`). Cada pessoa começa com o app vazio. Para levar os dados a outro computador, use o backup no Dashboard.

## Como rodar

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
npm run dev
```

Outros comandos: `npm test`, `npm run lint`, `npm run format:check`, `npm run build`.

## Como adaptar para você

Tudo o que é pessoal fica em `src/config/`:

1. **Nome do app** em `src/config/app.js`: troque `nome` e `lema`. Eles aparecem no menu lateral, na aba do navegador e no nome do arquivo de backup. Troque também o `<title>` em `index.html`, que aparece enquanto a página carrega. Ali também fica `chaveDosDados`, o nome da gaveta do navegador onde os dados ficam: escolha antes de começar a usar e não mude depois.
2. **Curso e fluxograma** em `src/config/curso.js`:
   - `CURSO`: o nome do seu curso.
   - `FLUXOGRAMA`: uma lista por semestre. Cada disciplina é `d('CÓDIGO', 'Nome', créditos, 'cor')`, e as optativas são `optativa(semestre, n)`. As cores possíveis são `lilas`, `amarelo`, `verde`, `rosa`, `azul`, `laranja`, `turquesa` e `marrom`.
   - Não quer fluxograma? Deixe `FLUXOGRAMA = []` e a seção some.
   - `IMPORTAR_HISTORICO_SIGAA`: o botão "Importar do histórico" lê o PDF do SIGAA da UnB. Em outra faculdade, deixe `false`.
   - `CODIGOS_ANTIGOS`: códigos de currículos anteriores que o importador deve converter. Pode ficar vazio (`{}`).
3. Rode `npm test`. O teste `src/features/materias/Fluxograma.test.jsx` confere os créditos de cada semestre do fluxograma atual. Se você trocou de curso, atualize os números esperados nesse teste.

Seus dados (matérias, tarefas, disciplinas cursadas) nunca vão para o código, então pode compartilhar o projeto sem medo. Se quiser mandar seus dados também, use o backup.

## Publicar

`npm run build` gera a pasta `dist/`, que funciona em qualquer hospedagem estática (GitHub Pages, Render, Netlify). As rotas usam `#`, então não precisam de configuração extra.

## Licença

[MIT](LICENSE): pode usar, copiar e adaptar à vontade, mantendo o aviso de licença.
