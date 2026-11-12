# Minha Agenda

Agenda pessoal para a faculdade: matérias, entregas e prazos em um só lugar.
Feita com React + Vite, reaproveitando telas do projeto cAnCHA.

## O que tem

- **Agenda** com as vistas Mês, Semana, Lista e Quadro (A fazer, Em andamento, Concluídas), filtro por matéria e cadastro de tarefas.
- **Matérias** com cor própria, barra de progresso e página com as entregas ordenadas por urgência.
- **Backup**: baixe e restaure seus dados em um arquivo `.json`.

Não há servidor nem login: tudo fica guardado no navegador (`localStorage`). Para levar os dados a outro computador, use o backup em Matérias.

## Como rodar

```bash
npm install
npm run dev
```

Outros comandos: `npm test`, `npm run lint`, `npm run format:check`, `npm run build`.

## Publicar

`npm run build` gera a pasta `dist/`, que funciona em qualquer hospedagem estática (GitHub Pages, Render, Netlify). As rotas usam `#`, então não precisam de configuração extra.
