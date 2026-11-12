import { CORES, NOMES_DAS_CORES } from '../../dados/armazenamento'
import '../cores.css'
import './SeletorCor.css'

/** As 8 cores como bolinhas. Por dentro são botões de rádio, então o teclado funciona. */
export default function SeletorCor({ legenda, nome, valor, aoMudar }) {
  return (
    <fieldset className="seletor-cor">
      <legend>{legenda}</legend>
      {CORES.map((cor) => (
        <label
          key={cor}
          className={`seletor-cor-opcao materia-cor-${cor}`}
          title={NOMES_DAS_CORES[cor]}
        >
          <input
            type="radio"
            name={nome}
            value={cor}
            checked={valor === cor}
            onChange={() => aoMudar(cor)}
            aria-label={NOMES_DAS_CORES[cor]}
          />
          <span aria-hidden="true" />
        </label>
      ))}
    </fieldset>
  )
}
