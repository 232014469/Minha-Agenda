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
        {/* No Reino doce: cabecinha de unicórnio, presa pelo chifre */}
        <g className="chaveiro-unicornio">
          <circle
            className="unicornio-crina"
            cx="5.2"
            cy="40.5"
            r="2.7"
            fill="#ff8fb1"
          />
          <circle
            className="unicornio-crina"
            cx="4.2"
            cy="45"
            r="2.5"
            fill="#ffd84d"
          />
          <circle
            className="unicornio-crina"
            cx="4.9"
            cy="49.4"
            r="2.3"
            fill="#6cc4f5"
          />
          <circle
            className="unicornio-crina"
            cx="18.8"
            cy="40.5"
            r="2.7"
            fill="#b48cff"
          />
          <circle
            className="unicornio-crina"
            cx="19.8"
            cy="45"
            r="2.5"
            fill="#7fd892"
          />
          <circle
            className="unicornio-crina"
            cx="19.1"
            cy="49.4"
            r="2.3"
            fill="#ff8fb1"
          />
          <path className="unicornio-orelha" d="M6.6 41.5 7.2 36.4l3.6 3.4Z" />
          <path
            className="unicornio-orelha"
            d="M17.4 41.5 16.8 36.4l-3.6 3.4Z"
          />
          <path className="unicornio-chifre" d="M12 29.6 14.3 38.6H9.7Z" />
          <path
            className="unicornio-espiral"
            d="M10.7 35.6l2.4-1.3M10.2 37.5l3.5-1.6"
          />
          <ellipse
            className="unicornio-rosto"
            cx="12"
            cy="46"
            rx="7.2"
            ry="6.8"
          />
          <ellipse
            className="unicornio-focinho"
            cx="12"
            cy="50.4"
            rx="4.6"
            ry="2.8"
          />
          <path
            className="unicornio-olho"
            d="M8.2 45.2q1.2 1.2 2.4 0M13.4 45.2q1.2 1.2 2.4 0"
          />
          <circle className="unicornio-bochecha" cx="7.6" cy="48" r="1.1" />
          <circle className="unicornio-bochecha" cx="16.4" cy="48" r="1.1" />
          <circle className="chaveiro-olho" cx="10.6" cy="50.4" r="0.55" />
          <circle className="chaveiro-olho" cx="13.4" cy="50.4" r="0.55" />
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
