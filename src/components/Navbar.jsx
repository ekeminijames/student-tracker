import { NavLink } from 'react-router-dom'
import Logo from './Logo'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/marks', label: 'Tests & Exams' },
  { to: '/assignments', label: 'Assignments' },
]

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-20 border-b border-white/10 bg-emi-black/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-3 sm:h-16 sm:py-0">

          {/* Brand: logo mark + institute name */}
          <div className="flex items-center gap-3 text-white whitespace-nowrap">
            <Logo />
            <span className="hidden lg:inline text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Enlightenment Mentorship Institute
            </span>
          </div>

          {/* Navigation links */}
          <div className="flex gap-1 overflow-x-auto sm:ml-auto">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                // "end" makes the Dashboard link only active on exact "/"
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
