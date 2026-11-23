// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EVENTO_EXTRAS,
  EVENTO_EXTRAS_RECEBIDOS,
  ITENS_EXTRAS,
  aplicarExtras,
  comExtras,
  lerExtras,
  marcarExtra,
  mesclarExtras,
  validarExtras,
} from './extras'

afterEach(() => {
  localStorage.clear()
})

describe('extras da sincronização', () => {
  it('sem nada guardado, os dados vão como estão', () => {
    const dados = { materias: [], tarefas: [] }

    expect(comExtras(dados)).toBe(dados)
  })

  it('leva o lembrete com o momento em que mudou', () => {
    const ouvir = vi.fn()

    window.addEventListener(EVENTO_EXTRAS, ouvir)
    localStorage.setItem(ITENS_EXTRAS.lembrete, 'Levar a calculadora')
    marcarExtra('lembrete', 500)
    window.removeEventListener(EVENTO_EXTRAS, ouvir)

    expect(ouvir).toHaveBeenCalledOnce()
    expect(lerExtras()).toEqual({
      lembrete: { valor: 'Levar a calculadora', em: 500 },
    })
  })

  it('guardado antes, sem momento, vai valendo pouco', () => {
    localStorage.setItem(ITENS_EXTRAS.tema, 'doce')

    expect(lerExtras().tema).toEqual({ valor: 'doce', em: 1 })
  })

  it('ao juntar, vale o mais recente; no empate, o daqui', () => {
    const daqui = {
      tema: { valor: 'doce', em: 10 },
      modo: { valor: 'claro', em: 5 },
    }
    const deLa = {
      tema: { valor: 'azul', em: 20 },
      modo: { valor: 'escuro', em: 5 },
      lembrete: { valor: 'Prova', em: 3 },
    }

    expect(mesclarExtras(daqui, deLa)).toEqual({
      tema: { valor: 'azul', em: 20 },
      modo: { valor: 'claro', em: 5 },
      lembrete: { valor: 'Prova', em: 3 },
    })
  })

  it('ignora extras desconhecidos ou estragados', () => {
    expect(
      validarExtras({
        tema: { valor: 'rosa', em: 2 },
        senha: { valor: 'x', em: 2 },
        modo: { valor: 3, em: 2 },
        lembrete: { valor: 'oi' },
      }),
    ).toEqual({ tema: { valor: 'rosa', em: 2 } })
  })

  it('aplica só o que chegou mais novo e avisa quem mostra', () => {
    const ouvir = vi.fn()

    localStorage.setItem(ITENS_EXTRAS.lembrete, 'Daqui')
    marcarExtra('lembrete', 100)
    window.addEventListener(EVENTO_EXTRAS_RECEBIDOS, ouvir)

    expect(
      aplicarExtras({
        lembrete: { valor: 'Mais velho', em: 50 },
        tema: { valor: 'rosa', em: 70 },
      }),
    ).toEqual(['tema'])
    expect(localStorage.getItem(ITENS_EXTRAS.lembrete)).toBe('Daqui')
    expect(localStorage.getItem(ITENS_EXTRAS.tema)).toBe('rosa')

    aplicarExtras({ lembrete: { valor: 'Do celular', em: 200 } })
    window.removeEventListener(EVENTO_EXTRAS_RECEBIDOS, ouvir)

    expect(localStorage.getItem(ITENS_EXTRAS.lembrete)).toBe('Do celular')
    expect(ouvir).toHaveBeenCalledTimes(2)
    expect(lerExtras().lembrete.em).toBe(200)
  })
})
