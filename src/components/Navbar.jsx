import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/marks', label: 'Tests & Exams' },
  { to: '/assignments', label: 'Assignments' },
]

export default function Navbar() {
  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-3 sm:h-16 sm:py-0">
          {/* App title */}
          <div className="font-bold text-base sm:text-lg tracking-wide whitespace-nowrap">
            The Enlightenment Mentorship Institute
          </div>

          {/* Navigation links */}
          <div className="flex gap-1 overflow-x-auto">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                // "end" makes the Dashboard link only active on exact "/"
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-indigo-700'
                      : 'text-indigo-100 hover:bg-indigo-600'
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
