import '../../shared/secao.css'
import Backup from './Backup'
import Sincronizacao from './Sincronizacao'
import Tema from './Tema'
import './ConfiguracoesPage.css'

/** Configurações (a engrenagem no topo): tema, sincronização e backup. */
export default function ConfiguracoesPage() {
  return (
    <div className="config-pagina">
      <h1 className="titulo-pagina">Configurações</h1>
      <p className="subtitulo-pagina">
        Escolha a cor do app, leve seus dados para outros aparelhos e guarde
        cópias de segurança.
      </p>
      <Tema />
      <Sincronizacao />
      <Backup />
    </div>
  )
}
