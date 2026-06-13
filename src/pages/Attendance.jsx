import { useState } from 'react'
import { useApp } from '../context/AppContext'

// Returns today's date as a YYYY-MM-DD string
function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function Attendance() {
  const {
    students,
    addStudent,
    removeStudent,
    markAttendance,
    getAttendanceForDate,
    getStudentAttendance,
  } = useApp()

  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState('')
  const [selectedDate, setSelectedDate] = useState(todayISO())
  // Which student's history row is currently open
  const [expandedId, setExpandedId] = useState(null)
  // Brief "Saved" flash after bulk marking
  const [flashMsg, setFlashMsg] = useState('')

  // All attendance records that exist for the currently selected date
  const dateRecords = getAttendanceForDate(selectedDate)

  // Returns the status ('present' | 'absent' | null) for one student on the selected date
  function getStatusOnDate(studentId) {
    const record = dateRecords.find(r => r.studentId === studentId)
    return record ? record.status : null
  }

  function handleAddStudent(e) {
    e.preventDefault()
    const ok = addStudent(newName)
    if (ok) {
      setNewName('')
      setAddError('')
    } else {
      setAddError(
        newName.trim()
          ? 'A student with that name already exists.'
          : 'Please enter a name.',
      )
    }
  }

  function handleRemoveStudent(id, name) {
    if (window.confirm(`Remove "${name}" and all their records? This cannot be undone.`)) {
      removeStudent(id)
      if (expandedId === id) setExpandedId(null)
    }
  }

  // Mark every student with the same status at once
  function markAll(status) {
    students.forEach(s => markAttendance(s.id, selectedDate, status))
    showFlash(status === 'present' ? 'All marked present!' : 'All marked absent.')
  }

  function showFlash(msg) {
    setFlashMsg(msg)
    setTimeout(() => setFlashMsg(''), 2000)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-1">Attendance Tracker</h1>
      <p className="text-gray-500 mb-8">Add students and record daily attendance</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column: student management ───────────────────────────────── */}
        <div className="lg:col-span-1 space-y-5">

          {/* Add student form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Add Student</h2>
            <form onSubmit={handleAddStudent} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Full name..."
                value={newName}
                onChange={e => { setNewName(e.target.value); setAddError('') }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {addError && <p className="text-red-500 text-xs">{addError}</p>}
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Add Student
              </button>
            </form>
          </div>

          {/* Student list with overall attendance percentages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-3">
              All Students <span className="text-gray-400 font-normal text-sm">({students.length})</span>
            </h2>

            {students.length === 0 ? (
              <p className="text-gray-400 text-sm">No students added yet.</p>
            ) : (
              <ul className="space-y-2">
                {students.map(s => {
                  const att = getStudentAttendance(s.id)
                  return (
                    <li
                      key={s.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-700">{s.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {att.percentage !== null
                            ? `${att.percentage}% attendance (${att.present}/${att.total} days)`
                            : 'No records yet'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(s.id, s.name)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none ml-2 flex-shrink-0"
                        title="Remove student"
                      >
                        ×
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* ── Right column: mark attendance + history ────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Mark attendance for a specific date */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h2 className="font-semibold text-gray-700">Mark Attendance</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {students.length === 0 ? (
              <p className="text-gray-400 text-sm">Add students first to mark attendance.</p>
            ) : (
              <>
                {/* Bulk actions */}
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => markAll('present')}
                    className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg font-medium transition"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => markAll('absent')}
                    className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg font-medium transition"
                  >
                    Mark All Absent
                  </button>
                  {/* Flash confirmation */}
                  {flashMsg && (
                    <span className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                      {flashMsg}
                    </span>
                  )}
                </div>

                {/* Per-student present / absent buttons */}
                <div className="space-y-2">
                  {students.map(student => {
                    const status = getStatusOnDate(student.id)
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          {/* Coloured dot shows current status */}
                          <span
                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                              status === 'present'
                                ? 'bg-green-500'
                                : status === 'absent'
                                ? 'bg-red-500'
                                : 'bg-gray-300'
                            }`}
                          />
                          <span className="text-sm font-medium text-gray-700">{student.name}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => markAttendance(student.id, selectedDate, 'present')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              status === 'present'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-green-100 hover:text-green-700'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(student.id, selectedDate, 'absent')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              status === 'absent'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-700'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Attendance history per student (accordion) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Attendance History</h2>

            {students.length === 0 ? (
              <p className="text-gray-400 text-sm">No students to show.</p>
            ) : (
              <div className="space-y-2">
                {students.map(student => {
                  const att = getStudentAttendance(student.id)
                  const isOpen = expandedId === student.id

                  return (
                    <div
                      key={student.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Header row – click to toggle */}
                      <button
                        onClick={() => setExpandedId(isOpen ? null : student.id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm font-medium text-gray-700">{student.name}</span>

                          {/* Attendance percentage badge */}
                          {att.percentage !== null && (
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                att.percentage >= 75
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {att.percentage}%
                            </span>
                          )}

                          <span className="text-xs text-gray-400">
                            {att.present} present / {att.total - att.present} absent
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs ml-2">{isOpen ? '−' : '+'}</span>
                      </button>

                      {/* Expanded: list every date record */}
                      {isOpen && (
                        <div className="px-4 py-3 bg-white">
                          {att.records.length === 0 ? (
                            <p className="text-gray-400 text-sm">No records yet.</p>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {/* Sort newest dates first */}
                              {[...att.records]
                                .sort((a, b) => b.date.localeCompare(a.date))
                                .map(record => (
                                  <div
                                    key={record.id}
                                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${
                                      record.status === 'present'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-red-50 text-red-700'
                                    }`}
                                  >
                                    <span>{record.date}</span>
                                    <span className="font-semibold capitalize ml-2">
                                      {record.status}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
