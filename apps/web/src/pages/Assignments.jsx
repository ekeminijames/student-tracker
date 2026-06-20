import { useState } from 'react'
import { useApp, getGrade, getGradeColor } from '../context/AppContext'

// Tailwind classes for each submission status
const STATUS_STYLE = {
  submitted: {
    row: 'bg-emerald-500/10 border-emerald-500/30',
    btn: 'bg-green-500 text-white border-green-500',
    badge: 'bg-green-100 text-green-700',
  },
  late: {
    row: 'bg-yellow-500/10 border-yellow-500/30',
    btn: 'bg-yellow-500 text-white border-yellow-500',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  missing: {
    row: 'bg-red-500/10 border-red-500/30',
    btn: 'bg-red-500 text-white border-red-500',
    badge: 'bg-red-100 text-red-700',
  },
}

export default function Assignments() {
  const {
    students,
    assignments,
    addAssignment,
    removeAssignment,
    setSubmission,
    getSubmission,
  } = useApp()

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    dueDate: new Date().toISOString().split('T')[0],
    totalMarks: '',
  })
  const [formError, setFormError] = useState('')

  // ── Submission entry state ─────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState(null)
  // Local draft: { [studentId]: { status: string, score: string } }
  const [draft, setDraft] = useState({})
  const [saved, setSaved] = useState(false)

  // Load existing submission data into draft inputs when an assignment is selected
  function selectAssignment(id) {
    setSelectedId(id)
    setSaved(false)
    const loaded = {}
    students.forEach(s => {
      const sub = getSubmission(id, s.id)
      loaded[s.id] = sub
        ? { status: sub.status, score: sub.score !== null ? String(sub.score) : '' }
        : { status: '', score: '' }
    })
    setDraft(loaded)
  }

  function handleAddAssignment(e) {
    e.preventDefault()
    if (!form.name.trim()) { setFormError('Please enter an assignment name.'); return }
    if (!form.totalMarks || Number(form.totalMarks) <= 0) {
      setFormError('Please enter valid total marks.')
      return
    }
    addAssignment(form.name.trim(), form.dueDate, Number(form.totalMarks))
    setForm(f => ({ ...f, name: '', totalMarks: '' }))
    setFormError('')
  }

  function handleDeleteAssignment(id) {
    if (!window.confirm('Delete this assignment and all submission records?')) return
    removeAssignment(id)
    if (selectedId === id) {
      setSelectedId(null)
      setDraft({})
    }
  }

  // Update one student's status in the draft
  function setStatus(studentId, status) {
    setDraft(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        // Clear score when marking as missing
        score: status === 'missing' ? '' : prev[studentId]?.score ?? '',
      },
    }))
  }

  // Update one student's score in the draft
  function setScore(studentId, score) {
    setDraft(prev => ({ ...prev, [studentId]: { ...prev[studentId], score } }))
  }

  // Persist all draft entries to context / localStorage
  function handleSave() {
    if (!selectedId) return
    let didSave = false
    for (const [studentId, data] of Object.entries(draft)) {
      if (!data.status) continue
      setSubmission(selectedId, studentId, data.status, data.score)
      didSave = true
    }
    if (didSave) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const selectedAssignment = assignments.find(a => a.id === selectedId)

  // Compute submission counts for the currently selected assignment
  function getSummary() {
    if (!selectedId || students.length === 0) return null
    let submitted = 0, late = 0, missing = 0, none = 0
    students.forEach(s => {
      const sub = getSubmission(selectedId, s.id)
      if (!sub) { none++; return }
      if (sub.status === 'submitted') submitted++
      else if (sub.status === 'late') late++
      else if (sub.status === 'missing') missing++
    })
    return { submitted, late, missing, none, total: students.length }
  }

  const summary = getSummary()

  return (
    <div>
      <h1 className="emi-title text-3xl md:text-4xl mb-1">Assignments</h1>
      <p className="text-slate-400 mb-8">Track assignment submissions and scores</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column ────────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-5">

          {/* Add assignment form */}
          <div className="emi-card p-5">
            <h2 className="font-semibold text-slate-200 mb-4">Add Assignment</h2>
            <form onSubmit={handleAddAssignment} className="space-y-3">

              <div>
                <label className="text-xs font-medium text-slate-400">Assignment Name</label>
                <input
                  type="text"
                  placeholder="e.g. Essay #1"
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormError('') }}
                  className="mt-1 w-full border border-white/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="mt-1 w-full border border-white/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400">Total Marks</label>
                <input
                  type="number"
                  placeholder="50"
                  min="1"
                  value={form.totalMarks}
                  onChange={e => setForm(f => ({ ...f, totalMarks: e.target.value }))}
                  className="mt-1 w-full border border-white/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              {formError && <p className="text-red-500 text-xs">{formError}</p>}

              <button
                type="submit"
                className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
              >
                Add Assignment
              </button>
            </form>
          </div>

          {/* Assignment list */}
          <div className="emi-card p-5">
            <h2 className="font-semibold text-slate-200 mb-4">
              Assignments <span className="text-slate-500 font-normal text-sm">({assignments.length})</span>
            </h2>

            {assignments.length === 0 ? (
              <p className="text-slate-500 text-sm">No assignments yet.</p>
            ) : (
              <div className="space-y-2">
                {[...assignments].sort((a, b) => b.dueDate.localeCompare(a.dueDate)).map(a => {
                  // Count how many students have submitted or submitted late for this assignment
                  const submittedCount = students.filter(s => {
                    const sub = getSubmission(a.id, s.id)
                    return sub && (sub.status === 'submitted' || sub.status === 'late')
                  }).length

                  return (
                    <div
                      key={a.id}
                      onClick={() => selectAssignment(a.id)}
                      className={`cursor-pointer rounded-lg px-4 py-3 border transition ${
                        selectedId === a.id
                          ? 'border-white/40 bg-white/10'
                          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium text-slate-100">{a.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Due: {a.dueDate} · {a.totalMarks} marks
                          </div>
                          <div className="text-xs text-slate-500">
                            {submittedCount}/{students.length} submitted
                          </div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteAssignment(a.id) }}
                          className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0"
                          title="Delete assignment"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column: submission entry ─────────────────────────────────── */}
        <div className="lg:col-span-2">
          {!selectedAssignment ? (
            <div className="emi-card p-10 text-center h-48 flex flex-col items-center justify-center">
              <p className="text-slate-400 text-sm">
                Select an assignment to track submissions.
              </p>
            </div>
          ) : (
            <div className="emi-card p-5">

              {/* Assignment header */}
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-100">{selectedAssignment.name}</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Due: {selectedAssignment.dueDate} · {selectedAssignment.totalMarks} marks
                </p>
              </div>

              {/* Submission summary cards */}
              {summary && students.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <SummaryCard color="green" value={summary.submitted} label="Submitted" />
                  <SummaryCard color="yellow" value={summary.late} label="Late" />
                  <SummaryCard color="red" value={summary.missing} label="Missing" />
                </div>
              )}

              {students.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  No students yet. Go to the Attendance page to add students.
                </p>
              ) : (
                <>
                  <p className="text-xs text-slate-400 mb-3">
                    Click a status button to set it, then enter a score (not required for Missing).
                  </p>

                  <div className="space-y-2 mb-5">
                    {students.map(student => {
                      const data = draft[student.id] || { status: '', score: '' }
                      const style = data.status ? STATUS_STYLE[data.status] : null
                      const numScore = data.score !== '' ? Number(data.score) : null
                      const inRange =
                        numScore !== null &&
                        numScore >= 0 &&
                        numScore <= selectedAssignment.totalMarks
                      const grade =
                        inRange && data.status !== 'missing'
                          ? getGrade(numScore, selectedAssignment.totalMarks)
                          : null

                      return (
                        <div
                          key={student.id}
                          className={`flex flex-wrap items-center gap-3 rounded-lg px-4 py-3 border transition ${
                            style ? style.row : 'bg-white/5 border-white/10'
                          }`}
                        >
                          {/* Name */}
                          <span className="w-28 text-sm font-medium text-slate-200 truncate flex-shrink-0">
                            {student.name}
                          </span>

                          {/* Status toggle buttons */}
                          <div className="flex gap-1">
                            {['submitted', 'late', 'missing'].map(s => (
                              <button
                                key={s}
                                onClick={() => setStatus(student.id, s)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition capitalize ${
                                  data.status === s
                                    ? STATUS_STYLE[s].btn
                                    : 'bg-white/5 text-slate-300 border-white/15 hover:border-white/30'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>

                          {/* Score input – hidden for missing submissions */}
                          {data.status && data.status !== 'missing' && (
                            <>
                              <input
                                type="number"
                                min="0"
                                max={selectedAssignment.totalMarks}
                                placeholder="Score"
                                value={data.score}
                                onChange={e => setScore(student.id, e.target.value)}
                                className={`w-20 border rounded-lg px-2.5 py-1.5 text-xs bg-white/5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-white/30 ${
                                  data.score !== '' && !inRange
                                    ? 'border-red-400'
                                    : 'border-white/15'
                                }`}
                              />
                              <span className="text-xs text-slate-400">
                                / {selectedAssignment.totalMarks}
                              </span>

                              {/* Auto grade */}
                              {grade && (
                                <span className={`font-bold text-sm ${getGradeColor(grade)}`}>
                                  {grade}
                                </span>
                              )}
                            </>
                          )}

                          {/* Missing badge */}
                          {data.status === 'missing' && (
                            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                              Not submitted
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleSave}
                      className="bg-white text-slate-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                    >
                      Save Submissions
                    </button>
                    {saved && (
                      <span className="text-green-600 text-sm font-medium">Saved!</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Small coloured summary card ──────────────────────────────────────────────

function SummaryCard({ color, value, label }) {
  const styles = {
    green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
    red: 'bg-red-500/10 border-red-500/20 text-red-300',
  }
  return (
    <div className={`border rounded-lg p-3 text-center ${styles[color]}`}>
      <div className="font-bold text-2xl">{value}</div>
      <div className="text-xs mt-1 font-medium">{label}</div>
    </div>
  )
}
