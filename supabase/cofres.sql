-- Cofre da sincronização do Wolf Study.
-- Rode uma vez no Supabase: SQL Editor → New query → cole tudo → Run.
--
-- Cada cofre guarda os dados de uma chave, já criptografados no aparelho.
-- O id é um resumo (SHA-256) da chave: sem a chave, não dá para achar o
-- cofre, e o servidor nunca vê os dados abertos.

create table if not exists public.cofres (
  id text primary key check (id ~ '^[0-9a-f]{64}$'),
  dados text not null check (char_length(dados) <= 5000000),
  versao bigint not null default 1,
  atualizado_em timestamptz not null default now()
);

-- Ninguém lê nem escreve na tabela direto: só pelas duas funções abaixo.
-- (Sem políticas de acesso = nada passa, nem listar os cofres.)
alter table public.cofres enable row level security;
revoke all on table public.cofres from anon, authenticated;

-- Lê um cofre pelo id. Sem o id certo, não devolve nada.
create or replace function public.ler_cofre(p_id text)
returns table (dados text, versao bigint)
language sql
security definer
set search_path = public
as $$
  select c.dados, c.versao from public.cofres c where c.id = p_id;
$$;

-- Grava se a versão no servidor ainda for p_versao_base (0 = criar).
-- Devolve a versão nova, ou -1 se outro aparelho gravou antes.
create or replace function public.salvar_cofre(
  p_id text,
  p_dados text,
  p_versao_base bigint
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  nova bigint;
begin
  if p_versao_base = 0 then
    insert into public.cofres (id, dados) values (p_id, p_dados)
    on conflict (id) do nothing
    returning versao into nova;
  else
    update public.cofres
       set dados = p_dados,
           versao = versao + 1,
           atualizado_em = now()
     where id = p_id and versao = p_versao_base
    returning versao into nova;
  end if;

  return coalesce(nova, -1);
end;
$$;

revoke all on function public.ler_cofre(text) from public;
revoke all on function public.salvar_cofre(text, text, bigint) from public;
grant execute on function public.ler_cofre(text) to anon;
grant execute on function public.salvar_cofre(text, text, bigint) to anon;
