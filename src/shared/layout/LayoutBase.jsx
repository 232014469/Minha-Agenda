import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { APP } from '../../config/app'
import { nomeDoSemestre } from '../../dados/armazenamento'
import { useDados } from '../../dados/useDados'
import { useBichinho } from '../gatinhos/useBichinho'
import ConfiguracoesPage from '../../features/configuracoes/ConfiguracoesPage'
import { usePreferencias } from '../preferencias'
import { useTelaPequena } from '../useTelaPequena'
import Icone from './Icone'
import AlertaPodeNao from './AlertaPodeNao'
import { temAtrasadas } from './alerta'
import CeuDoDia from './CeuDoDia'
import CeuEstrelado from './CeuEstrelado'
import Mascote from './Mascote'
import QuadroDaSemana from './QuadroDaSemana'
import RastroDeBrilho from './RastroDeBrilho'
import Tutorial from './Tutorial'
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
  const {
    salvou,
    semestre,
    semestres,
    escolherSemestre,
    tarefas,
    materias,
    todos,
  } = useDados()
  // Dia de chuva (atividade atrasada): o gatinho dorme na casinha
  const chuva = temAtrasadas(tarefas)
  const [configAberta, setConfigAberta] = useState(false)
  // No celular o menu vira a barra de baixo: o gatinho vai para cima do
  // título da tela. Só um gatinho existe por vez (miados não se repetem).
  const celular = useTelaPequena()
  // Atrasos e faltas deixam o gatinho chateado; tudo em dia, jardim
  // florido. No computador ele vive num bichinho virtual (ver useBichinho)
  // (dá para desligar nas Configurações).
  const { tamagotchi, gatinho } = usePreferencias()
  // Sem gatinho na tela, o bichinho também para (os dias não contam)
  const comBichinho = !celular && tamagotchi && gatinho
  const bichinho = useBichinho({
    tarefas,
    materias,
    ativo: tamagotchi && gatinho,
    comBotoes: !celular,
  })
  const cantoRef = useRef(null)
  const linksRef = useRef(null)
  const { pathname } = useLocation()

  // O destaque do menu corre até a tela escolhida (como as vistas da
  // Agenda): posicionado direto no elemento, medindo o link ativo
  useLayoutEffect(() => {
    const lista = linksRef.current

    if (!lista) return undefined

    function posicionar() {
      const marcador = lista.querySelector('.layout-links-marcador')
      const ativo = lista.querySelector('a.active')

      if (!marcador) return
      if (!ativo) {
        marcador.style.opacity = '0'
        return
      }

      const base = lista.getBoundingClientRect()
      const caixa = ativo.getBoundingClientRect()

      marcador.style.opacity = '1'
      marcador.style.transform = `translate(${caixa.left - base.left}px, ${
        caixa.top - base.top
      }px)`
      marcador.style.width = `${caixa.width}px`
      marcador.style.height = `${caixa.height}px`
      // Só anima depois de já estar no lugar (não corre ao abrir o site)
      requestAnimationFrame(() => lista.classList.add('pronto'))
    }

    posicionar()

    if (typeof ResizeObserver === 'undefined') return undefined

    const observador = new ResizeObserver(posicionar)

    observador.observe(lista)

    return () => observador.disconnect()
  }, [pathname])
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
          {!celular && gatinho && (
            <Mascote
              noMenu
              chuva={chuva}
              felicidade={bichinho.felicidade}
              bichinho={comBichinho ? bichinho : null}
            />
          )}
        </div>

        <ul className="layout-links" ref={linksRef}>
          <li className="layout-links-marcador" aria-hidden="true" />
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
        <CeuEstrelado />
        <CeuDoDia />
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
          {celular && gatinho && (
            <div className="layout-mascote-celular">
              <Mascote />
            </div>
          )}
          <Outlet />
        </main>
        <AlertaPodeNao />
        <RastroDeBrilho />
        {/* Primeiro acesso (nada cadastrado ainda): o tour pelo site */}
        <Tutorial
          primeiroAcesso={
            todos.materias.length === 0 && todos.tarefas.length === 0
          }
        />
      </div>
    </div>
  )
}
