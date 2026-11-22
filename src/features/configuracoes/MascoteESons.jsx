import { GATOS, urlDoSprite } from '../../shared/gatinhos/gatos'
import { mudarPreferencia, usePreferencias } from '../../shared/preferencias'

/**
 * Se há gatinho na tela, quem fica no menu, se os sons tocam, se os gatinhos
 * aparecem pela tela e se o gatinho do menu mora no bichinho virtual. Sem
 * gatinho, as opções dele ficam desligadas.
 */
export default function MascoteESons() {
  const { mascote, sons, bordoes, gatinhos, tamagotchi, gatinho } =
    usePreferencias()

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
        Gatinho na tela (desligado, ele some do menu, dos avisos e do bichinho
        virtual)
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
      <label className="config-chave-liga">
        <input
          type="checkbox"
          checked={gatinhos}
          disabled={!gatinho}
          onChange={(evento) =>
            mudarPreferencia('gatinhos', evento.target.checked)
          }
        />
        Gatinhos pela tela (passeio, comemoração e cochilo)
      </label>
      <label className="config-chave-liga">
        <input
          type="checkbox"
          checked={tamagotchi}
          disabled={!gatinho}
          onChange={(evento) =>
            mudarPreferencia('tamagotchi', evento.target.checked)
          }
        />
        Bichinho virtual no menu (moldura, botões de cuidar e o ciclo de vida do
        gatinho)
      </label>
    </section>
  )
}
