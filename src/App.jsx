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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/marks" element={<Marks />} />
            <Route path="/assignments" element={<Assignments />} />
          </Routes>
        </main>
        <footer className="border-t border-white/10 mt-8">
          <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-400">
            <span className="font-display font-semibold uppercase tracking-wider text-slate-300">
              EMI · Built for Leadership
            </span>
            <span>Follow Us @EMI Global</span>
          </div>
        </footer>
      </div>
    </AppProvider>
  )
}
