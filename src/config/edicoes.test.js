import { afterEach, describe, expect, it, vi } from 'vitest'
import { configDoApp } from './app'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('versões do app', () => {
  it('Jeff Study e Study guardam os dados em gavetas diferentes', () => {
    const jeff = configDoApp('jeff')
    const geral = configDoApp('geral')

    expect(jeff.nome).toBe('Jeff Study')
    expect(geral.nome).toBe('Study')
    expect(geral.chaveDosDados).not.toBe(jeff.chaveDosDados)
    expect(configDoApp(undefined)).toBe(jeff)
  })

  it('sem versão definida, é o Jeff Study com fluxograma', async () => {
    const { APP } = await import('./app')
    const curso = await import('./curso')

    expect(APP.nome).toBe('Jeff Study')
    expect(curso.FLUXOGRAMA.length).toBe(10)
    expect(curso.IMPORTAR_HISTORICO_SIGAA).toBe(true)
  })

  it('o Study (geral) não tem fluxograma nem importação do SIGAA', async () => {
    vi.stubEnv('VITE_EDICAO', 'geral')

    const { APP } = await import('./app')
    const curso = await import('./curso')

    expect(APP.nome).toBe('Study')
    expect(curso.FLUXOGRAMA).toEqual([])
    expect(curso.IMPORTAR_HISTORICO_SIGAA).toBe(false)
  })
})
