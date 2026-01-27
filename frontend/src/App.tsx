import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LogInteractionPage from './pages/LogInteractionPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogInteractionPage />} />
        <Route path="/log-interaction" element={<LogInteractionPage />} />
      </Routes>
    </Router>
  )
}

export default App
