import RoleShell from '../../components/RoleShell'

export default function MentorDashboard() {
  return (
    <RoleShell title="Mentor">
      <p className="text-slate-400 mb-8">Your courses, cohorts and at-risk students.</p>
      <div className="emi-card p-8 text-slate-400">
        Your dashboard is ready. Curriculum builder, student onboarding and
        monitoring arrive in the next tiers.
      </div>
    </RoleShell>
  )
}
