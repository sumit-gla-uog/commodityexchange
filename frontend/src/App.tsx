import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import {Sidebar} from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { BarterPage } from './pages/Barter/BarterPage'
import { ChatPage } from './pages/Chat/ChatPage'
import { OrdersPage } from './pages/Orders/OrdersPage'


function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-950 text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Commodity Exchange" />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/barter" element={<BarterPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/evals" element={<div>Evaluations  Coming Soon</div>} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App