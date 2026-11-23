// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import DadosProvider from '../../dados/DadosProvider'
import { CHAVE } from '../../dados/armazenamento'
import { criarCofreDeTeste } from '../../sync/cofreDeTeste'
import Sincronizacao from './Sincronizacao'

// O navegador de teste não tem crypto.subtle: aqui a "criptografia" é só
// JSON. A de verdade é testada em src/sync/sincronizar.test.js.
vi.mock('../../sync/cripto', async (original) => ({
  ...(await original()),
  idDoCofre: async (chave) => `id-${chave}`,
  cifrar: async (dados) => JSON.stringify(dados),
  decifrar: async (texto) => JSON.parse(texto),
}))

let cofre

function abrir() {
  return render(
    <DadosProvider opcoesDaSincronizacao={{ cofre, ligada: true, espera: 0 }}>
      <Sincronizacao />
    </DadosProvider>,
  )
}

/** Troca de "aparelho": outro navegador, com a gaveta vazia. */
function outroAparelho() {
  cleanup()
  localStorage.clear()
}

beforeEach(() => {
  cofre = criarCofreDeTeste()
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('Sincronizar aparelhos', () => {
  it('some quando a sincronização não está configurada', () => {
    render(
      <DadosProvider opcoesDaSincronizacao={{ cofre, ligada: false }}>
        <Sincronizacao />
      </DadosProvider>,
    )

    expect(
      screen.queryByRole('heading', { name: 'Sincronizar aparelhos' }),
    ).not.toBeInTheDocument()
  })

  it('cria a chave, guarda os dados no cofre e outro aparelho recebe', async () => {
    localStorage.setItem(
      CHAVE,
      JSON.stringify({
        materias: [{ id: 1, nome: 'Cálculo', periodo: '2026.2', cor: 'verde' }],
        tarefas: [],
      }),
    )
    abrir()

    fireEvent.click(screen.getByRole('button', { name: 'Criar chave' }))

    expect(await screen.findByText(/Sincronizado às/)).toBeInTheDocument()
    expect(cofre.banco.size).toBe(1)

    // A chave aparece escondida até pedir para mostrar.
    const campo = screen.getByLabelText('Sua chave de sincronização')

    expect(campo).toHaveTextContent('••••')
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar chave' }))

    const chave = campo.textContent

    expect(chave).toMatch(/^WOLF(-[A-Z2-9]{4}){5}$/)

    outroAparelho()
    abrir()

    fireEvent.click(screen.getByRole('button', { name: 'Já tenho uma chave' }))
    fireEvent.change(screen.getByLabelText('Chave de sincronização'), {
      target: { value: chave.toLowerCase() },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Conectar' }))

    expect(await screen.findByText(/Sincronizado às/)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(CHAVE)).materias[0].nome).toBe(
      'Cálculo',
    )
  })

  it('o lembrete e o tema também vão para o outro aparelho', async () => {
    localStorage.setItem(`${CHAVE}.lembrete`, 'Levar a calculadora')
    localStorage.setItem(`${CHAVE}.tema`, 'doce')
    abrir()

    fireEvent.click(screen.getByRole('button', { name: 'Criar chave' }))
    await screen.findByText(/Sincronizado às/)
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar chave' }))

    const chave = screen.getByLabelText(
      'Sua chave de sincronização',
    ).textContent

    outroAparelho()
    abrir()

    fireEvent.click(screen.getByRole('button', { name: 'Já tenho uma chave' }))
    fireEvent.change(screen.getByLabelText('Chave de sincronização'), {
      target: { value: chave },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Conectar' }))

    expect(await screen.findByText(/Sincronizado às/)).toBeInTheDocument()
    expect(localStorage.getItem(`${CHAVE}.lembrete`)).toBe(
      'Levar a calculadora',
    )
    expect(localStorage.getItem(`${CHAVE}.tema`)).toBe('doce')
  })

  it('avisa quando a chave está errada ou não existe', async () => {
    abrir()

    fireEvent.click(screen.getByRole('button', { name: 'Já tenho uma chave' }))
    fireEvent.change(screen.getByLabelText('Chave de sincronização'), {
      target: { value: 'wolf-123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Conectar' }))

    expect(await screen.findByText(/não está no formato/)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Chave de sincronização'), {
      target: { value: 'WOLF-AAAA-BBBB-CCCC-DDDD-EEEE' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Conectar' }))

    expect(
      await screen.findByText(/Nenhum dado encontrado/),
    ).toBeInTheDocument()
  })

  it('"Desligar neste aparelho" esquece a chave e mantém os dados', async () => {
    abrir()
    fireEvent.click(screen.getByRole('button', { name: 'Criar chave' }))
    await screen.findByText(/Sincronizado às/)

    fireEvent.click(
      screen.getByRole('button', { name: 'Desligar neste aparelho' }),
    )

    expect(
      screen.getByRole('button', { name: 'Criar chave' }),
    ).toBeInTheDocument()
    expect(localStorage.getItem(`${CHAVE}.sync`)).toBeNull()
  })
})
