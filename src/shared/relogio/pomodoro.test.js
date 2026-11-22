import { describe, expect, it } from 'vitest'
import {
  ETAPAS,
  MINUTO,
  atualizar,
  formatar,
  iniciar,
  novoRelogio,
  pausar,
  proximaEtapa,
  reiniciar,
  restanteDe,
} from './pomodoro'

const INICIO = new Date(2026, 10, 22, 14, 0).getTime()

describe('relógio de estudo', () => {
  it('começa parado em 25 minutos de foco', () => {
    const relogio = novoRelogio(INICIO)

    expect(relogio.etapa).toBe('foco')
    expect(relogio.rodando).toBe(false)
    expect(formatar(restanteDe(relogio, INICIO))).toBe('25:00')
  })

  it('conta o tempo pelo relógio e guarda o que falta ao pausar', () => {
    const rodando = iniciar(novoRelogio(INICIO), INICIO)

    expect(formatar(restanteDe(rodando, INICIO + 90 * 1000))).toBe('23:30')

    const parado = pausar(rodando, INICIO + 10 * MINUTO)

    expect(parado.rodando).toBe(false)
    expect(restanteDe(parado, INICIO + 60 * MINUTO)).toBe(15 * MINUTO)
    expect(reiniciar(parado).restante).toBe(ETAPAS.foco.duracao)
  })

  it('ao acabar o foco conta um feito e vai para a pausa, parado', () => {
    const rodando = iniciar(novoRelogio(INICIO), INICIO)
    const depois = atualizar(rodando, INICIO + 26 * MINUTO)

    expect(depois.etapa).toBe('pausa')
    expect(depois.feitos).toBe(1)
    expect(depois.rodando).toBe(false)
    expect(atualizar(depois, INICIO + 27 * MINUTO)).toBe(depois)
  })

  it('o quarto foco leva à pausa longa; pular não conta como feito', () => {
    const tresFeitos = { ...novoRelogio(INICIO), feitos: 3 }

    expect(proximaEtapa(tresFeitos, { concluiu: true }).etapa).toBe(
      'pausaLonga',
    )

    const pulado = proximaEtapa(tresFeitos)

    expect(pulado.etapa).toBe('pausa')
    expect(pulado.feitos).toBe(3)
    expect(proximaEtapa(pulado).etapa).toBe('foco')
  })

  it('num novo dia os focos feitos voltam a zero', () => {
    const ontem = { ...novoRelogio(INICIO), feitos: 5 }

    expect(atualizar(ontem, INICIO + 24 * 60 * MINUTO).feitos).toBe(0)
  })
})
