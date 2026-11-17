# Wolf Study

Agenda para a faculdade: matérias, entregas e prazos em um só lugar.
Feita com React + Vite, reaproveitando telas do projeto cAnCHA.

**Use em:** https://232014469.github.io/Minha-Agenda/

## O que tem

- **Dashboard**: resumo do semestre, progresso, matérias e próximas entregas, além de backup e sincronização.
- **Agenda**: vistas Mês, Semana, Lista e Quadro (A fazer, Em andamento, Concluídas, Não realizadas), filtro por matéria e cadastro de tarefas com tipo de entrega.
- **Post it**: outra forma de ver as tarefas. Arraste o bloco de uma matéria, escreva a atividade e a data e mova o post-it entre Atividades, Concluídas e Não realizadas.
- **Adicionar matéria**: cadastro com semestre e cor. Quem estuda na UnB pode **importar o histórico do SIGAA**; para alunos de Engenharia de Software, isso mostra o **fluxograma do curso** com as disciplinas já cursadas.
- **Semestres**: cada matéria pertence a um semestre, e o seletor no topo mostra só o semestre escolhido.
- **Esta semana**: quadro fixo no menu lateral com as tarefas pendentes da semana.
- **Sincronizar aparelhos**: uma chave (`WOLF-XXXX-XXXX-XXXX-XXXX-XXXX`) leva tudo para o celular ou outro computador, sem conta nem senha.

Os dados ficam no navegador (`localStorage`). Cada pessoa começa com o app vazio, e só os seus aparelhos veem os seus dados.

## Como rodar

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
npm run dev
```

Abre em http://localhost:5180. Outros comandos: `npm test`, `npm run lint`, `npm run format:check`, `npm run build`.

## Sincronização

Funciona sem login: a chave é ao mesmo tempo o endereço e a senha dos dados.

- Os dados são **criptografados no aparelho** (AES-GCM) antes de sair. O servidor só guarda texto embaralhado e não tem como abrir.
- O servidor recebe só um resumo da chave (SHA-256), nunca a chave.
- As mudanças vão sozinhas: ao mexer em algo, ao voltar para a janela, quando a internet volta e a cada minuto. Se dois aparelhos mudarem ao mesmo tempo, as mudanças são juntadas.
- **Quem tiver a chave vê os dados**, e uma chave perdida não pode ser recuperada.

### Ligar a sincronização (uma vez)

O cofre fica num projeto do [Supabase](https://supabase.com) (plano grátis):

1. Crie uma conta e um projeto novo no Supabase.
2. No projeto, abra **SQL Editor → New query**, cole o conteúdo de [`supabase/cofres.sql`](supabase/cofres.sql) e clique em **Run**.
3. Em **Project Settings → API** (ou **API Keys**), copie a **Project URL** e a chave **publishable** (ou **anon**).
4. Cole as duas em [`src/config/sync.js`](src/config/sync.js), faça commit e push.

A chave publishable foi feita para ficar à mostra no site: sozinha, ela só deixa chamar as duas funções do cofre, que não listam nada.

Enquanto `src/config/sync.js` estiver vazio, a seção de sincronização não aparece.

## Como adaptar para você

O que é pessoal fica em `src/config/`:

1. **`app.js`**: o `nome` e o `lema` do app. Eles aparecem no menu lateral, na aba do navegador, no app instalado e no nome do arquivo de backup. `chaveDosDados` é o nome da gaveta do navegador onde os dados ficam: escolha antes de começar a usar e não mude depois.
2. **`curso.js`**: o fluxograma.
   - `CURSO`: o nome do curso.
   - `NOME_NO_HISTORICO`: como o curso aparece no histórico do SIGAA. O fluxograma só aparece para quem importar um histórico com esse texto.
   - `FLUXOGRAMA`: uma lista por semestre. Cada disciplina é `d('CÓDIGO', 'Nome', créditos, 'cor')`, e as optativas são `optativa(semestre, n)`. As cores possíveis são `lilas`, `amarelo`, `verde`, `rosa`, `azul`, `laranja`, `turquesa` e `marrom`.
   - `CODIGOS_ANTIGOS`: códigos de currículos anteriores que o importador deve converter. Pode ficar vazio (`{}`).
3. **`sync.js`**: o seu projeto do Supabase (veja acima).
4. Rode `npm test`. O teste `src/features/materias/Fluxograma.test.jsx` confere os créditos de cada semestre do fluxograma. Se você trocou de curso, atualize os números esperados nesse teste.

## Publicar

Cada push na `main` roda lint, testes e build e publica no GitHub Pages (`.github/workflows/publicar.yml`). Em outro lugar, `npm run build` gera a pasta `dist/`, que funciona em qualquer hospedagem estática. As rotas usam `#`, então não precisam de configuração extra.

O endereço antigo `/study/` leva para o app principal.

## Licença

[MIT](LICENSE): pode usar, copiar e adaptar à vontade, mantendo o aviso de licença.
