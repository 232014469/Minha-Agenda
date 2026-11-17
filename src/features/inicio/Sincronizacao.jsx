import { useState } from 'react'
import { useDados } from '../../dados/useDados'

function textoDaSituacao(situacao) {
  if (situacao.estado === 'sincronizando') return 'Sincronizando…'
  if (situacao.estado === 'ok') {
    const hora = situacao.quando.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    return `Sincronizado às ${hora}.`
  }
  if (situacao.estado === 'offline') {
    return 'Sem internet. As mudanças ficam aqui e vão quando a conexão voltar.'
  }
  if (situacao.estado === 'erro') {
    return `Não foi possível sincronizar: ${situacao.erro}`
  }

  return 'Conectado.'
}

/** Esconde o meio da chave: WOLF-ABCD-••••-••••-••••-WXYZ. */
const esconder = (chave) =>
  chave
    .split('-')
    .map((grupo, i, todos) =>
      i <= 1 || i === todos.length - 1 ? grupo : '••••',
    )
    .join('-')

/**
 * Sincronizar aparelhos com uma chave, sem login. Fica no Dashboard, junto
 * do backup. Some se a sincronização não estiver configurada (src/config/sync.js).
 */
export default function Sincronizacao() {
  const { sincronizacao } = useDados()
  const { ligada, chave, situacao, criarChave, conectar, desligar } =
    sincronizacao
  const [mostrar, setMostrar] = useState(false)
  const [entrando, setEntrando] = useState(false)
  const [digitada, setDigitada] = useState('')
  const [aviso, setAviso] = useState('')
  const [copiou, setCopiou] = useState(false)

  if (!ligada) return null

  async function entrar(evento) {
    evento.preventDefault()
    setAviso('Procurando a chave…')

    try {
      const resultado = await conectar(digitada)

      if (resultado === 'invalida') {
        setAviso(
          'Essa chave não está no formato WOLF-XXXX-XXXX-XXXX-XXXX-XXXX.',
        )
      } else if (resultado === 'nao-encontrada') {
        setAviso(
          'Nenhum dado encontrado com essa chave. Confira se digitou certo.',
        )
      } else {
        setAviso('')
        setDigitada('')
        setEntrando(false)
      }
    } catch (erro) {
      setAviso(`Não foi possível conectar: ${erro.message}`)
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(chave)
      setCopiou(true)
      setTimeout(() => setCopiou(false), 2000)
    } catch {
      setMostrar(true)
    }
  }

  return (
    <section
      className="inicio-caixa inicio-backup inicio-sincronizar"
      aria-labelledby="sincronizar-titulo"
    >
      <h2 id="sincronizar-titulo">Sincronizar aparelhos</h2>

      {chave ? (
        <>
          <p>
            Este aparelho está sincronizado com a chave abaixo. Use a mesma
            chave no celular ou em outro computador para ver tudo lá.
          </p>
          <p className="inicio-chave" aria-label="Sua chave de sincronização">
            {mostrar ? chave : esconder(chave)}
          </p>
          <p role="status" className="inicio-sincronizar-situacao">
            {textoDaSituacao(situacao)}
          </p>
          <div className="inicio-backup-acoes">
            <button type="button" onClick={() => setMostrar((m) => !m)}>
              {mostrar ? 'Esconder chave' : 'Mostrar chave'}
            </button>
            <button type="button" onClick={copiar}>
              {copiou ? 'Copiada!' : 'Copiar chave'}
            </button>
            <button
              type="button"
              onClick={() => sincronizacao.sincronizarAgora()}
            >
              Sincronizar agora
            </button>
            <button type="button" onClick={desligar}>
              Desligar neste aparelho
            </button>
          </div>
          <p className="inicio-sincronizar-cuidado">
            Guarde a chave num lugar seguro: quem tiver a chave vê os seus
            dados, e ela não pode ser recuperada se você perder.
          </p>
        </>
      ) : (
        <>
          <p>
            Crie uma chave para levar suas matérias e tarefas para outros
            aparelhos. Não precisa de conta nem senha: os dados viajam
            criptografados e só abrem com a chave.
          </p>
          {entrando ? (
            <form className="inicio-sincronizar-entrar" onSubmit={entrar}>
              <label htmlFor="sincronizar-chave">Chave de sincronização</label>
              <input
                id="sincronizar-chave"
                type="text"
                value={digitada}
                autoComplete="off"
                spellCheck={false}
                placeholder="WOLF-XXXX-XXXX-XXXX-XXXX-XXXX"
                onChange={(evento) => setDigitada(evento.target.value)}
              />
              <div className="inicio-backup-acoes">
                <button type="submit" disabled={!digitada.trim()}>
                  Conectar
                </button>
                <button type="button" onClick={() => setEntrando(false)}>
                  Cancelar
                </button>
              </div>
              <p className="inicio-sincronizar-cuidado">
                O que já existe neste aparelho é juntado com o que está na
                chave.
              </p>
            </form>
          ) : (
            <div className="inicio-backup-acoes">
              <button type="button" onClick={criarChave}>
                Criar chave
              </button>
              <button type="button" onClick={() => setEntrando(true)}>
                Já tenho uma chave
              </button>
            </div>
          )}
          {aviso && <p role="status">{aviso}</p>}
        </>
      )}
    </section>
  )
}
