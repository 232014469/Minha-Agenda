import { validarDados } from '../dados/armazenamento'
import { cifrar, decifrar, idDoCofre } from './cripto'
import { mesclarDados } from './mesclar'

/** Resumo curto dos dados, para saber se mudaram desde a última vez. */
export function assinaturaDe(dados) {
  const texto = JSON.stringify(dados)
  let hash = 2166136261

  for (let i = 0; i < texto.length; i++) {
    hash = Math.imul(hash ^ texto.charCodeAt(i), 16777619)
  }

  return `${texto.length}:${(hash >>> 0).toString(16)}`
}

/** Aparelho sem nada cadastrado: só recebe, não tem o que juntar. */
const estaVazio = (dados) =>
  dados.materias.length === 0 &&
  dados.tarefas.length === 0 &&
  dados.cursadas.length === 0

/**
 * Uma rodada de sincronização. Não mexe na tela nem no navegador: recebe o
 * estado e devolve o que fazer. Assim dá para testar sem servidor.
 *
 * - `local`: os dados deste aparelho agora.
 * - `estado`: `{ versao, assinatura }` da última vez que este aparelho e o
 *   cofre combinaram (versao 0 = nunca).
 * - `cofre`: `{ ler, salvar }` (o do Supabase ou um de mentira nos testes).
 *
 * Devolve `{ dados, versao, assinatura, trocouLocal }`. Se `trocouLocal`,
 * a tela precisa passar a mostrar `dados`.
 */
export async function sincronizar({ local, chave, estado, cofre }) {
  const id = await idDoCofre(chave)
  const mudouAqui = assinaturaDe(local) !== estado.assinatura

  // Se outro aparelho gravar bem no meio, lê de novo e junta outra vez.
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const remoto = await cofre.ler(id)
    const versaoRemota = remoto?.versao ?? 0
    let deLa = null
    let dados = local

    if (remoto && versaoRemota !== estado.versao) {
      deLa = validarDados(await decifrar(remoto.dados, chave))

      if (!deLa) {
        throw new Error('Os dados do cofre não estão no formato certo.')
      }

      const soReceber = !mudouAqui || (estado.versao === 0 && estaVazio(local))

      dados = soReceber ? deLa : mesclarDados(local, deLa)
    }

    const precisaEnviar =
      !remoto || (deLa ? assinaturaDe(dados) !== assinaturaDe(deLa) : mudouAqui)

    const resultado = (versao) => ({
      dados,
      versao,
      assinatura: assinaturaDe(dados),
      trocouLocal: dados !== local,
    })

    if (!precisaEnviar) return resultado(versaoRemota)

    const nova = await cofre.salvar(
      id,
      await cifrar(dados, chave),
      versaoRemota,
    )

    if (nova !== -1) return resultado(nova)
  }

  throw new Error('Outro aparelho está gravando ao mesmo tempo. Tente de novo.')
}
