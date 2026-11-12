import { NavLink, Outlet } from 'react-router'
import { useDados } from '../../dados/useDados'
import Icone from './Icone'
import './LayoutBase.css'

const itens = [
  { para: '/agenda', rotulo: 'Agenda', icone: 'calendario' },
  { para: '/materias', rotulo: 'Matérias', icone: 'livro' },
]

/** Moldura das telas: menu de caderno na lateral (barra inferior no celular). */
export default function LayoutBase() {
  const { salvou } = useDados()

  return (
    <div className="layout">
      <nav className="layout-menu" aria-label="Menu principal">
        <div className="layout-marca-bloco">
          <p className="layout-marca">Minha Agenda</p>
          <p className="layout-lema">Seu semestre, no seu ritmo.</p>
        </div>

        <ul className="layout-links">
          {itens.map((item) => (
            <li key={item.para}>
              <NavLink to={item.para}>
                <Icone nome={item.icone} />
                <span>{item.rotulo}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="layout-coluna">
        {!salvou && (
          <p className="layout-aviso" role="alert">
            Não foi possível guardar os dados neste navegador. Faça um backup em
            Matérias antes de fechar a página.
          </p>
        )}
        <main className="layout-conteudo">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
