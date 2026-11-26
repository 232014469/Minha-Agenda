import { useEffect, useState } from 'react'
import {
  EVENTO_TEMA_RECEBIDO,
  MODOS,
  TEMAS,
  aplicarModo,
  aplicarTema,
  lerModo,
  lerTema,
} from '../../config/tema'
import {
  FONTES,
  mudarPreferencia,
  usePreferencias,
} from '../../shared/preferencias'

/**
 * Escolha da cor e da aparência (claro ou escuro) do app, neste aparelho, e
 * se o céu do topo é animado, os cartões são de vidro líquido e o tamanho
 * do texto.
 */
export default function Tema() {
  const { ceu, vidro, fonte } = usePreferencias()
  const [atual, setAtual] = useState(lerTema)
  const [modo, setModo] = useState(lerModo)

  // Tema ou modo trocados em outro aparelho: a escolha marcada acompanha
  useEffect(() => {
    function reler() {
      setAtual(lerTema())
      setModo(lerModo())
    }

    window.addEventListener(EVENTO_TEMA_RECEBIDO, reler)

    return () => window.removeEventListener(EVENTO_TEMA_RECEBIDO, reler)
  }, [])

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
        A cor do menu, das abas e das barras de progresso, e se o app fica claro
        (com sol) ou escuro (com estrelas).
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
            {opcao.dica && (
              <span className="config-tema-dica">({opcao.dica})</span>
            )}
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
      <fieldset className="config-temas config-fontes">
        <legend>Tamanho do texto</legend>
        {FONTES.map((opcao) => (
          <label key={opcao.id} className="config-tema config-fonte">
            <input
              type="radio"
              name="fonte"
              value={opcao.id}
              checked={fonte === opcao.id}
              onChange={() => mudarPreferencia('fonte', opcao.id)}
            />
            <span
              className="config-fonte-amostra"
              style={{ fontSize: `${opcao.escala}em` }}
              aria-hidden="true"
            >
              Aa
            </span>
            {opcao.nome}
          </label>
        ))}
      </fieldset>
      <label className="config-chave-liga">
        <input
          type="checkbox"
          checked={ceu}
          onChange={(evento) => mudarPreferencia('ceu', evento.target.checked)}
        />
        Céu animado (sol, nuvens, chuva e lua; desligado, à noite ficam só as
        estrelas)
      </label>
      <label className="config-chave-liga">
        <input
          type="checkbox"
          checked={vidro}
          onChange={(evento) =>
            mudarPreferencia('vidro', evento.target.checked)
          }
        />
        Liquid glass
      </label>
    </section>
  )
}
