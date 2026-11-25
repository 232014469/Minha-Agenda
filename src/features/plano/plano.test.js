// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EVENTO_EXTRAS, ITENS_EXTRAS } from '../../sync/extras'
import {
  adicionarSemestre,
  encaixar,
  guardarPlano,
  lerPlano,
  moverItem,
  paraEncaixar,
  removerSemestre,
  resumirPlano,
  validarPlano,
} from './plano'

const VAZIO = { semestres: [], itens: [] }

const progresso = {
  exigido: { obrigatorias: 120, optativas: 120, complementares: 0, total: 240 },
  integralizado: { obrigatorias: 0, optativas: 0, complementares: 0, total: 0 },
  pendentes: [
    { codigo: 'MAT0026', nome: 'CÁLCULO 2', ch: 90 },
    { codigo: 'FGA0001', nome: 'ESTRUTURAS DE DADOS', ch: 60 },
  ],
}

afterEach(() => localStorage.clear())

describe('plano de formatura', () => {
  it('cria semestres em ordem depois do atual', () => {
    let plano = adicionarSemestre(VAZIO, '2026.2')
    plano = adicionarSemestre(plano, '2026.2')

    expect(plano.semestres).toEqual(['2027.1', '2027.2'])
  })

  it('encaixa, move e tira semestres (o que estava nele volta a faltar)', () => {
    let plano = adicionarSemestre(VAZIO, '2026.2')
    plano = encaixar(
      plano,
      { codigo: 'MAT0026', nome: 'Cálculo 2', horas: 90 },
      '2027.1',
    )
    const id = plano.itens[0].id

    plano = moverItem(plano, id, '2027.2')
    expect(plano.semestres).toEqual(['2027.1', '2027.2'])
    expect(plano.itens[0].semestre).toBe('2027.2')

    plano = removerSemestre(plano, '2027.2')
    expect(plano.itens).toEqual([])
    expect(
      paraEncaixar({ plano, progresso }).map((item) => item.nome),
    ).toContain('Cálculo 2')
  })

  it('lista as obrigatórias pendentes e as vagas de optativa', () => {
    const faltando = paraEncaixar({
      plano: VAZIO,
      progresso,
      materias: [{ nome: 'Estruturas de Dados', cargaHoraria: 60 }],
    })

    // Estruturas de Dados já está sendo cursada
    expect(faltando.map((item) => item.nome)).toEqual([
      'Cálculo 2',
      'Optativa',
      'Optativa',
    ])
  })

  it('mostra a formatura quando não sobra nada para encaixar', () => {
    let plano = encaixar(
      VAZIO,
      { codigo: 'MAT0026', nome: 'Cálculo 2', horas: 90 },
      '2027.1',
    )
    plano = encaixar(
      plano,
      { codigo: 'FGA0001', nome: 'Estruturas de Dados', horas: 60 },
      '2027.2',
    )
    plano = encaixar(
      plano,
      { nome: 'Optativa', horas: 60, tipo: 'optativa' },
      '2027.2',
    )
    plano = encaixar(
      plano,
      { nome: 'Optativa', horas: 60, tipo: 'optativa' },
      '2028.1',
    )

    const faltando = paraEncaixar({ plano, progresso })
    const resumo = resumirPlano({ plano, semestre: '2026.2', faltando })

    expect(faltando).toEqual([])
    expect(resumo.formatura).toBe('2028.1')
    expect(resumo.horasPorSemestre['2027.2']).toBe(120)
  })

  it('ignora o que não tem cara de plano', () => {
    expect(
      validarPlano({
        semestres: ['2027.1', 'abc'],
        itens: [{ id: 'x', nome: '', horas: 60, semestre: '2027.1' }],
      }),
    ).toEqual({ semestres: ['2027.1'], itens: [] })
  })

  it('guarda e sincroniza só quando muda de verdade', () => {
    const mudou = vi.fn()
    window.addEventListener(EVENTO_EXTRAS, mudou)

    guardarPlano(VAZIO)
    expect(localStorage.getItem(ITENS_EXTRAS.plano)).toBeNull()
    expect(mudou).not.toHaveBeenCalled()

    const plano = adicionarSemestre(VAZIO, '2026.2')
    guardarPlano(plano)
    guardarPlano(lerPlano())
    window.removeEventListener(EVENTO_EXTRAS, mudou)

    expect(lerPlano()).toEqual(plano)
    expect(mudou).toHaveBeenCalledOnce()
  })
})
