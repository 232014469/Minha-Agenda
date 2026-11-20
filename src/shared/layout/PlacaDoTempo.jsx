import { APP } from '../../config/app'
import { useDados } from '../../dados/useDados'
import { previsaoDoTempo } from './alerta'
import './PlacaDoTempo.css'

/**
 * Placa de madeira pendurada no chão da casinha, balançando com o vento, com
 * a "previsão do tempo" da agenda (no lugar do lema, que fica só para leitores
 * de tela). Na chuva o vento é mais forte.
 */
export default function PlacaDoTempo() {
  const { tarefas } = useDados()
  const { tempo, icone, texto } = previsaoDoTempo(tarefas)

  return (
    <div className={`placa-tempo placa-tempo-${tempo}`}>
      <p className="so-leitor">{APP.lema}</p>
      <div className="placa-tempo-balanco">
        <span className="placa-tempo-corda" aria-hidden="true" />
        <span className="placa-tempo-corda" aria-hidden="true" />
        <p className="placa-tempo-tabua">
          <span aria-hidden="true">{icone}</span> {texto}
        </p>
      </div>
    </div>
  )
}
