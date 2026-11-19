import './CeuEstrelado.css'

/** Sorteio com semente: as estrelas ficam sempre no mesmo lugar. */
function sorteador(semente) {
  let valor = semente

  return () => {
    valor = (valor * 16807) % 2147483647

    return (valor - 1) / 2147483646
  }
}

function criarEstrelas() {
  const sortear = sorteador(20261119)

  return Array.from({ length: 70 }, (_, indice) => {
    // Metade fica no alto da tela, onde quase não há cards por cima.
    const noTopo = indice < 35
    const tamanho = sortear() < 0.18 ? 'grande' : sortear() < 0.5 ? 'media' : ''

    return {
      id: indice,
      tamanho,
      estilo: {
        left: `${(sortear() * 100).toFixed(2)}%`,
        top: noTopo
          ? `${Math.round(sortear() * 230)}px`
          : `${(sortear() * 100).toFixed(2)}%`,
        animationDuration: `${(2.2 + sortear() * 3.5).toFixed(2)}s`,
        animationDelay: `${(-sortear() * 5).toFixed(2)}s`,
      },
    }
  })
}

const ESTRELAS = criarEstrelas()

/**
 * Céu do modo escuro: estrelas que piscam, uma lua crescente e, de vez em
 * quando, uma estrela cadente. Fica atrás do conteúdo e só aparece no modo
 * escuro (o CSS esconde no claro).
 */
export default function CeuEstrelado() {
  return (
    <div className="ceu" aria-hidden="true">
      {ESTRELAS.map((estrela) => (
        <span
          key={estrela.id}
          className={`ceu-estrela ${estrela.tamanho}`}
          style={estrela.estilo}
        />
      ))}
      <span className="ceu-cadente" />
      <span className="ceu-lua" />
    </div>
  )
}
