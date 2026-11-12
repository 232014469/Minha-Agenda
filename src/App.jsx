import { Navigate, Route, Routes } from 'react-router'
import AgendaPage from './features/agenda/AgendaPage'
import MateriasPage from './features/materias/MateriasPage'
import PaginaMateria from './features/materias/PaginaMateria'
import LayoutBase from './shared/layout/LayoutBase'

function App() {
  return (
    <Routes>
      <Route element={<LayoutBase />}>
        <Route index element={<Navigate to="/agenda" replace />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="materias" element={<MateriasPage />} />
        <Route path="materias/:id" element={<PaginaMateria />} />
        <Route path="*" element={<Navigate to="/agenda" replace />} />
      </Route>
    </Routes>
  )
}

export default App
