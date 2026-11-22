import './Tamagotchi.css'

/*
 * Bichinho virtual compacto em volta do cantinho do gatinho: um quadrado de
 * cantos bem arredondados, com aro na cor do tema, a tela no meio, três
 * botões com ícone embaixo dela (comida, brincadeira e carinho, por
 * `aoCuidar`) e uma cordinha de chaveiro. A tela é o `children`.
 */

/** Ícones dos botões, desenhados num quadrado de 16. */
const ICONES = {
  // Peixinho
  comer: (
    <path d="M2 8c2.5-3.5 6.5-4 9-1.5L14 4v8l-3-2.5C8.5 12 4.5 11.5 2 8Zm3.5-.6a.9.9 0 1 0 0 1.2.9.9 0 0 0 0-1.2Z" />
  ),
  // Novelo de lã
  brincar: (
    <path
      d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Zm-4.3 4.2c2.3-.4 4.7.2 6.6 1.9M3.4 9.6c2.6-1.3 5.8-1 8.2.9M6 2.6c1.6 1.4 2.5 3.6 2.4 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    />
  ),
  // Coração
  carinho: (
    <path d="M8 14 2.6 8.6A3.2 3.2 0 0 1 8 4.3a3.2 3.2 0 0 1 5.4 4.3Z" />
  ),
}

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
      <div className="tamagotchi-aro">
        {children}
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
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  {ICONES[acao]}
                </svg>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
