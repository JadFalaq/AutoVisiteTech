import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Reservation from './pages/Reservation'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MesReservations from './pages/MesReservations'
import AdminDashboard from './pages/AdminDashboard'
import AdminReservations from './pages/AdminReservations'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mes-reservations" element={<MesReservations />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
