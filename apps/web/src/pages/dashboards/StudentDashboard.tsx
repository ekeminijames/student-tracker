import RoleShell from '../../components/RoleShell'

export default function StudentDashboard() {
  return (
    <RoleShell title="Student">
      <p className="text-slate-400 mb-8">Your courses, assessments and progress.</p>
      <div className="emi-card p-8 text-slate-400">
        Your dashboard is ready. Course content, assessments and progress tracking
        arrive in the next tiers.
      </div>
    </RoleShell>
  )
}
