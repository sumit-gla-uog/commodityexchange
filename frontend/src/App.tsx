import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import {Sidebar} from './src/components/layout/Sidebar'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-950 text-white">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<div>Dashboard Coming Soon</div>} />
            <Route path="/barter" element={<div>Barter Coming Soon</div>} />
            <Route path="/chat" element={<div>Chat Coming Soon</div>} />
            <Route path="/evals" element={<div>Evaluations  Coming Soon</div>} />
            <Route path="/orders" element={<div>Orders Coming Soon</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App