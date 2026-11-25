// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { EVENTO_EXTRAS } from '../../sync/extras'
import Lembrete from './Lembrete'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('Lembrete', () => {
  it('guarda o texto escrito e mostra de novo ao voltar', () => {
    render(<Lembrete />)

    fireEvent.change(screen.getByLabelText('Lembrete'), {
      target: { value: 'Levar a calculadora na prova' },
    })
    cleanup()
    render(<Lembrete compacto />)

    // No celular aparece o começo; tocar abre o bilhete inteiro
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Lembrete: Levar a calculadora na prova',
      }),
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Lembrete')).toHaveValue(
      'Levar a calculadora na prova',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('não passa do teto de letras', () => {
    render(<Lembrete />)

    fireEvent.change(screen.getByLabelText('Lembrete'), {
      target: { value: 'a'.repeat(250) },
    })

    expect(screen.getByLabelText('Lembrete').value).toHaveLength(200)
  })

  it('abrir vazio não conta como mudança para os outros aparelhos', () => {
    const mudou = vi.fn()

    window.addEventListener(EVENTO_EXTRAS, mudou)
    render(<Lembrete compacto />)

    expect(mudou).not.toHaveBeenCalled()
    expect(localStorage.getItem('wolf-study.dados.lembrete')).toBeNull()

    fireEvent.click(
      screen.getByRole('button', { name: 'Escrever um lembrete' }),
    )
    expect(mudou).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Lembrete'), {
      target: { value: 'Prova na quarta' },
    })
    window.removeEventListener(EVENTO_EXTRAS, mudou)

    expect(mudou).toHaveBeenCalledOnce()
  })

  it('guarda até 5 lembretes e jogar um fora libera espaço', () => {
    render(<Lembrete />)

    fireEvent.change(screen.getByLabelText('Lembrete'), {
      target: { value: 'Primeiro' },
    })
    for (let n = 2; n <= 5; n++) {
      fireEvent.click(screen.getByRole('button', { name: 'Novo lembrete' }))
      fireEvent.change(screen.getByLabelText('Lembrete'), {
        target: { value: `Bilhete ${n}` },
      })
    }

    expect(screen.getByText('5 de 5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Novo lembrete' })).toBeDisabled()
    expect(
      JSON.parse(localStorage.getItem('wolf-study.dados.lembrete')),
    ).toEqual(['Primeiro', 'Bilhete 2', 'Bilhete 3', 'Bilhete 4', 'Bilhete 5'])

    fireEvent.click(
      screen.getByRole('button', { name: 'Jogar este lembrete fora' }),
    )

    expect(screen.getByText('4 de 4')).toBeInTheDocument()
    expect(screen.getByLabelText('Lembrete')).toHaveValue('Bilhete 4')
    expect(
      screen.getByRole('button', { name: 'Novo lembrete' }),
    ).not.toBeDisabled()
    expect(
      JSON.parse(localStorage.getItem('wolf-study.dados.lembrete')),
    ).toEqual(['Primeiro', 'Bilhete 2', 'Bilhete 3', 'Bilhete 4'])
  })

  it('lê o lembrete único do formato antigo sem mudar nada', () => {
    const mudou = vi.fn()

    localStorage.setItem('wolf-study.dados.lembrete', 'Texto de antes')
    window.addEventListener(EVENTO_EXTRAS, mudou)
    render(<Lembrete />)
    window.removeEventListener(EVENTO_EXTRAS, mudou)

    expect(screen.getByLabelText('Lembrete')).toHaveValue('Texto de antes')
    expect(mudou).not.toHaveBeenCalled()
  })
})
