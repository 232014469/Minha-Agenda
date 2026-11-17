/**
 * Onde a sincronização guarda os dados (criptografados): um projeto do
 * Supabase (supabase.com, plano grátis). Veja "Sincronização" no README para
 * criar o projeto e rodar o arquivo supabase/cofres.sql.
 *
 * - url: "Project URL" do projeto (Settings → API).
 * - chavePublica: a chave "anon" / "publishable". Ela é feita para ficar no
 *   site, à mostra: sozinha só deixa chamar as duas funções do cofre.
 *
 * Com os dois vazios, a sincronização fica desligada e some da tela.
 */
export const SUPABASE = {
  url: '',
  chavePublica: '',
}
