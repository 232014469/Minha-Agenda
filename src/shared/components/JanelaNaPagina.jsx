import { useCallback, useEffect, useState } from 'react'
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

/** Tempo da janela voltando para o elemento de onde saiu. */
const FECHAR_MS = 260

/** Com "reduzir movimento" (ou sem como saber, nos testes), fecha na hora. */
function podeAnimar() {
  return (
    typeof window.matchMedia === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Janelinha por cima da página (o menu lateral fica livre): o fundo escurece
 * e a janela sai do elemento clicado (`origem`, um getBoundingClientRect) e
 * cresce até o meio. Ao fechar (Esc, clique fora ou `fechar`), ela volta
 * encolhendo para o mesmo lugar e só então chama `aoFechar`.
 *
 * `children` pode ser uma função que recebe `fechar(depois)`: fecha com a
 * animação e, no fim, roda `depois` (por exemplo, salvar) antes de `aoFechar`.
 */
export default function JanelaNaPagina({
  origem,
  largura = 360,
  rotulo,
  className = '',
  aoFechar,
  children,
}) {
  // Fechando: o que fazer quando a janela terminar de voltar
  const [fechando, setFechando] = useState(null)

  const fechar = useCallback(
    (depois) => {
      const terminar = () => {
        depois?.()
        aoFechar()
      }

      if (podeAnimar()) setFechando(() => terminar)
      else terminar()
    },
    [aoFechar],
  )

  useEffect(() => {
    if (!fechando) return undefined

    const espera = setTimeout(fechando, FECHAR_MS)

    return () => clearTimeout(espera)
  }, [fechando])

  useEffect(() => {
    function tecla(evento) {
      if (evento.key === 'Escape') fechar()
    }

    document.addEventListener('keydown', tecla)

    return () => document.removeEventListener('keydown', tecla)
  }, [fechar])

  return createPortal(
    <div
      className={`janela-fundo${fechando ? ' fechando' : ''}`}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) fechar()
      }}
    >
      <div
        className={`janela ${className}${fechando ? ' fechando' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={rotulo}
        style={{
          ...origemDaJanela(origem, largura),
          '--janela-largura': `${largura}px`,
        }}
      >
        {typeof children === 'function' ? children(fechar) : children}
      </div>
    </div>,
    document.body,
  )
}
