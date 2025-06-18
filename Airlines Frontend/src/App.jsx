import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import FlightSearch from './pages/FlightSearch'
import BookingHistory from './pages/BookingHistory'
import Profile from './pages/Profile'
import PassengerDetails from './pages/PassengerDetails'
import Payment from './pages/Payment'
import BookingConfirmation from './pages/BookingConfirmation'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />

        {/* Protected routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/booking-history" element={isAuthenticated ? <BookingHistory /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/search" element={isAuthenticated ? <FlightSearch /> : <Navigate to="/login" />} />
          <Route path="/passenger-details" element={isAuthenticated ? <PassengerDetails /> : <Navigate to="/login" />} />
          <Route path="/payment" element={isAuthenticated ? <Payment /> : <Navigate to="/login" />} />
          <Route path="/booking-confirmation" element={isAuthenticated ? <BookingConfirmation /> : <Navigate to="/login" />} />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
