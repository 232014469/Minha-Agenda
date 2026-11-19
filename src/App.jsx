import { Navigate, Route, Routes } from 'react-router'
import AgendaPage from './features/agenda/AgendaPage'
import InicioPage from './features/inicio/InicioPage'
import NovaMateriaPage from './features/materias/NovaMateriaPage'
import PaginaMateria from './features/materias/PaginaMateria'
import PostItPage from './features/postit/PostItPage'
import LayoutBase from './shared/layout/LayoutBase'

function App() {
  return (
    <Routes>
      <Route element={<LayoutBase />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<InicioPage />} />
        <Route path="materias" element={<Navigate to="/dashboard" replace />} />
        <Route path="materias/:id" element={<PaginaMateria />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="post-it" element={<PostItPage />} />
        <Route path="adicionar-materia" element={<NovaMateriaPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App
