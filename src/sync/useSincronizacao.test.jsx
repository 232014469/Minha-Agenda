// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { criarCofreDeTeste } from './cofreDeTeste'
import { ITENS_EXTRAS, comExtras, marcarExtra } from './extras'
import { assinaturaDe } from './sincronizar'
import { useSincronizacao } from './useSincronizacao'

// Sem crypto.subtle no navegador de teste: a "criptografia" aqui é só JSON.
vi.mock('./cripto', async (original) => ({
  ...(await original()),
  idDoCofre: async (chave) => `id-${chave}`,
  cifrar: async (dados) => JSON.stringify(dados),
  decifrar: async (texto) => JSON.parse(texto),
}))

const materias = [{ id: 1, nome: 'Cálculo', periodo: '2026.2', cor: 'verde' }]
const tarefa = (prazo, alteradoEm) => ({
  id: 10,
  materiaId: 1,
  titulo: 'Lista 1',
  tipo: 'LISTA',
  status: 'A_FAZER',
  prazo,
  alteradoEm,
})
const PRAZO_VELHO = '2030-01-10T18:00:00'
const PRAZO_NOVO = '2030-02-20T18:00:00'
const daqui = {
  materias,
  tarefas: [tarefa(PRAZO_VELHO, 100)],
  cursadas: [],
  removidos: [],
}

afterEach(() => {
  localStorage.clear()
})

describe('sincronização com mudança no meio da rodada', () => {
  it('não devolve ao cofre os dados velhos deste aparelho', async () => {
    // Outro aparelho mudou o prazo e já mandou para o cofre (versão 2);
    // este aparelho ainda está com o prazo velho (sincronizou na versão 1).
    const cofre = criarCofreDeTeste()
    const deLa = { ...daqui, tarefas: [tarefa(PRAZO_NOVO, 200)] }

    cofre.banco.set('id-chave', { dados: JSON.stringify(deLa), versao: 2 })
    localStorage.setItem(
      'wolf-study.dados.sync',
      JSON.stringify({
        chave: 'chave',
        versao: 1,
        assinatura: assinaturaDe(comExtras(daqui)),
      }),
    )

    // Enquanto lê o cofre, algo muda aqui (ex.: o lembrete)
    const ler = cofre.ler
    let primeira = true

    cofre.ler = async (id) => {
      if (primeira) {
        primeira = false
        localStorage.setItem(ITENS_EXTRAS.lembrete, 'Escrito no meio')
        marcarExtra('lembrete')
      }

      return ler(id)
    }

    // Como na tela: o que a sincronização troca passa a ser os dados daqui
    let atualizar = null
    const substituir = vi.fn((novos) => atualizar?.(novos))
    const opcoes = { cofre, ligada: true, espera: 0 }
    const { rerender } = renderHook(
      ({ dados }) => useSincronizacao(dados, substituir, opcoes),
      { initialProps: { dados: daqui } },
    )

    atualizar = (novos) => rerender({ dados: novos })

    // Termina com o prazo novo no cofre e na tela, e o lembrete junto
    await waitFor(() => expect(substituir).toHaveBeenCalled())
    await waitFor(() => {
      const noCofre = JSON.parse(cofre.banco.get('id-chave').dados)

      expect(noCofre.tarefas[0].prazo).toBe(PRAZO_NOVO)
      expect(noCofre.extras.lembrete.valor).toBe('Escrito no meio')
    })
    expect(substituir.mock.lastCall[0].tarefas[0].prazo).toBe(PRAZO_NOVO)
  })
})
