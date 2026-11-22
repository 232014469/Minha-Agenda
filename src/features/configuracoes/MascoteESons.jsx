import { GATOS, urlDoSprite } from '../../shared/gatinhos/gatos'
import { mudarPreferencia, usePreferencias } from '../../shared/preferencias'

const OPCOES_DO_CANTINHO = [
  { id: 'gatinho', nome: 'Gatinho', dica: 'bichinho virtual para cuidar' },
  {
    id: 'relogio',
    nome: 'Relógio de estudo',
    dica: '25 min de foco, 5 de pausa',
  },
  { id: 'hoje', nome: 'Hoje', dica: 'a data e a próxima entrega' },
  { id: 'lembrete', nome: 'Lembrete', dica: 'um bilhetinho para escrever' },
]

/**
 * O que fica no alto do menu (gatinho, relógio de estudo, "Hoje" ou
 * lembrete), qual
 * gatinho e se os sons tocam. Sem o gatinho, a escolha dele e os miados
 * ficam desligados.
 */
export default function MascoteESons() {
  const { mascote, sons, bordoes, cantinho } = usePreferencias()
  const gatinho = cantinho === 'gatinho'

  return (
    <section
      className="secao-caixa config-secao"
      aria-labelledby="config-mascote-titulo"
    >
      <h2 id="config-mascote-titulo">Mascote e sons</h2>
      <fieldset className="config-cantinho">
        <legend>No alto do menu</legend>
        {OPCOES_DO_CANTINHO.map((opcao) => (
          <label key={opcao.id} className="config-cantinho-opcao">
            <input
              type="radio"
              name="cantinho"
              value={opcao.id}
              checked={cantinho === opcao.id}
              onChange={() => mudarPreferencia('cantinho', opcao.id)}
            />
            <span>
              <strong>{opcao.nome}</strong> <small>{opcao.dica}</small>
            </span>
          </label>
        ))}
      </fieldset>
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
