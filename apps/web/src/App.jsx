import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/useAuth'
import { isSupabaseConfigured } from './lib/supabase'
import ProtectedRoute from './auth/ProtectedRoute'
import Login from './pages/Login'
import SetupNotice from './pages/SetupNotice'
import StudentDashboard from './pages/dashboards/StudentDashboard'
import MentorDashboard from './pages/dashboards/MentorDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'

// Sends each signed-in user to the dashboard for their role.
function RoleHome() {
  const { role } = useAuth()
  if (role === 'mentor') return <MentorDashboard />
  if (role === 'admin' || role === 'superadmin') return <AdminDashboard />
  // Default (including 'student' or a missing role claim) -> student view.
  return <StudentDashboard />
}

function AppRoutes() {
  // Before the backend is connected, every path shows the setup notice.
  if (!isSupabaseConfigured) {
    return (
      <Routes>
        <Route path="*" element={<SetupNotice />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleHome />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
