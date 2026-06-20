import { createContext, useContext, useState, useEffect } from 'react'

// ─── Context setup ───────────────────────────────────────────────────────────

const AppContext = createContext(null)

// Call this hook inside any component to get access to app data and actions
export function useApp() {
  return useContext(AppContext)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Generate a short unique ID
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// Returns letter grade from a score and its total possible marks
export function getGrade(score, total) {
  if (!total || total === 0) return '-'
  const pct = (score / total) * 100
  if (pct >= 90) return 'A'
  if (pct >= 75) return 'B'
  if (pct >= 60) return 'C'
  if (pct >= 50) return 'D'
  return 'F'
}

// Returns a Tailwind text color class for a given grade letter
export function getGradeColor(grade) {
  const colors = {
    A: 'text-green-600',
    B: 'text-blue-600',
    C: 'text-yellow-600',
    D: 'text-orange-600',
    F: 'text-red-600',
  }
  return colors[grade] || 'text-gray-500'
}

// Load data from localStorage, falling back to a default value if nothing is stored
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  // Each piece of state is initialised from localStorage so data survives page refreshes
  const [students, setStudents] = useState(() => loadFromStorage('st_students', []))
  const [attendance, setAttendance] = useState(() => loadFromStorage('st_attendance', []))
  const [tests, setTests] = useState(() => loadFromStorage('st_tests', []))
  const [testScores, setTestScores] = useState(() => loadFromStorage('st_testScores', []))
  const [assignments, setAssignments] = useState(() => loadFromStorage('st_assignments', []))
  const [submissions, setSubmissions] = useState(() => loadFromStorage('st_submissions', []))

  // Persist every state slice to localStorage whenever it changes
  useEffect(() => { localStorage.setItem('st_students', JSON.stringify(students)) }, [students])
  useEffect(() => { localStorage.setItem('st_attendance', JSON.stringify(attendance)) }, [attendance])
  useEffect(() => { localStorage.setItem('st_tests', JSON.stringify(tests)) }, [tests])
  useEffect(() => { localStorage.setItem('st_testScores', JSON.stringify(testScores)) }, [testScores])
  useEffect(() => { localStorage.setItem('st_assignments', JSON.stringify(assignments)) }, [assignments])
  useEffect(() => { localStorage.setItem('st_submissions', JSON.stringify(submissions)) }, [submissions])

  // ── Student actions ────────────────────────────────────────────────────────

  // Returns false if name is blank or already taken
  function addStudent(name) {
    const trimmed = name.trim()
    if (!trimmed) return false
    if (students.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) return false
    setStudents(prev => [...prev, { id: genId(), name: trimmed }])
    return true
  }

  // Deletes the student and all their associated records
  function removeStudent(id) {
    setStudents(prev => prev.filter(s => s.id !== id))
    setAttendance(prev => prev.filter(a => a.studentId !== id))
    setTestScores(prev => prev.filter(ts => ts.studentId !== id))
    setSubmissions(prev => prev.filter(sub => sub.studentId !== id))
  }

  // ── Attendance actions ─────────────────────────────────────────────────────

  // Creates or updates an attendance record for a student on a specific date
  function markAttendance(studentId, date, status) {
    setAttendance(prev => {
      const idx = prev.findIndex(a => a.studentId === studentId && a.date === date)
      if (idx >= 0) {
        // Update the existing record in-place
        const updated = [...prev]
        updated[idx] = { ...updated[idx], status }
        return updated
      }
      return [...prev, { id: genId(), studentId, date, status }]
    })
  }

  // Returns all attendance records for a given date (used to show the class register)
  function getAttendanceForDate(date) {
    return attendance.filter(a => a.date === date)
  }

  // Returns attendance stats for one student
  function getStudentAttendance(studentId) {
    const records = attendance.filter(a => a.studentId === studentId)
    const total = records.length
    const present = records.filter(a => a.status === 'present').length
    const percentage = total > 0 ? Math.round((present / total) * 100) : null
    return { records, total, present, percentage }
  }

  // ── Test / exam actions ────────────────────────────────────────────────────

  function addTest(name, totalMarks, date, type) {
    setTests(prev => [...prev, { id: genId(), name, totalMarks: Number(totalMarks), date, type }])
  }

  // Deletes the test and every score that belongs to it
  function removeTest(id) {
    setTests(prev => prev.filter(t => t.id !== id))
    setTestScores(prev => prev.filter(ts => ts.testId !== id))
  }

  // Creates or updates a student's score on a specific test
  function setTestScore(testId, studentId, score) {
    setTestScores(prev => {
      const idx = prev.findIndex(ts => ts.testId === testId && ts.studentId === studentId)
      const entry = {
        id: idx >= 0 ? prev[idx].id : genId(),
        testId,
        studentId,
        score: Number(score),
      }
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = entry
        return updated
      }
      return [...prev, entry]
    })
  }

  // Returns a single test-score record (or undefined if not yet entered)
  function getTestScore(testId, studentId) {
    return testScores.find(ts => ts.testId === testId && ts.studentId === studentId)
  }

  // Returns average, highest, and lowest raw scores across all students for one test
  function getTestStats(testId) {
    const scores = testScores.filter(ts => ts.testId === testId).map(ts => ts.score)
    if (scores.length === 0) return { avg: null, highest: null, lowest: null }
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    return { avg, highest: Math.max(...scores), lowest: Math.min(...scores) }
  }

  // Returns a student's average score across all tests as a percentage (0–100)
  function getStudentTestAverage(studentId) {
    const scores = testScores.filter(ts => ts.studentId === studentId)
    if (scores.length === 0) return null
    let totalPct = 0
    let count = 0
    for (const ts of scores) {
      const test = tests.find(t => t.id === ts.testId)
      if (test && test.totalMarks > 0) {
        totalPct += (ts.score / test.totalMarks) * 100
        count++
      }
    }
    return count > 0 ? Math.round(totalPct / count) : null
  }

  // ── Assignment actions ─────────────────────────────────────────────────────

  function addAssignment(name, dueDate, totalMarks) {
    setAssignments(prev => [...prev, { id: genId(), name, dueDate, totalMarks: Number(totalMarks) }])
  }

  // Deletes the assignment and every submission that belongs to it
  function removeAssignment(id) {
    setAssignments(prev => prev.filter(a => a.id !== id))
    setSubmissions(prev => prev.filter(sub => sub.assignmentId !== id))
  }

  // Creates or updates a student's submission record for one assignment
  function setSubmission(assignmentId, studentId, status, score) {
    setSubmissions(prev => {
      const idx = prev.findIndex(s => s.assignmentId === assignmentId && s.studentId === studentId)
      const entry = {
        id: idx >= 0 ? prev[idx].id : genId(),
        assignmentId,
        studentId,
        status,
        // Store null for score when the assignment is marked missing
        score: score !== '' && score !== null && score !== undefined ? Number(score) : null,
      }
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = entry
        return updated
      }
      return [...prev, entry]
    })
  }

  // Returns a single submission record (or undefined)
  function getSubmission(assignmentId, studentId) {
    return submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId)
  }

  // Returns how many of all assignments a student has submitted (submitted + late)
  function getStudentSubmissionStats(studentId) {
    if (assignments.length === 0) return { submitted: 0, total: 0, percentage: null }
    const total = assignments.length
    const studentSubs = submissions.filter(s => s.studentId === studentId)
    const submitted = studentSubs.filter(s => s.status === 'submitted' || s.status === 'late').length
    return {
      submitted,
      total,
      percentage: total > 0 ? Math.round((submitted / total) * 100) : null,
    }
  }

  // Everything components need is passed through the context value
  const value = {
    students,
    attendance,
    tests,
    testScores,
    assignments,
    submissions,
    addStudent,
    removeStudent,
    markAttendance,
    getAttendanceForDate,
    getStudentAttendance,
    addTest,
    removeTest,
    setTestScore,
    getTestScore,
    getTestStats,
    getStudentTestAverage,
    addAssignment,
    removeAssignment,
    setSubmission,
    getSubmission,
    getStudentSubmissionStats,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
