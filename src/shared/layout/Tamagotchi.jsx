import './Tamagotchi.css'

/*
 * Bichinho virtual compacto em volta do cantinho do gatinho: um quadrado de
 * cantos bem arredondados, com aro na cor do tema, a tela no meio, três
 * botões com ícone embaixo dela (comida, brincadeira e carinho, por
 * `aoCuidar`) e um chaveiro de peixinho balançando no canto. A tela é o
 * `children`.
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

/** Chaveiro no canto de baixo: argola, correntinha e um peixinho. */
function Chaveiro() {
  return (
    <svg
      className="tamagotchi-chaveiro"
      viewBox="0 0 36 60"
      aria-hidden="true"
      focusable="false"
    >
      {/* Argola */}
      <circle className="chaveiro-argola" cx="12" cy="10" r="7.5" />
      <path className="chaveiro-brilho" d="M7 6.5a6 6 0 0 1 5-2.5" />
      {/* Correntinha */}
      <g className="chaveiro-penduricalho">
        <ellipse className="chaveiro-elo" cx="12" cy="20.5" rx="2" ry="3" />
        <ellipse className="chaveiro-elo" cx="12" cy="26" rx="2" ry="3" />
        {/* Peixinho de cabeça para baixo, preso pelo rabo */}
        <g className="chaveiro-de-peixe">
          <path
            className="chaveiro-peixe"
            d="M12 29.5 7.5 33.5l2.4 2.2C6.8 39 6.6 45.5 9.4 50.5c1 1.8 2.2 3 2.6 3.3.4-.3 1.6-1.5 2.6-3.3 2.8-5 2.6-11.5-.5-14.8l2.4-2.2Z"
          />
          <path className="chaveiro-escama" d="M9.8 42.5c1.4.9 3 .9 4.4 0" />
          <circle className="chaveiro-olho" cx="10.6" cy="48" r="1" />
          <circle className="chaveiro-olho" cx="13.4" cy="48" r="1" />
        </g>
        {/* No Reino doce: unicórnio de perfil, de crina rosa comprida,
            preso pelo chifre */}
        <g className="chaveiro-unicornio">
          <path
            className="unicornio-crina"
            d="M11.6 37.4C15.5 35.8 20.2 37.6 21.4 42c1.2 4-.2 7 1.8 10.4.8 1.4 1.2 3.2.2 4.6-2.8-1-4.4-3.6-4.8-6.6-.4-4-.2-7.8-3-10.2-1.2-1-2.6-1.8-4-2.8Z"
          />
          <path
            className="unicornio-mecha"
            d="M14.6 38.2c3.4.2 5.2 3.4 5.2 6.8 0 3.6.6 6.6 2.6 9.4-2.8-1.6-4.2-4.8-4.4-8-.2-3.4-.6-6.2-3.4-8.2Z"
          />
          <path
            className="unicornio-rosto"
            d="M10 38.5c-3 1-4.5 3.5-5.4 6-1.2 1.1-1.4 3.1-.2 4.3 1.2 1.2 3.2 1.4 5.2.8 1.2-.3 1.8.4 1.6 1.9l-.6 5h8.9c-1.5-4.5-1-10.5-2.5-15-1.2-2.7-4.2-3.9-7-3Z"
          />
          <path className="unicornio-orelha" d="m13.4 39.4 1.3-4.2 1.6 4.4Z" />
          <path className="unicornio-chifre" d="m13.2 29.8 1.1 7.4-3.2.4Z" />
          <path
            className="unicornio-espiral"
            d="m12.2 34.2 1.8-.6m-2.4 2.4 2.6-.8m-1.4-3.4 1-.4"
          />
          <path
            className="unicornio-topete"
            d="M9.6 38.4C7.8 39.2 6.6 41 5.8 42.8c2.8-1.4 5-1.6 7.2-1 .4-1.2-.6-2.6-1.6-3.2-.6-.3-1.2-.3-1.8-.2Z"
          />
          <path
            className="unicornio-olho"
            d="M8 44.2q1.4 1.1 2.8 0m-2.2.6-.3.8m1.1-.6v.9m.8-1.1.4.8"
          />
          <circle className="unicornio-bochecha" cx="9.4" cy="47.3" r="1" />
          <path className="unicornio-olho" d="M5.8 49.1q1.4.6 2.8.1" />
          <circle className="chaveiro-olho" cx="4.7" cy="47" r="0.45" />
        </g>
      </g>
    </svg>
  )
}

export default function Tamagotchi({ children, fase, comFome, aoCuidar }) {
  // Na caixinha e virando estrelinha não tem como cuidar
  const parado = !aoCuidar || fase === 'caixa' || fase === 'estrelinha'

  return (
    <div className="tamagotchi">
      <Chaveiro />
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
