import { GATOS, urlDoSprite } from '../../shared/gatinhos/gatos'
import { mudarPreferencia, usePreferencias } from '../../shared/preferencias'

/**
 * Se há gatinho na tela, quem fica no menu e se os sons tocam. Sem gatinho,
 * a escolha dele e os miados ficam desligados.
 */
export default function MascoteESons() {
  const { mascote, sons, bordoes, gatinho } = usePreferencias()

  return (
    <section
      className="secao-caixa config-secao"
      aria-labelledby="config-mascote-titulo"
    >
      <h2 id="config-mascote-titulo">Mascote e sons</h2>
      <label className="config-chave-liga">
        <input
          type="checkbox"
          checked={gatinho}
          onChange={(evento) =>
            mudarPreferencia('gatinho', evento.target.checked)
          }
        />
        Gatinho na tela (desligado, ele some e o relógio de estudo fica no lugar
        dele)
      </label>
      <fieldset className="config-mascotes" disabled={!gatinho}>
        <legend className="so-leitor">Gatinho do menu</legend>
        {GATOS.map((opcao) => (
          <label key={opcao.id} className="config-mascote" title={opcao.nome}>
            <input
              type="radio"
              name="mascote"
              value={opcao.id}
              checked={mascote === opcao.id}
              onChange={() => mudarPreferencia('mascote', opcao.id)}
            />
            <span
              className="config-mascote-gato"
              aria-hidden="true"
              style={{
                backgroundImage: `url(${urlDoSprite(opcao.id, 'idle_blink')})`,
              }}
            />
            <span className="so-leitor">{opcao.nome}</span>
          </label>
        ))}
      </fieldset>
      <label className="config-chave-liga">
        <input
          type="checkbox"
          checked={sons}
          disabled={!gatinho}
          onChange={(evento) => mudarPreferencia('sons', evento.target.checked)}
        />
        Miados ao clicar no gatinho
      </label>
      <label className="config-chave-liga">
        <input
          type="checkbox"
          checked={bordoes}
          disabled={!sons}
          onChange={(evento) =>
            mudarPreferencia('bordoes', evento.target.checked)
          }
        />
        Bordões da Wanessa Wolf (ao concluir, ao anotar falta e no alerta de
        atividade atrasada)
      </label>
    </section>
  )
}
