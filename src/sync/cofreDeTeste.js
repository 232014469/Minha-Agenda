/**
 * Cofre de mentira, só para os testes: guarda na memória e responde igual às
 * funções SQL do Supabase (supabase/cofres.sql).
 */
export function criarCofreDeTeste() {
  const banco = new Map()

  return {
    banco,
    async ler(id) {
      return banco.get(id) ?? null
    },
    async salvar(id, dados, versaoBase) {
      const atual = banco.get(id)

      if (versaoBase === 0) {
        if (atual) return -1
        banco.set(id, { dados, versao: 1 })
        return 1
      }
      if (!atual || atual.versao !== versaoBase) return -1

      banco.set(id, { dados, versao: versaoBase + 1 })
      return versaoBase + 1
    },
  }
}
