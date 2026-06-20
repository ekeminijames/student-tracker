import RoleShell from '../../components/RoleShell'

export default function AdminDashboard() {
  return (
    <RoleShell title="Admin">
      <p className="text-slate-400 mb-8">Institute-wide overview and management.</p>
      <div className="emi-card p-8 text-slate-400">
        Your dashboard is ready. Bulk onboarding, semesters and institute settings
        arrive in the next tiers.
      </div>
    </RoleShell>
  )
}
