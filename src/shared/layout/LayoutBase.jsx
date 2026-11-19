import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { APP } from '../../config/app'
import { nomeDoSemestre } from '../../dados/armazenamento'
import { useDados } from '../../dados/useDados'
import ConfiguracoesPage from '../../features/configuracoes/ConfiguracoesPage'
import { useTelaPequena } from '../useTelaPequena'
import Icone from './Icone'
import GatinhosNaTela from '../gatinhos/GatinhosNaTela'
import Mascote from './Mascote'
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
  const [configAberta, setConfigAberta] = useState(false)
  // No celular o menu vira a barra de baixo: o gatinho vai para cima do
  // título da tela. Só um gatinho existe por vez (miados não se repetem).
  const celular = useTelaPequena()
  const cantoRef = useRef(null)
  const fecharConfig = useCallback(() => setConfigAberta(false), [])

  // Fecha o painel ao clicar fora dele (e fora da engrenagem).
  useEffect(() => {
    if (!configAberta) return undefined

    function clique(evento) {
      if (!cantoRef.current?.contains(evento.target)) setConfigAberta(false)
    }

    document.addEventListener('mousedown', clique)

    return () => document.removeEventListener('mousedown', clique)
  }, [configAberta])

  return (
    <div className="layout">
      <nav className="layout-menu" aria-label="Menu principal">
        <div className="layout-marca-bloco">
          <p className="layout-marca">{APP.nome}</p>
          {!celular && <Mascote />}
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
        <div className="layout-semestre" ref={cantoRef}>
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
          <button
            type="button"
            className={`layout-config${configAberta ? ' active' : ''}`}
            aria-label="Configurações"
            aria-expanded={configAberta}
            aria-controls="config-painel"
            title="Configurações"
            onClick={() => setConfigAberta((aberta) => !aberta)}
          >
            <Icone nome="engrenagem" />
          </button>
          {configAberta && <ConfiguracoesPage aoFechar={fecharConfig} />}
        </div>
        {!salvou && (
          <p className="layout-aviso" role="alert">
            Não foi possível guardar os dados neste navegador. Faça um backup
            nas Configurações (engrenagem no topo) antes de fechar a página.
          </p>
        )}
        <main className="layout-conteudo">
          {celular && (
            <div className="layout-mascote-celular">
              <Mascote />
            </div>
          )}
          <Outlet />
        </main>
        <GatinhosNaTela />
      </div>
    </div>
  )
}
