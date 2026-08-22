import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { BarterPage } from './pages/Barter/BarterPage'
import { ChatPage } from './pages/Chat/ChatPage'
import { OrdersPage } from './pages/Orders/OrdersPage'
import { EvaluationsPage } from './pages/Evaluations/EvaluationsPage'
// import { LoginPage } from './pages/LoginPage/LoginForm'
import { LandingPage } from './pages/LandingPage/LandingPage'



function App() {
  return (
  <BrowserRouter>
  <Routes>
    {/* Landing page | no sidebar */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LandingPage />} />
    <Route path="/register" element={<LandingPage />} />

    {/* App with sidebar */}
    <Route path="*" element={
      <div className="flex min-h-screen bg-gray-950 text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Commodity Exchange" />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/barter" element={<BarterPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/evals" element={<EvaluationsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Routes>
          </main>
        </div>
      </div>
    } />
  </Routes>
</BrowserRouter>
  )
}

export default App