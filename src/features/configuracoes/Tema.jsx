import { useState } from 'react'
import {
  MODOS,
  TEMAS,
  aplicarModo,
  aplicarTema,
  lerModo,
  lerTema,
} from '../../config/tema'

/** Escolha da cor e da aparência (claro ou escuro) do app, neste aparelho. */
export default function Tema() {
  const [atual, setAtual] = useState(lerTema)
  const [modo, setModo] = useState(lerModo)

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
        A cor do menu, das abas, das barras de progresso e das manchas do topo,
        e se o app fica claro ou escuro.
      </p>
      <fieldset className="config-temas">
        <legend className="so-leitor">Aparência</legend>
        {MODOS.map((opcao) => (
          <label key={opcao.id} className="config-tema">
            <input
              type="radio"
              name="modo"
              value={opcao.id}
              checked={modo === opcao.id}
              onChange={() => setModo(aplicarModo(opcao.id))}
            />
            <span aria-hidden="true">{opcao.icone}</span>
            {opcao.nome}
          </label>
        ))}
      </fieldset>
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
