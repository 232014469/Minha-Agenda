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
/** Faixas do arco-íris do chaveiro, de fora para dentro. */
const ARCO = [
  { raio: 7.8, cor: '#ff8fb1' },
  { raio: 6.4, cor: '#ffb86b' },
  { raio: 5, cor: '#ffd84d' },
  { raio: 3.6, cor: '#7fd892' },
  { raio: 2.2, cor: '#6cc4f5' },
]

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
        {/* No Reino doce: arco-íris com nuvenzinhas nas pontas */}
        <g className="chaveiro-arco-iris">
          <ellipse
            className="chaveiro-elo"
            cx="12"
            cy="31.6"
            rx="1.6"
            ry="2.4"
          />
          <path className="arco-contorno" d="M7 44a5 5 0 0 1 10 0" />
          {ARCO.map(({ raio, cor }) => (
            <path
              key={cor}
              d={`M${12 - raio} 44a${raio} ${raio} 0 0 1 ${raio * 2} 0`}
              stroke={cor}
              className="arco-faixa"
            />
          ))}
          {['arco-nuvem-borda', 'arco-nuvem'].map((camada) =>
            [4, 20].map((x) => (
              <g key={`${camada}${x}`} className={camada}>
                <circle cx={x - 2.4} cy="45.4" r="2.4" />
                <circle cx={x} cy="43.8" r="3" />
                <circle cx={x + 2.4} cy="45.4" r="2.4" />
                <rect x={x - 4.8} y="45" width="9.6" height="2.8" rx="1.4" />
              </g>
            )),
          )}
          <circle className="arco-bochecha" cx="18.4" cy="46" r="0.8" />
          <circle className="arco-bochecha" cx="21.6" cy="46" r="0.8" />
          <circle className="chaveiro-olho" cx="19.2" cy="44.8" r="0.5" />
          <circle className="chaveiro-olho" cx="20.8" cy="44.8" r="0.5" />
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
