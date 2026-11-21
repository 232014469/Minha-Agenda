import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './JanelaNaPagina.css'

/**
 * De onde a janela nasce: o deslocamento do elemento clicado até o meio da
 * área da página (sem o menu) e o tamanho dele perto da janela.
 */
function origemDaJanela(origem, largura) {
  if (!origem) return undefined

  const pagina = document
    .querySelector('.layout-coluna')
    ?.getBoundingClientRect()
  const meio = pagina ? pagina.left + pagina.width / 2 : window.innerWidth / 2
  const x = origem.left + origem.width / 2 - meio
  const y = origem.top + origem.height / 2 - window.innerHeight / 2

  return {
    '--de-x': `${Math.round(x)}px`,
    '--de-y': `${Math.round(y)}px`,
    '--de-escala': Math.min(0.6, Math.max(0.15, origem.width / largura)),
  }
}

/**
 * Janelinha por cima da página (o menu lateral fica livre): o fundo escurece
 * e a janela sai do elemento clicado (`origem`, um getBoundingClientRect) e
 * cresce até o meio. Fecha no Esc ou clicando fora (`aoFechar`).
 */
export default function JanelaNaPagina({
  origem,
  largura = 360,
  rotulo,
  className = '',
  aoFechar,
  children,
}) {
  useEffect(() => {
    function tecla(evento) {
      if (evento.key === 'Escape') aoFechar()
    }

    document.addEventListener('keydown', tecla)

    return () => document.removeEventListener('keydown', tecla)
  }, [aoFechar])

  return createPortal(
    <div
      className="janela-fundo"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar()
      }}
    >
      <div
        className={`janela ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={rotulo}
        style={{
          ...origemDaJanela(origem, largura),
          '--janela-largura': `${largura}px`,
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
