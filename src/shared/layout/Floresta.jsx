import './Floresta.css'

/** Sorteio com semente: as árvores ficam sempre no mesmo lugar. */
function sorteador(semente) {
  let valor = semente

  return () => {
    valor = (valor * 16807) % 2147483647

    return (valor - 1) / 2147483646
  }
}

const sortear = sorteador(13042026)
const num = (valor) => Math.round(valor * 10) / 10

/**
 * Troncos retos do fundo (duas fileiras: a de longe, mais clara, e a do
 * meio), cada um com dois galhos finos subindo em diagonal.
 */
function fileira(quantos, largura, cor) {
  return Array.from({ length: quantos }, (_, indice) => {
    const x = (indice + 0.2 + sortear() * 0.6) * (1200 / quantos)
    const grossura = largura * (0.7 + sortear() * 0.6)
    const inclina = (sortear() - 0.5) * 40
    const alturaGalho = 120 + sortear() * 260
    const lado = sortear() > 0.5 ? 1 : -1
    const meioGalho = x + inclina * (1 - alturaGalho / 800)

    return {
      id: indice,
      cor,
      tronco: `M${num(x - grossura / 2)} 800L${num(x + inclina - grossura / 4)} -20L${num(x + inclina + grossura / 4)} -20L${num(x + grossura / 2)} 800Z`,
      galhos: `M${num(meioGalho)} ${num(alturaGalho + 60)}q${num(lado * 30)} -50 ${num(lado * 80)} -110M${num(meioGalho)} ${num(alturaGalho + 160)}q${num(-lado * 24)} -36 ${num(-lado * 60)} -70`,
      grossuraGalho: num(grossura * 0.28),
    }
  })
}

const LONGE = fileira(16, 22, '#4b5a8c')
const MEIO = fileira(9, 34, '#262c4c')

/**
 * Faixa de névoa ondulada que se repete a cada 1200 unidades (os períodos
 * dividem 1200), para poder deslizar sem emenda.
 */
function faixa(base, altura, fase) {
  const cima = []
  const baixo = []

  for (let x = 0; x <= 2400; x += 40) {
    cima.push(
      `${x} ${num(base + 14 * Math.sin((x / 600) * 2 * Math.PI + fase))}`,
    )
    baixo.unshift(
      `${x} ${num(base + altura + 10 * Math.sin((x / 400) * 2 * Math.PI + fase * 1.7))}`,
    )
  }

  return `M${cima.join('L')}L${baixo.join('L')}Z`
}

const NEVOA = [
  { id: 1, d: faixa(30, 46, 0), tempo: 70, opacidade: 0.2 },
  { id: 2, d: faixa(62, 52, 2.1), tempo: 95, opacidade: 0.26 },
  { id: 3, d: faixa(100, 70, 4.2), tempo: 55, opacidade: 0.32 },
]

/** Árvore da frente: tronco retorcido e galhos tortos, em silhueta preta. */
const GALHOS = [
  // tronco
  { d: 'M40 820C70 700 30 600 70 500S120 360 96 280', largura: 64 },
  { d: 'M96 290C90 220 120 170 160 130', largura: 34 },
  // galho grande que cruza o alto
  { d: 'M150 140C210 110 230 150 290 110S370 60 420 74', largura: 20 },
  { d: 'M290 110C300 80 330 70 340 40', largura: 9 },
  { d: 'M380 70C400 50 396 30 420 18', largura: 6 },
  { d: 'M230 132C250 160 290 160 300 196', largura: 8 },
  { d: 'M300 196C318 210 320 230 344 236', largura: 4 },
  // galho que sobe e sai pela borda
  { d: 'M160 130C150 80 180 50 166 -10', largura: 16 },
  { d: 'M168 60C200 40 210 10 240 -6', largura: 7 },
  // galho baixo, torto, para o lado de dentro
  { d: 'M74 470C130 450 150 400 200 400S250 360 270 330', largura: 16 },
  { d: 'M200 400C230 420 250 450 290 450', largura: 6 },
  { d: 'M250 356C262 330 290 320 300 290', largura: 5 },
  // raminhos para fora
  { d: 'M70 520C40 500 20 470 -10 470', largura: 14 },
  { d: 'M90 330C60 300 40 300 10 270', largura: 10 },
  { d: 'M40 290C30 260 10 250 -10 240', largura: 5 },
]

function Arvore({ lado }) {
  return (
    <svg
      className={`floresta-arvore floresta-arvore-${lado}`}
      viewBox="0 0 420 800"
      preserveAspectRatio="xMinYMax meet"
    >
      {GALHOS.map((galho) => (
        <path
          key={galho.d}
          d={galho.d}
          strokeWidth={galho.largura}
          fill="none"
        />
      ))}
      <path
        className="floresta-raiz"
        d="M-20 800C20 770 40 740 50 700L110 760C130 780 170 790 200 800Z"
      />
    </svg>
  )
}

