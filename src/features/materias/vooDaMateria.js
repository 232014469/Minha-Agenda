/** Onde o Dashboard procura as matérias recém-adicionadas (para o pulinho). */
export const CHAVE_MATERIAS_NOVAS = 'wolf-study.materias-novas'

/** Guarda o nome da matéria nova para o Dashboard destacar quando abrir. */
export function lembrarMateriaNova(nome) {
  try {
    const novas = JSON.parse(
      sessionStorage.getItem(CHAVE_MATERIAS_NOVAS) ?? '[]',
    )

    sessionStorage.setItem(
      CHAVE_MATERIAS_NOVAS,
      JSON.stringify([...novas, nome]),
    )
  } catch {
    // Sem armazenamento: só não tem o destaque
  }
}

/** As matérias novas que ainda não ganharam destaque no Dashboard. */
export function lerMateriasNovas() {
  try {
    return new Set(
      JSON.parse(sessionStorage.getItem(CHAVE_MATERIAS_NOVAS) ?? '[]'),
    )
  } catch {
    return new Set()
  }
}

/** Depois do destaque, esquece: ele acontece uma vez só. */
export function esquecerMateriasNovas() {
  try {
    sessionStorage.removeItem(CHAVE_MATERIAS_NOVAS)
  } catch {
    // Sem armazenamento: nada a esquecer
  }
}

/**
 * A matéria nova "voa" do botão até o Dashboard no menu: um bloquinho na cor
 * dela faz um arco, encolhe e some no link, que dá um pulinho ao receber.
 * Sem animações no navegador (ou com "reduzir movimento"), não faz nada.
 */
export function voarParaODashboard({ nome, cor, de }) {
  const destino = document.querySelector('.layout-links a[href$="dashboard"]')
  const anima =
    typeof Element.prototype.animate === 'function' &&
    !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  if (!destino || !de || !anima) return

  const inicio = de.getBoundingClientRect()
  const fim = destino.getBoundingClientRect()
  const bloco = document.createElement('div')

  bloco.className = `voo-materia materia-cor-${cor}`
  bloco.textContent = nome
  bloco.setAttribute('aria-hidden', 'true')
  bloco.style.left = `${inicio.left + inicio.width / 2}px`
  bloco.style.top = `${inicio.top + inicio.height / 2}px`
  document.body.append(bloco)

  const dx = fim.left + fim.width / 2 - (inicio.left + inicio.width / 2)
  const dy = fim.top + fim.height / 2 - (inicio.top + inicio.height / 2)
  // Sobe um pouco no meio do caminho, fazendo um arco
  const alto = Math.min(dy, 0) - 80

  const voo = bloco.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.6)', opacity: 0 },
      {
        transform: 'translate(-50%, -50%) scale(1.05) rotate(-4deg)',
        opacity: 1,
        offset: 0.15,
      },
      {
        transform: `translate(calc(-50% + ${dx * 0.55}px), calc(-50% + ${alto}px)) scale(0.85) rotate(6deg)`,
        offset: 0.55,
      },
      {
        transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.2)`,
        opacity: 0.2,
      },
    ],
    {
      duration: 900,
      easing: 'cubic-bezier(0.45, 0, 0.3, 1)',
      fill: 'forwards',
    },
  )

  voo.finished
    .then(() => {
      destino.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.08)', offset: 0.4 },
          { transform: 'scale(1)' },
        ],
        { duration: 400, easing: 'ease-out' },
      )
    })
    .catch(() => {})
    .finally(() => bloco.remove())
}
