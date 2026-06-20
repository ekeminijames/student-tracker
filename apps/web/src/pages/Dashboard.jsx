import { Link } from 'react-router-dom'
import { useApp, getGrade, getGradeColor } from '../context/AppContext'

export default function Dashboard() {
  const {
    students,
    getStudentAttendance,
    getStudentTestAverage,
    getStudentSubmissionStats,
  } = useApp()

  // Build a summary row for every student so we can render the table and compute stats
  const rows = students.map(student => {
    const att = getStudentAttendance(student.id)
    const avgPct = getStudentTestAverage(student.id)  // 0-100 or null
    const subs = getStudentSubmissionStats(student.id)

    // "At risk" means attendance below 75% OR average test mark below 50%
    const lowAttendance = att.percentage !== null && att.percentage < 75
    const failing = avgPct !== null && avgPct < 50
    const atRisk = lowAttendance || failing

    return { student, att, avgPct, subs, atRisk, lowAttendance, failing }
  })

  const atRiskCount = rows.filter(r => r.atRisk).length
  const performingWellCount = rows.filter(r => {
    return r.att.percentage !== null && r.att.percentage >= 90 &&
      (r.avgPct === null || r.avgPct >= 75)
  }).length

  // ── Empty state ────────────────────────────────────────────────────────────

  if (students.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="emi-title text-2xl mb-2">No Students Yet</h2>
        <p className="text-slate-400 mb-6">
          Start by adding students in the Attendance section.
        </p>
        <Link
          to="/attendance"
          className="inline-block bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-200 transition"
        >
          Go to Attendance
        </Link>
      </div>
    )
  }

  // ── Main dashboard ─────────────────────────────────────────────────────────

  return (
    <div>
      <h1 className="emi-title text-3xl md:text-4xl mb-1">Dashboard</h1>
      <p className="text-slate-400 mb-8">Overview of all students at a glance</p>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard color="indigo" value={students.length} label="Total Students" />
        <StatCard color="red" value={atRiskCount} label="At Risk" />
        <StatCard color="green" value={performingWellCount} label="Performing Well" />
      </div>

      {/* Student overview table */}
      <div className="emi-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="text-left px-6 py-3 font-semibold text-slate-300">Student</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-300">Attendance</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-300">Avg Mark</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-300">Assignments</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-300">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map(({ student, att, avgPct, subs, atRisk, lowAttendance, failing }) => (
              <tr key={student.id} className={atRisk ? 'bg-red-500/10' : ''}>

                {/* Name with avatar initial */}
                <td className="px-6 py-4 font-medium text-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {student.name[0].toUpperCase()}
                    </div>
                    {student.name}
                  </div>
                </td>

                {/* Attendance percentage */}
                <td className="px-4 py-4 text-center">
                  {att.percentage !== null ? (
                    <span className={`font-semibold ${lowAttendance ? 'text-red-600' : 'text-green-600'}`}>
                      {att.percentage}%
                    </span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>

                {/* Average test/exam mark */}
                <td className="px-4 py-4 text-center">
                  {avgPct !== null ? (
                    <span className={`font-semibold ${failing ? 'text-red-600' : 'text-green-600'}`}>
                      {avgPct}%{' '}
                      <span className={`${getGradeColor(getGrade(avgPct, 100))}`}>
                        ({getGrade(avgPct, 100)})
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>

                {/* Assignments submitted out of total */}
                <td className="px-4 py-4 text-center">
                  {subs.total > 0 ? (
                    <span className="text-slate-200">
                      {subs.submitted}
                      <span className="text-slate-500">/{subs.total}</span>
                    </span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>

                {/* Risk badge */}
                <td className="px-4 py-4 text-center">
                  {atRisk ? (
                    <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                      At Risk
                    </span>
                  ) : att.percentage !== null || avgPct !== null ? (
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                      On Track
                    </span>
                  ) : (
                    <span className="inline-block bg-white/10 text-slate-400 text-xs font-semibold px-2 py-1 rounded-full">
                      No Data
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Risk criteria explanation */}
      <div className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <strong>At Risk Criteria:</strong> Attendance below 75% OR average test/exam mark below 50%.
      </div>
    </div>
  )
}

// ── Small reusable stat card ─────────────────────────────────────────────────

function StatCard({ color, value, label }) {
  const styles = {
    indigo: 'bg-white/5 border-white/10 text-slate-50',
    red: 'bg-red-500/10 border-red-500/20 text-red-300',
    green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  }
  const labelStyles = {
    indigo: 'text-slate-400',
    red: 'text-red-300',
    green: 'text-emerald-300',
  }

  return (
    <div className={`border rounded-xl p-5 ${styles[color]}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className={`text-sm mt-1 font-medium ${labelStyles[color]}`}>{label}</div>
    </div>
  )
}
