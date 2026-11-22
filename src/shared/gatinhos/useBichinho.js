import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDados } from '../../dados/useDados'
import {
  EVENTO_CUIDADO,
  abrirCaixa,
  alimentar,
  anotarDia,
  brincar,
  chaveDoDia,
  cuidadoDoDia,
  ehLetivo,
  lerBichinho,
  novoBichinho,
  pausar,
  periodosLetivos,
  retomar,
  salvarBichinho,
  situacaoDoBichinho,
} from './bichinho'
import { felicidadeDoGatinho } from './felicidade'

/** De quanto em quanto tempo o relógio do bichinho anda (fome, idade). */
const TIQUE_MS = 15 * 1000

/**
 * O bichinho virtual: guarda a vida do gatinho, calcula a felicidade (das
 * entregas, faltas e do cuidado do dia) e anota a de hoje, no computador ou
 * no celular (abrir o site em qualquer um conta como visita).
 *
 * `ativo`: o bichinho ligado nas Configurações (desligado, os dias param de
 * contar). `comBotoes`: onde existem os botões de cuidar (no computador);
 * só ali a fome e a brincadeira entram na felicidade.
 */
export function useBichinho({
  tarefas,
  materias,
  ativo = true,
  comBotoes = true,
}) {
  const { todos } = useDados()
  const [bichinho, setBichinho] = useState(() => lerBichinho())
  const [agora, setAgora] = useState(() => Date.now())

  // Período de aula (da 1ª matéria do semestre até uma semana depois do
  // último prazo): dias sem abrir o site nele contam como tristinhos
  const periodos = useMemo(
    () => periodosLetivos({ materias: todos.materias, tarefas: todos.tarefas }),
    [todos.materias, todos.tarefas],
  )
  const letivo = useCallback((quando) => ehLetivo(periodos, quando), [periodos])

  useEffect(() => {
    const relogio = setInterval(() => setAgora(Date.now()), TIQUE_MS)

    return () => clearInterval(relogio)
  }, [])

  useEffect(() => {
    salvarBichinho(bichinho)
  }, [bichinho])

  // Desligado, pausa; religado, a contagem recomeça dali
  if (!ativo && !bichinho.pausado) setBichinho(pausar(bichinho))
  if (ativo && bichinho.pausado) setBichinho(retomar(bichinho, agora))

  const situacao = situacaoDoBichinho(bichinho, agora, letivo)
  const cuidado = ativo && comBotoes ? cuidadoDoDia(bichinho, agora) : null
  const felicidade = felicidadeDoGatinho({ tarefas, materias, cuidado })

  // Anota a felicidade de hoje (só com o gatinho vivo e fora da caixinha)
  const vivo = situacao.fase === 'filhote' || situacao.fase === 'adulto'

  if (ativo && vivo && bichinho.dias[chaveDoDia(agora)] !== felicidade.pontos) {
    setBichinho(anotarDia(bichinho, felicidade.pontos, agora, letivo))
  }

  const cuidar = useCallback((acao) => {
    const instante = Date.now()

    if (acao === 'comer') setBichinho((atual) => alimentar(atual, instante))
    if (acao === 'brincar') setBichinho((atual) => brincar(atual, instante))
    setAgora(instante)
    window.dispatchEvent(new CustomEvent(EVENTO_CUIDADO, { detail: acao }))
  }, [])

  const abrir = useCallback(() => {
    const instante = Date.now()

    setBichinho((atual) => abrirCaixa(atual, instante))
    setAgora(instante)
  }, [])

  const recomecar = useCallback(() => {
    const instante = Date.now()

    setBichinho((atual) => novoBichinho(instante, (atual.geracao ?? 1) + 1))
    setAgora(instante)
  }, [])

  return { situacao, felicidade, cuidar, abrirCaixa: abrir, recomecar }
}
