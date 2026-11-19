import { useEffect } from 'react'
import '../../shared/secao.css'
import Backup from './Backup'
import Sincronizacao from './Sincronizacao'
import Tema from './Tema'
import './ConfiguracoesPage.css'

/**
 * Configurações num painel suspenso, aberto pela engrenagem do topo: tema,
 * sincronização e backup. Fecha no ×, no Esc ou clicando fora (ver o Layout).
 */
export default function ConfiguracoesPage({ aoFechar }) {
  useEffect(() => {
    if (!aoFechar) return undefined

    function tecla(evento) {
      if (evento.key === 'Escape') aoFechar()
    }

    document.addEventListener('keydown', tecla)

    return () => document.removeEventListener('keydown', tecla)
  }, [aoFechar])

  return (
    <div
      className="config-painel"
      id="config-painel"
      role="dialog"
      aria-labelledby="config-titulo"
    >
      <header className="config-painel-topo">
        <div>
          <h2 id="config-titulo">Configurações</h2>
          <p>Cor do app, outros aparelhos e cópias de segurança.</p>
        </div>
        {aoFechar && (
          <button
            type="button"
            className="config-fechar"
            aria-label="Fechar as configurações"
            onClick={aoFechar}
          >
            ×
          </button>
        )}
      </header>
      <Tema />
      <Sincronizacao />
      <Backup />
    </div>
  )
}
