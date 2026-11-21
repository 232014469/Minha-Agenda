import { useCallback, useEffect, useState } from 'react'
import {
  EVENTO_CUIDADO,
  alimentar,
  anotarDia,
  brincar,
  chaveDoDia,
  chocar,
  cuidadoDoDia,
  lerBichinho,
  novoBichinho,
  salvarBichinho,
  situacaoDoBichinho,
} from './bichinho'
import { felicidadeDoGatinho } from './felicidade'

/** De quanto em quanto tempo o relógio do bichinho anda (fome, idade). */
const TIQUE_MS = 15 * 1000

/**
 * O bichinho virtual: guarda a vida do gatinho, calcula a felicidade (das
 * entregas, faltas e do cuidado do dia) e anota a de hoje. `ativo`: só no
 * computador, onde existe o bichinho com os botões; fora dele vale só a
 * felicidade das entregas.
 */
export function useBichinho({ tarefas, materias, ativo = true }) {
  const [bichinho, setBichinho] = useState(() => lerBichinho())
  const [agora, setAgora] = useState(() => Date.now())

  useEffect(() => {
    const relogio = setInterval(() => setAgora(Date.now()), TIQUE_MS)

    return () => clearInterval(relogio)
  }, [])

  useEffect(() => {
    if (ativo) salvarBichinho(bichinho)
  }, [ativo, bichinho])

  const situacao = situacaoDoBichinho(bichinho, agora)
  const cuidado = ativo ? cuidadoDoDia(bichinho, agora) : null
  const felicidade = felicidadeDoGatinho({ tarefas, materias, cuidado })

  // Anota a felicidade de hoje (só com o gatinho vivo e fora do ovo)
  const vivo = situacao.fase === 'filhote' || situacao.fase === 'adulto'

  if (ativo && vivo && bichinho.dias[chaveDoDia(agora)] !== felicidade.pontos) {
    setBichinho(anotarDia(bichinho, felicidade.pontos, agora))
  }

  const cuidar = useCallback((acao) => {
    const instante = Date.now()

    if (acao === 'comer') setBichinho((atual) => alimentar(atual, instante))
    if (acao === 'brincar') setBichinho((atual) => brincar(atual, instante))
    setAgora(instante)
    window.dispatchEvent(new CustomEvent(EVENTO_CUIDADO, { detail: acao }))
  }, [])

  const chocarOvo = useCallback(() => {
    const instante = Date.now()

    setBichinho((atual) => chocar(atual, instante))
    setAgora(instante)
  }, [])

  const recomecar = useCallback(() => {
    const instante = Date.now()

    setBichinho((atual) => novoBichinho(instante, (atual.geracao ?? 1) + 1))
    setAgora(instante)
  }, [])

  return { situacao, felicidade, cuidar, chocarOvo, recomecar }
}
