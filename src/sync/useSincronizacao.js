import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { APP } from '../config/app'
import { cofreSupabase, sincronizacaoLigada } from './cofre'
import { formatarChave, gerarChave, idDoCofre, lerChave } from './cripto'
import { assinaturaDe, sincronizar } from './sincronizar'

// Gaveta separada dos dados: a chave e até onde este aparelho já sincronizou.
const GAVETA = `${APP.chaveDosDados}.sync`

function lerRegistro() {
  try {
    const salvo = JSON.parse(window.localStorage.getItem(GAVETA))

    return salvo?.chave ? salvo : null
  } catch {
    return null
  }
}

function salvarRegistro(registro) {
  try {
    if (registro) window.localStorage.setItem(GAVETA, JSON.stringify(registro))
    else window.localStorage.removeItem(GAVETA)
  } catch {
    // Sem como guardar: a sincronização funciona só até fechar a página.
  }
}

/**
 * Sincronização por chave. Recebe os dados atuais e a função que troca os
 * dados da tela, e devolve o que a tela de sincronização precisa.
 *
 * `cofre` só muda nos testes (um cofre de mentira, sem internet).
 */
export function useSincronizacao(
  dados,
  substituir,
  { cofre = cofreSupabase, ligada = sincronizacaoLigada, espera = 1500 } = {},
) {
  const [registro, setRegistro] = useState(lerRegistro)
  const [situacao, setSituacao] = useState({ estado: 'parado' })
  const dadosRef = useRef(dados)
  const registroRef = useRef(registro)
  const rodando = useRef(false)
  const deNovo = useRef(false)
  // A rodada mais recente, para chamar de novo de dentro dela mesma.
  const rodarDeNovo = useRef(() => {})

  useEffect(() => {
    dadosRef.current = dados
  }, [dados])

  const rodar = useCallback(
    async (registroForcado) => {
      const reg = registroForcado ?? registroRef.current

      if (!ligada || !reg?.chave) return
      if (rodando.current) {
        deNovo.current = true
        return
      }

      rodando.current = true
      setSituacao((atual) => ({ ...atual, estado: 'sincronizando' }))

      try {
        const local = dadosRef.current
        const r = await sincronizar({
          local,
          chave: reg.chave,
          estado: reg,
          cofre,
        })
        // Se a pessoa mexeu em algo durante a rodada, não apaga a mudança:
        // roda de novo em seguida, juntando com o que chegou.
        const mexeuNoMeio =
          assinaturaDe(dadosRef.current) !== assinaturaDe(local)

        if (r.trocouLocal && !mexeuNoMeio) substituir(r.dados)

        const novo = {
          chave: reg.chave,
          versao: r.versao,
          assinatura: mexeuNoMeio ? reg.assinatura : r.assinatura,
        }

        salvarRegistro(novo)
        registroRef.current = novo
        setRegistro(novo)
        setSituacao({ estado: 'ok', quando: new Date() })
        if (mexeuNoMeio) deNovo.current = true
      } catch (erro) {
        setSituacao({
          estado: navigator.onLine === false ? 'offline' : 'erro',
          erro: erro.message,
        })
      } finally {
        rodando.current = false
        if (deNovo.current) {
          deNovo.current = false
          setTimeout(() => rodarDeNovo.current(), 0)
        }
      }
    },
    [cofre, ligada, substituir],
  )

  useEffect(() => {
    rodarDeNovo.current = () => rodar()
  }, [rodar])

  const temChave = Boolean(registro?.chave)

  // Mudou alguma coisa aqui: envia depois de um instante parado.
  useEffect(() => {
    if (!temChave) return undefined

    const espera_ = setTimeout(() => rodar(), espera)

    return () => clearTimeout(espera_)
  }, [dados, temChave, rodar, espera])

  // Ao abrir, ao voltar para a janela, quando a internet volta e a cada minuto.
  useEffect(() => {
    if (!temChave) return undefined

    const aoVoltar = () => rodar()
    const intervalo = setInterval(aoVoltar, 60000)

    window.addEventListener('focus', aoVoltar)
    window.addEventListener('online', aoVoltar)

    return () => {
      clearInterval(intervalo)
      window.removeEventListener('focus', aoVoltar)
      window.removeEventListener('online', aoVoltar)
    }
  }, [temChave, rodar])

  /** Cria uma chave nova e guarda os dados deste aparelho no cofre. */
  const criarChave = useCallback(() => {
    const novo = { chave: lerChave(gerarChave()), versao: 0, assinatura: null }

    salvarRegistro(novo)
    registroRef.current = novo
    setRegistro(novo)
    rodar(novo)
  }, [rodar])

  /**
   * Liga este aparelho a uma chave que já existe. Devolve 'ok',
   * 'invalida' (formato errado) ou 'nao-encontrada' (nenhum cofre com ela).
   */
  const conectar = useCallback(
    async (texto) => {
      const chave = lerChave(texto)

      if (!chave) return 'invalida'
      if (!(await cofre.ler(await idDoCofre(chave)))) return 'nao-encontrada'

      const novo = { chave, versao: 0, assinatura: null }

      salvarRegistro(novo)
      registroRef.current = novo
      setRegistro(novo)
      await rodar(novo)
      return 'ok'
    },
    [cofre, rodar],
  )

  /** Para de sincronizar neste aparelho. Os dados daqui continuam aqui. */
  const desligar = useCallback(() => {
    salvarRegistro(null)
    registroRef.current = null
    setRegistro(null)
    setSituacao({ estado: 'parado' })
  }, [])

  const chave = registro?.chave ? formatarChave(registro.chave) : null

  return useMemo(
    () => ({
      ligada,
      chave,
      situacao,
      criarChave,
      conectar,
      desligar,
      sincronizarAgora: rodar,
    }),
    [ligada, chave, situacao, criarChave, conectar, desligar, rodar],
  )
}
