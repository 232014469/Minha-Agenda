import { GATOS, urlDoSprite } from '../../shared/gatinhos/gatos'
import { mudarPreferencia, usePreferencias } from '../../shared/preferencias'

/** Quem fica no menu, se os sons tocam e se os gatinhos aparecem pela tela. */
export default function MascoteESons() {
  const { mascote, sons, bordoes, gatinhos } = usePreferencias()

  return (
    <section
      className="secao-caixa config-secao"
      aria-labelledby="config-mascote-titulo"
    >
      <h2 id="config-mascote-titulo">Mascote e sons</h2>
      <fieldset className="config-mascotes">
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
      <label className="config-chave-liga">
        <input
          type="checkbox"
          checked={gatinhos}
          onChange={(evento) =>
            mudarPreferencia('gatinhos', evento.target.checked)
          }
        />
        Gatinhos pela tela (passeio, comemoração e cochilo)
      </label>
    </section>
  )
}
