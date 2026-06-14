import { useState } from 'react'
import { useApp, getGrade, getGradeColor } from '../context/AppContext'

export default function Marks() {
  const {
    students,
    tests,
    addTest,
    removeTest,
    setTestScore,
    getTestScore,
    getTestStats,
  } = useApp()

  // ── Form state for adding a new test ──────────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    totalMarks: '',
    date: new Date().toISOString().split('T')[0],
    type: 'test',
  })
  const [formError, setFormError] = useState('')

  // ── Score entry state ──────────────────────────────────────────────────────
  // Which test is currently selected in the right panel
  const [selectedTestId, setSelectedTestId] = useState(null)
  // Local draft scores (string values from the inputs) keyed by studentId
  const [draftScores, setDraftScores] = useState({})
  // Show a brief "Saved!" banner after saving
  const [saved, setSaved] = useState(false)

  // Load saved scores for a test into the draft inputs when a test is selected
  function selectTest(testId) {
    setSelectedTestId(testId)
    setSaved(false)
    const loaded = {}
    students.forEach(s => {
      const existing = getTestScore(testId, s.id)
      loaded[s.id] = existing !== undefined ? String(existing.score) : ''
    })
    setDraftScores(loaded)
  }

  function handleAddTest(e) {
    e.preventDefault()
    if (!form.name.trim()) { setFormError('Please enter a test name.'); return }
    if (!form.totalMarks || Number(form.totalMarks) <= 0) {
      setFormError('Please enter valid total marks.')
      return
    }
    addTest(form.name.trim(), Number(form.totalMarks), form.date, form.type)
    setForm(f => ({ ...f, name: '', totalMarks: '' }))
    setFormError('')
  }

  function handleDeleteTest(id) {
    if (!window.confirm('Delete this test and all its scores?')) return
    removeTest(id)
    if (selectedTestId === id) {
      setSelectedTestId(null)
      setDraftScores({})
    }
  }

  // Validate and persist all draft scores to context / localStorage
  function handleSaveScores() {
    if (!selectedTestId) return
    const test = tests.find(t => t.id === selectedTestId)
    let didSave = false
    for (const [studentId, raw] of Object.entries(draftScores)) {
      if (raw === '') continue
      const score = Number(raw)
      if (isNaN(score) || score < 0 || score > test.totalMarks) continue
      setTestScore(selectedTestId, studentId, score)
      didSave = true
    }
    if (didSave) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const selectedTest = tests.find(t => t.id === selectedTestId)
  const stats = selectedTestId ? getTestStats(selectedTestId) : null

  return (
    <div>
      <h1 className="emi-title text-3xl md:text-4xl mb-1">Tests & Exams</h1>
      <p className="text-slate-400 mb-8">Record scores and auto-grade each student</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column ────────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-5">

          {/* Add test form */}
          <div className="emi-card p-5">
            <h2 className="font-semibold text-slate-200 mb-4">Add Test / Exam</h2>
            <form onSubmit={handleAddTest} className="space-y-3">

              <div>
                <label className="text-xs font-medium text-slate-400">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mid-term Exam"
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormError('') }}
                  className="mt-1 w-full border border-white/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400">Total Marks</label>
                  <input
                    type="number"
                    placeholder="100"
                    min="1"
                    value={form.totalMarks}
                    onChange={e => setForm(f => ({ ...f, totalMarks: e.target.value }))}
                    className="mt-1 w-full border border-white/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="mt-1 w-full border border-white/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="test">Test</option>
                    <option value="exam">Exam</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="mt-1 w-full border border-white/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              {formError && <p className="text-red-500 text-xs">{formError}</p>}

              <button
                type="submit"
                className="w-full bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
              >
                Add Test
              </button>
            </form>
          </div>

          {/* Tests list – click one to open score entry */}
          <div className="emi-card p-5">
            <h2 className="font-semibold text-slate-200 mb-4">
              Tests / Exams <span className="text-slate-500 font-normal text-sm">({tests.length})</span>
            </h2>

            {tests.length === 0 ? (
              <p className="text-slate-500 text-sm">No tests added yet.</p>
            ) : (
              <div className="space-y-2">
                {[...tests].sort((a, b) => b.date.localeCompare(a.date)).map(test => (
                  <div
                    key={test.id}
                    onClick={() => selectTest(test.id)}
                    className={`cursor-pointer rounded-lg px-4 py-3 border transition ${
                      selectedTestId === test.id
                        ? 'border-white/40 bg-white/10'
                        : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium text-slate-100">{test.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {test.date} · {test.totalMarks} marks · <span className="capitalize">{test.type}</span>
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteTest(test.id) }}
                        className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0"
                        title="Delete test"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column: score entry ───────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {!selectedTest ? (
            <div className="emi-card p-10 text-center h-48 flex flex-col items-center justify-center">
              <p className="text-slate-400 text-sm">Select a test from the list to enter scores.</p>
            </div>
          ) : (
            <div className="emi-card p-5">

              {/* Test header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{selectedTest.name}</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {selectedTest.date} · {selectedTest.totalMarks} marks ·{' '}
                    <span className="capitalize">{selectedTest.type}</span>
                  </p>
                </div>

                {/* Class stats (only show when at least one score has been saved) */}
                {stats && stats.avg !== null && (
                  <div className="flex gap-3 text-xs flex-shrink-0">
                    <StatPill label="Avg" value={stats.avg} color="blue" />
                    <StatPill label="High" value={stats.highest} color="green" />
                    <StatPill label="Low" value={stats.lowest} color="red" />
                  </div>
                )}
              </div>

              {students.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  No students yet. Go to the Attendance page to add students.
                </p>
              ) : (
                <>
                  {/* Grade key */}
                  <div className="flex gap-3 text-xs mb-4 flex-wrap">
                    {[['A', '90–100%'], ['B', '75–89%'], ['C', '60–74%'], ['D', '50–59%'], ['F', '<50%']].map(([g, range]) => (
                      <span key={g} className="text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-semibold">
                        <span className={getGradeColor(g)}>{g}</span>: {range}
                      </span>
                    ))}
                  </div>

                  {/* Score inputs */}
                  <div className="space-y-2 mb-5">
                    {students.map(student => {
                      const raw = draftScores[student.id] ?? ''
                      const numScore = raw !== '' ? Number(raw) : null
                      const inRange = numScore !== null && numScore >= 0 && numScore <= selectedTest.totalMarks
                      const grade = inRange ? getGrade(numScore, selectedTest.totalMarks) : null
                      const pct = inRange ? Math.round((numScore / selectedTest.totalMarks) * 100) : null

                      return (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2.5 flex-wrap"
                        >
                          {/* Student name */}
                          <div className="w-32 text-sm font-medium text-slate-200 truncate">
                            {student.name}
                          </div>

                          {/* Score input */}
                          <input
                            type="number"
                            min="0"
                            max={selectedTest.totalMarks}
                            placeholder="Score"
                            value={raw}
                            onChange={e =>
                              setDraftScores(prev => ({ ...prev, [student.id]: e.target.value }))
                            }
                            className={`w-24 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 ${
                              raw !== '' && !inRange
                                ? 'border-red-400 bg-red-50'
                                : 'border-white/15'
                            }`}
                          />
                          <span className="text-xs text-slate-500">/ {selectedTest.totalMarks}</span>

                          {/* Percentage + auto grade (shown once input is valid) */}
                          {grade && (
                            <>
                              <span className="text-xs text-slate-400">{pct}%</span>
                              <span className={`font-bold text-sm ${getGradeColor(grade)}`}>
                                {grade}
                              </span>
                            </>
                          )}

                          {/* Out-of-range warning */}
                          {raw !== '' && !inRange && (
                            <span className="text-xs text-red-500">
                              Must be 0–{selectedTest.totalMarks}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleSaveScores}
                      className="bg-white text-slate-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                    >
                      Save Scores
                    </button>
                    {saved && (
                      <span className="text-green-600 text-sm font-medium">Scores saved!</span>
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

// ── Small coloured stat pill ─────────────────────────────────────────────────

function StatPill({ label, value, color }) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
  }
  return (
    <div className={`px-3 py-2 rounded-lg text-center ${styles[color]}`}>
      <div className="font-bold text-base">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  )
}
