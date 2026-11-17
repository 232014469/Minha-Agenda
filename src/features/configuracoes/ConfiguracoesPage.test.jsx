// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import DadosProvider from '../../dados/DadosProvider'
import ConfiguracoesPage from './ConfiguracoesPage'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function abrir(ligada) {
  return render(
    <DadosProvider opcoesDaSincronizacao={{ ligada }}>
      <ConfiguracoesPage />
    </DadosProvider>,
  )
}

describe('Configurações', () => {
  it('tem o backup, com baixar e restaurar', () => {
    abrir(false)

    expect(
      screen.getByRole('heading', { name: 'Configurações' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Backup' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Baixar backup' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Restaurar backup' }),
    ).toBeInTheDocument()
  })

  it('mostra a sincronização quando ela está ligada', () => {
    abrir(true)

    expect(
      screen.getByRole('heading', { name: 'Sincronizar aparelhos' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Criar chave' }),
    ).toBeInTheDocument()
  })
})
