import './Tamagotchi.css'

/*
 * Bichinho virtual compacto em volta do cantinho do gatinho: um quadrado de
 * cantos bem arredondados, com aro na cor do tema, a tela no meio, três
 * botões na lateral direita (comida, brincadeira e carinho, por
 * `aoCuidar`) e uma cordinha de chaveiro. A tela é o `children`.
 */

/** Os três botões: comida, brincadeira e carinho (ver useBichinho). */
const BOTOES = [
  { acao: 'comer', rotulo: 'Dar comida' },
  { acao: 'brincar', rotulo: 'Brincar' },
  { acao: 'carinho', rotulo: 'Fazer carinho' },
]

export default function Tamagotchi({ children, fase, comFome, aoCuidar }) {
  // Na caixinha e virando estrelinha não tem como cuidar
  const parado = !aoCuidar || fase === 'caixa' || fase === 'estrelinha'

  return (
    <div className="tamagotchi">
      <span className="tamagotchi-cordinha" aria-hidden="true" />
      <div className="tamagotchi-aro">{children}</div>
      <div
        className="tamagotchi-botoes"
        role="group"
        aria-label="Cuidar do gatinho"
      >
        {BOTOES.map(({ acao, rotulo }) => {
          const fome = acao === 'comer' && comFome && !parado

          return (
            <button
              key={acao}
              type="button"
              className={fome ? 'tamagotchi-botao-pede' : undefined}
              aria-label={fome ? `${rotulo} (ele está com fome!)` : rotulo}
              title={fome ? `${rotulo}: ele está com fome!` : rotulo}
              disabled={parado}
              onClick={() => aoCuidar(acao)}
            />
          )
        })}
      </div>
    </div>
  )
}
