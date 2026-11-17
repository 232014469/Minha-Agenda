import { describe, expect, it } from 'vitest'
import { DADOS_VAZIOS } from '../dados/armazenamento'
import { criarCofreDeTeste } from './cofreDeTeste'
import {
  cifrar,
  decifrar,
  formatarChave,
  gerarChave,
  idDoCofre,
  lerChave,
} from './cripto'
import { mesclarDados } from './mesclar'
import { assinaturaDe, sincronizar } from './sincronizar'

const materia = (id, nome) => ({ id, nome, periodo: '2026.2', cor: 'verde' })
const tarefa = (id, materiaId, titulo) => ({
  id,
  materiaId,
  titulo,
  tipo: 'Prova',
  prazo: '2026-11-20T23:59:00',
  status: 'A_FAZER',
})
const NUNCA = { versao: 0, assinatura: null }

/** Uma rodada e já devolve os dados e o estado para a próxima. */
async function rodada(local, chave, estado, cofre) {
  const r = await sincronizar({ local, chave, estado, cofre })

  return { ...r, estado: { versao: r.versao, assinatura: r.assinatura } }
}

describe('chave de sincronização', () => {
  it('tem o formato WOLF-XXXX-XXXX-XXXX-XXXX-XXXX, sem letras confusas', () => {
    expect(gerarChave()).toMatch(/^WOLF(-[A-HJ-NP-Z2-9]{4}){5}$/)
  })

  it('aceita a chave digitada de qualquer jeito', () => {
    const chave = gerarChave()
    const crua = lerChave(chave)

    expect(lerChave(chave.toLowerCase().replaceAll('-', ' '))).toBe(crua)
    expect(formatarChave(crua)).toBe(chave)
    expect(lerChave('WOLF-1234')).toBeNull()
    expect(lerChave('')).toBeNull()
  })

  it('cada chave vira sempre o mesmo id de cofre', async () => {
    const crua = lerChave(gerarChave())

    expect(await idDoCofre(crua)).toMatch(/^[0-9a-f]{64}$/)
    expect(await idDoCofre(crua)).toBe(await idDoCofre(crua))
  })
})

describe('criptografia', () => {
  it('o cofre nunca recebe o texto aberto, e só a chave certa abre', async () => {
    const chave = lerChave(gerarChave())
    const segredo = await cifrar({ nome: 'Cálculo secreto' }, chave)

    expect(segredo).not.toContain('Cálculo')
    expect(await decifrar(segredo, chave)).toEqual({ nome: 'Cálculo secreto' })
    await expect(decifrar(segredo, lerChave(gerarChave()))).rejects.toThrow()
  })
})

describe('mesclarDados', () => {
  it('junta os dois lados, vale este aparelho no conflito e respeita exclusões', () => {
    const local = {
      ...DADOS_VAZIOS,
      materias: [materia(1, 'Cálculo (editado)')],
      cursadas: ['MAT0025'],
      removidos: ['t:10'],
    }
    const remoto = {
      ...DADOS_VAZIOS,
      materias: [materia(1, 'Cálculo'), materia(2, 'Física')],
      tarefas: [tarefa(10, 1, 'Lista'), tarefa(11, 2, 'Relatório')],
      cursadas: ['CIC0004'],
      fluxogramaAtivo: true,
    }
    const junto = mesclarDados(local, remoto)

    expect(junto.materias.map((m) => m.nome).sort()).toEqual([
      'Cálculo (editado)',
      'Física',
    ])
    expect(junto.tarefas.map((t) => t.titulo)).toEqual(['Relatório'])
    expect([...junto.cursadas].sort()).toEqual(['CIC0004', 'MAT0025'])
    expect(junto.fluxogramaAtivo).toBe(true)
  })
})

describe('sincronizar', () => {
  it('leva os dados de um aparelho para outro', async () => {
    const cofre = criarCofreDeTeste()
    const chave = lerChave(gerarChave())
    const mac = {
      ...DADOS_VAZIOS,
      materias: [materia(1, 'Cálculo')],
      tarefas: [tarefa(10, 1, 'Lista')],
    }

    const criou = await rodada(mac, chave, NUNCA, cofre)

    expect(criou.versao).toBe(1)
    expect(criou.trocouLocal).toBe(false)

    // Celular novo, vazio: só recebe.
    const celular = await rodada(
      { ...DADOS_VAZIOS, semestre: '2026.2' },
      chave,
      NUNCA,
      cofre,
    )

    expect(celular.trocouLocal).toBe(true)
    expect(celular.dados.materias).toEqual(mac.materias)
    expect(celular.versao).toBe(1)
  })

  it('não envia nada quando nada mudou', async () => {
    const cofre = criarCofreDeTeste()
    const chave = lerChave(gerarChave())
    const primeira = await rodada(DADOS_VAZIOS, chave, NUNCA, cofre)
    const segunda = await rodada(DADOS_VAZIOS, chave, primeira.estado, cofre)

    expect(segunda.versao).toBe(primeira.versao)
    expect(segunda.trocouLocal).toBe(false)
  })

  it('mudanças nos dois aparelhos ao mesmo tempo são juntadas', async () => {
    const cofre = criarCofreDeTeste()
    const chave = lerChave(gerarChave())
    const inicio = {
      ...DADOS_VAZIOS,
      materias: [materia(1, 'Cálculo')],
      tarefas: [tarefa(10, 1, 'Lista')],
    }
    const base = await rodada(inicio, chave, NUNCA, cofre)

    // Celular apaga a tarefa; o Mac, sem saber, cria outra matéria.
    const celular = await rodada(
      { ...inicio, tarefas: [], removidos: ['t:10'] },
      chave,
      base.estado,
      cofre,
    )
    const mac = await rodada(
      { ...inicio, materias: [...inicio.materias, materia(2, 'Física')] },
      chave,
      base.estado,
      cofre,
    )

    expect(mac.dados.materias.map((m) => m.nome).sort()).toEqual([
      'Cálculo',
      'Física',
    ])
    expect(mac.dados.tarefas).toEqual([])

    const celularDepois = await rodada(
      celular.dados,
      chave,
      celular.estado,
      cofre,
    )

    expect(assinaturaDe(celularDepois.dados)).toBe(assinaturaDe(mac.dados))
  })

  it('se outro aparelho gravar no meio, lê de novo e junta', async () => {
    const cofre = criarCofreDeTeste()
    const chave = lerChave(gerarChave())
    const base = await rodada(
      { ...DADOS_VAZIOS, materias: [materia(1, 'Cálculo')] },
      chave,
      NUNCA,
      cofre,
    )
    const id = await idDoCofre(chave)
    let atrapalhou = false
    const disputado = {
      ler: cofre.ler,
      async salvar(alvo, dados, versaoBase) {
        if (!atrapalhou) {
          atrapalhou = true
          const atual = cofre.banco.get(id)
          const outro = await decifrar(atual.dados, chave)

          outro.materias.push(materia(3, 'Química'))
          cofre.banco.set(id, {
            dados: await cifrar(outro, chave),
            versao: atual.versao + 1,
          })
          return -1
        }
        return cofre.salvar(alvo, dados, versaoBase)
      },
    }

    const r = await rodada(
      {
        ...DADOS_VAZIOS,
        materias: [materia(1, 'Cálculo'), materia(4, 'Inglês')],
      },
      chave,
      base.estado,
      disputado,
    )

    expect(r.dados.materias.map((m) => m.nome).sort()).toEqual([
      'Cálculo',
      'Inglês',
      'Química',
    ])
  })
})
