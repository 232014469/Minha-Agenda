import { describe, expect, it } from 'vitest'
import { previsaoDoTempo } from './alerta'

const HOJE = new Date(2026, 10, 20, 10, 0)
const tarefa = (prazo, status = 'A_FAZER') => ({ prazo, status })

describe('previsão do tempo da placa', () => {
  it('chuva quando há atividade atrasada', () => {
    expect(
      previsaoDoTempo(
        [tarefa('2020-01-01T23:59:00'), tarefa('2020-01-02T23:59:00')],
        HOJE,
      ),
    ).toMatchObject({ tempo: 'chuva', texto: '2 atividades atrasadas' })
  })

  it('sol com nuvem quando há entrega hoje', () => {
    expect(
      previsaoDoTempo([tarefa('2026-11-20T23:59:00')], HOJE),
    ).toMatchObject({ tempo: 'nublado', texto: '1 entrega hoje' })
  })

  it('céu limpo quando nada está pendente para hoje', () => {
    expect(
      previsaoDoTempo([tarefa('2099-01-01T23:59:00')], HOJE),
    ).toMatchObject({ tempo: 'sol', texto: 'Céu limpo: nada atrasado' })
  })
})
