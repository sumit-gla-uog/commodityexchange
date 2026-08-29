import './App.css'
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
import { RequireAuth } from './auth/RequireAuth'




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
          <div className="app-shell">
  <Sidebar />
  <div className="app-main-column">
    <Header title="Commodity Exchange" />
    <main className="app-content">
      <Routes>
        //         {/* //uncomment during development */}
          //         {/* <Route path="/dashboard" element={<DashboardPage />} />
          //     <Route path="/barter" element={<BarterPage />} />
          //     <Route path="/chat" element={<ChatPage />} />
          //     <Route path="/evals" element={<EvaluationsPage />} />
          //     <Route path="/orders" element={<OrdersPage />} /> */}
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/barter" element={<RequireAuth><BarterPage /></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />
        <Route path="/evals" element={<RequireAuth><EvaluationsPage /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
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