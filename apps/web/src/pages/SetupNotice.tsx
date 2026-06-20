import Logo from '../components/Logo'

// Shown when the Supabase backend isn't connected yet (no env keys). Keeps the
// app from looking "broken" before the §7 accounts exist.
export default function SetupNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8 text-white">
          <Logo />
        </div>

        <div className="emi-card p-7">
          <h1 className="emi-title text-2xl mb-2">Backend not connected yet</h1>
          <p className="text-slate-400 text-sm mb-6">
            The app shell is built and deployed, but it isn't linked to a database
            yet, so logins won't work until the accounts are set up.
          </p>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300 space-y-2">
            <p className="font-semibold text-slate-100">To switch it on:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Create a Supabase project.</li>
              <li>
                Copy <code className="text-slate-200">apps/web/.env.example</code> to{' '}
                <code className="text-slate-200">apps/web/.env</code>.
              </li>
              <li>Fill in the Supabase URL and anon key.</li>
              <li>Restart the app.</li>
            </ol>
          </div>

          <p className="text-slate-500 text-xs mt-5">
            Full checklist: <code className="text-slate-300">docs/handoff/STATUS.md</code>
          </p>
        </div>
      </div>
    </div>
  )
}