/**
 * Olhos no escuro: pares que piscam e somem em tempos diferentes. Os de
 * `fundo` ficam entre as árvores (atrás das páginas); os outros espiam da
 * névoa que passa por cima do pé da página.
 */
const OLHOS = [
  { id: 1, fundo: true, left: '3%', top: '34%', tamanho: 1.1, atraso: 0 },
  { id: 2, fundo: true, left: '97%', top: '48%', tamanho: 1, atraso: 2.6 },
  { id: 3, fundo: true, left: '22%', top: '7%', tamanho: 0.8, atraso: 5.1 },
  { id: 4, fundo: true, left: '58%', top: '10%', tamanho: 0.7, atraso: 7.4 },
  { id: 5, fundo: true, left: '4%', top: '70%', tamanho: 0.9, atraso: 3.8 },
  { id: 6, fundo: true, left: '96%', top: '80%', tamanho: 1.1, atraso: 6.3 },
  { id: 7, left: '8%', bottom: 46, tamanho: 1, atraso: 1.4 },
  { id: 8, left: '31%', bottom: 22, tamanho: 0.85, atraso: 4.5 },
  { id: 9, left: '56%', bottom: 58, tamanho: 0.9, atraso: 8.2 },
  { id: 10, left: '79%', bottom: 30, tamanho: 1.1, atraso: 2.9 },
  { id: 11, left: '93%', bottom: 70, tamanho: 0.8, atraso: 6.8 },
].map(({ id, fundo, left, top, bottom, tamanho, atraso }) => ({
  id,
  fundo,
  estilo: {
    left,
    top,
    bottom: bottom === undefined ? undefined : `${bottom}px`,
    '--olho-tamanho': tamanho,
    animationDelay: `${atraso}s`,
  },
}))

function Olhos({ olho }) {
  return (
    <span className="floresta-olhos" style={olho.estilo}>
      <i />
      <i />
    </span>
  )
}

function Nevoa({ className }) {
  return (
    <span className={className}>
      {NEVOA.map((faixaDeNevoa) => (
        <svg
          key={faixaDeNevoa.id}
          className="floresta-faixa"
          viewBox="0 0 2400 200"
          preserveAspectRatio="none"
          style={{
            animationDuration: `${faixaDeNevoa.tempo}s`,
            opacity: faixaDeNevoa.opacidade,
          }}
        >
          <path d={faixaDeNevoa.d} />
        </svg>
      ))}
    </span>
  )
}

/**
 * Chuva no tema Reino doce: um bosque escuro de noite. Atrás das páginas,
 * céu azul com estrelas e lua, fileiras de árvores e duas árvores retorcidas
 * nas bordas; por cima do pé da página passa uma névoa com olhos amarelos
 * espiando. Só aparece no Reino doce (ver Floresta.css). Com `saindo`, some
 * devagar (quando o encanto devolve o reino rosa).
 */
export default function Floresta({ saindo = false }) {
  return (
    <>
      <div
        className={`floresta${saindo ? ' floresta-saindo' : ''}`}
        aria-hidden="true"
      >
        <span className="floresta-estrelas" />
        <span className="floresta-lua" />
        <svg
          className="floresta-fileiras"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMax slice"
        >
          {[...LONGE, ...MEIO].map((arvore) => (
            <g
              key={`${arvore.cor}${arvore.id}`}
              fill={arvore.cor}
              stroke={arvore.cor}
            >
              <path d={arvore.tronco} />
              <path
                d={arvore.galhos}
                fill="none"
                strokeWidth={arvore.grossuraGalho}
                strokeLinecap="round"
              />
            </g>
          ))}
        </svg>
        <Nevoa className="floresta-nevoa-fundo" />
        <Arvore lado="esquerda" />
        <Arvore lado="direita" />
        {OLHOS.filter((olho) => olho.fundo).map((olho) => (
          <Olhos key={olho.id} olho={olho} />
        ))}
      </div>
      {/* Por cima das páginas, sem pegar cliques: bordas na sombra e névoa no pé */}
      <div
        className={`floresta-frente${saindo ? ' floresta-saindo' : ''}`}
        aria-hidden="true"
      >
        <Nevoa className="floresta-nevoa" />
        {OLHOS.filter((olho) => !olho.fundo).map((olho) => (
          <Olhos key={olho.id} olho={olho} />
        ))}
      </div>
    </>
  )
}
