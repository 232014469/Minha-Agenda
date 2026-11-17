import { SUPABASE } from '../config/sync'

/**
 * Conversa com o cofre no Supabase. São só duas funções SQL (veja
 * supabase/cofres.sql): ninguém lê a tabela direto, então quem não tem a
 * chave não consegue listar nem achar o cofre de outra pessoa.
 */

export const sincronizacaoLigada = Boolean(
  SUPABASE.url && SUPABASE.chavePublica,
)

async function chamar(funcao, parametros) {
  const resposta = await fetch(`${SUPABASE.url}/rest/v1/rpc/${funcao}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE.chavePublica,
      // Chaves antigas ("anon", começam com eyJ) também vão aqui; as novas
      // ("sb_publishable_...") só no apikey.
      ...(SUPABASE.chavePublica.startsWith('eyJ') && {
        Authorization: `Bearer ${SUPABASE.chavePublica}`,
      }),
    },
    body: JSON.stringify(parametros),
  })

  if (!resposta.ok) {
    throw new Error(`O servidor respondeu ${resposta.status}.`)
  }

  return resposta.json()
}

/** O cofre real, no Supabase. */
export const cofreSupabase = {
  /** `{ dados, versao }` ou `null` se ainda não existe cofre com esse id. */
  async ler(id) {
    const linhas = await chamar('ler_cofre', { p_id: id })

    return linhas[0] ?? null
  },

  /**
   * Grava se a versão no servidor ainda for `versaoBase` (0 para criar).
   * Devolve a versão nova, ou -1 se outro aparelho gravou antes.
   */
  async salvar(id, dados, versaoBase) {
    return chamar('salvar_cofre', {
      p_id: id,
      p_dados: dados,
      p_versao_base: versaoBase,
    })
  },
}
