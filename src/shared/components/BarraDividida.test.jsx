// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import BarraDividida from './BarraDividida'

afterEach(cleanup)

describe('BarraDividida', () => {
  it('divide pelo peso de cada parte e enche cada uma separado', () => {
    render(
      <BarraDividida
        exigido={{
          obrigatorias: 2400,
          optativas: 450,
          complementares: 150,
          total: 3000,
        }}
        integralizado={{
          obrigatorias: 1200,
          optativas: 300,
          complementares: 0,
          total: 1500,
        }}
      />,
    )

    const obrigatorias = screen.getByRole('progressbar', {
      name: 'Obrigatórias (80% do curso)',
    })
    const livres = screen.getByRole('progressbar', {
      name: 'Optativas e livres (20% do curso)',
    })

    expect(obrigatorias).toHaveStyle({ width: '80%' })
    expect(obrigatorias).toHaveAttribute('aria-valuenow', '50')
    expect(livres).toHaveStyle({ width: '20%' })
    expect(livres).toHaveAttribute('aria-valuetext', '300 de 600 h, 50%')
  })

  it('curso sem optativas fica só com as obrigatórias', () => {
    render(
      <BarraDividida
        exigido={{
          obrigatorias: 3000,
          optativas: 0,
          complementares: 0,
          total: 3000,
        }}
        integralizado={null}
      />,
    )

    expect(screen.getAllByRole('progressbar')).toHaveLength(1)
  })
})
