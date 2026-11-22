import { useEffect, useState } from 'react'
import { useDados } from '../../dados/useDados'
import {
  diasAte,
  proximasTarefas,
  textoDosDias,
} from '../../features/inicio/inicioUtils'
import './CartaoHoje.css'

const SEMANA = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
]
const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

/** "hoje às 23:59", "amanhã às 18:00", "em 3 dias" ou "atrasada há 2 dias". */
function quando(tarefa, agora) {
  const dias = diasAte(tarefa.prazo, agora)
  const prazo = new Date(tarefa.prazo)
  const hora = `${String(prazo.getHours()).padStart(2, '0')}:${String(
    prazo.getMinutes(),
  ).padStart(2, '0')}`

  if (tarefa.atrasada) {
    return dias === 0
      ? `atrasada desde ${hora}`
      : `atrasada há ${-dias} ${dias === -1 ? 'dia' : 'dias'}`
  }
  if (dias <= 1) return `${textoDosDias(dias)} às ${hora}`

  return textoDosDias(dias)
}

/**
 * Cartão "Hoje": o dia em destaque (dia da semana, número e mês) e a próxima
 * entrega pendente com quanto falta (a atrasada aparece primeiro, em
 * vermelho). Atualiza sozinho a cada minuto, inclusive na virada do dia. No
 * celular, `compacto`, vira uma faixa em cima do título.
 */
export default function CartaoHoje({ compacto = false }) {
  const { tarefas, materias } = useDados()
  const [agora, setAgora] = useState(() => new Date())

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 60 * 1000)

    return () => clearInterval(intervalo)
  }, [])

  const [proxima] = proximasTarefas(tarefas, materias, 1)

  if (compacto) {
    return (
      <section className="hoje-compacto" aria-label="Hoje">
        <p className="hoje-compacto-data">
          <span>{SEMANA[agora.getDay()].slice(0, 3)}</span>
          <strong>{agora.getDate()}</strong>
        </p>
        <p className="hoje-compacto-proxima">
          {proxima ? (
            <>
              <strong>{proxima.titulo}</strong>
              <span
                className={`hoje-falta${proxima.atrasada ? ' hoje-atrasada' : ''}`}
              >
                {quando(proxima, agora)}
              </span>
            </>
          ) : (
            <strong>Nada pendente 🎉</strong>
          )}
        </p>
      </section>
    )
  }

  return (
    <section className="hoje" aria-label="Hoje">
      <p className="hoje-data">
        <span className="hoje-semana">{SEMANA[agora.getDay()]}</span>
        <strong className="hoje-dia">{agora.getDate()}</strong>
        <span className="hoje-mes">{MESES[agora.getMonth()]}</span>
      </p>
      <div className="hoje-proxima">
        <span className="hoje-rotulo">Próxima entrega</span>
        {proxima ? (
          <>
            <strong className="hoje-tarefa">{proxima.titulo}</strong>
            {proxima.materiaNome && (
              <span className="hoje-materia">{proxima.materiaNome}</span>
            )}
            <span
              className={`hoje-falta${proxima.atrasada ? ' hoje-atrasada' : ''}`}
            >
              {quando(proxima, agora)}
            </span>
          </>
        ) : (
          <strong className="hoje-tarefa">Nada pendente 🎉</strong>
        )}
      </div>
    </section>
  )
}
