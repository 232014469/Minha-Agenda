import { useState } from 'react'
import { TEMAS, aplicarTema, lerTema } from '../../config/tema'

/** Escolha da cor do app (vale para este aparelho). */
export default function Tema() {
  const [atual, setAtual] = useState(lerTema)

  function escolher(id) {
    setAtual(aplicarTema(id))
  }

  return (
    <section
      className="secao-caixa config-secao"
      aria-labelledby="config-tema-titulo"
    >
      <h2 id="config-tema-titulo">Tema</h2>
      <p>
        A cor do menu, das abas, das barras de progresso e das manchas do topo.
        As cores das matérias não mudam.
      </p>
      <fieldset className="config-temas">
        <legend className="so-leitor">Cor do tema</legend>
        {TEMAS.map((tema) => (
          <label
            key={tema.id}
            className={`config-tema config-tema-${tema.id}`}
            data-tema={tema.id}
          >
            <input
              type="radio"
              name="tema"
              value={tema.id}
              checked={atual === tema.id}
              onChange={() => escolher(tema.id)}
            />
            <span className="config-tema-amostra" aria-hidden="true" />
            {tema.nome}
          </label>
        ))}
      </fieldset>
    </section>
  )
}
