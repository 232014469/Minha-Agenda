import { NavLink, Outlet } from 'react-router'
import { APP } from '../../config/app'
import { nomeDoSemestre } from '../../dados/armazenamento'
import { useDados } from '../../dados/useDados'
import Icone from './Icone'
import QuadroDaSemana from './QuadroDaSemana'
import './LayoutBase.css'

const itens = [
  { para: '/dashboard', rotulo: 'Dashboard', icone: 'inicio' },
  { para: '/agenda', rotulo: 'Agenda', icone: 'calendario' },
  { para: '/post-it', rotulo: 'Post it', icone: 'notas' },
  {
    para: '/adicionar-materia',
    rotulo: 'Adicionar matéria',
    curto: 'Adicionar',
    icone: 'mais',
  },
]

/** Moldura das telas: menu de caderno na lateral (barra inferior no celular). */
export default function LayoutBase() {
  const { salvou, semestre, semestres, escolherSemestre } = useDados()

  return (
    <div className="layout">
      <nav className="layout-menu" aria-label="Menu principal">
        <div className="layout-marca-bloco">
          <p className="layout-marca">{APP.nome}</p>
          <p className="layout-lema">{APP.lema}</p>
        </div>

        <ul className="layout-links">
          {itens.map((item) => (
            <li key={item.para}>
              <NavLink to={item.para}>
                <Icone nome={item.icone} />
                {item.curto ? (
                  <>
                    <span className="layout-so-computador">{item.rotulo}</span>
                    <span className="layout-so-celular">{item.curto}</span>
                  </>
                ) : (
                  <span>{item.rotulo}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <QuadroDaSemana />
      </nav>

      <div className="layout-coluna">
        <div className="layout-semestre">
          <label htmlFor="layout-semestre">Semestre</label>
          <select
            id="layout-semestre"
            value={semestre}
            onChange={(evento) => escolherSemestre(evento.target.value)}
          >
            {semestres.map((opcao) => (
              <option key={opcao} value={opcao}>
                {nomeDoSemestre(opcao)}
              </option>
            ))}
          </select>
        </div>
        {!salvou && (
          <p className="layout-aviso" role="alert">
            Não foi possível guardar os dados neste navegador. Faça um backup no
            Dashboard antes de fechar a página.
          </p>
        )}
        <main className="layout-conteudo">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
