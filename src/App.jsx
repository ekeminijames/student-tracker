import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import Marks from './pages/Marks'
import Assignments from './pages/Assignments'

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/marks" element={<Marks />} />
            <Route path="/assignments" element={<Assignments />} />
          </Routes>
        </main>
      </div>
    </AppProvider>
  )
}
