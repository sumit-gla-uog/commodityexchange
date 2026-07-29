import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Commodity exchange scaffold component</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App