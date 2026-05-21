import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'
import { UserMinus, Check, AlertTriangle, Loader2 } from 'lucide-react'

export default function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const fetchUsers = async () => {
    try {
      const data = await api('/admin/users')
      setUsers(data || [])
    } catch (err) {
      console.error('[UserList] Failed to fetch users:', err)
      setError('Failed to fetch onboarded users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSuspend = async (userId) => {
    if (!confirm('Are you sure you want to suspend this user? This will delete their account credentials.')) {
      return
    }
    setActionLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await api(`/admin/users/${userId}/suspend`, {
        method: 'POST'
      })
      setSuccess(`User suspended successfully.`)
      await fetchUsers()
    } catch (err) {
      console.error('[UserList] Suspension failed:', err)
      setError(err.message || 'Failed to suspend user.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-9 h-9 animate-spin text-[color:var(--accent-blue)]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-[fade-in_0.2s_ease-out]">
      <div className="border-b border-[color:var(--line)] pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--text)] m-0">
          Onboarded Users & Accounts
        </h1>
        <p className="text-sm text-[color:var(--muted)] mt-2">
          Monitor registered users, cross-org memberships, and operational active plans.
        </p>
      </div>

      {success && (
        <div className="bg-[color:var(--accent-emerald-soft)] border border-[color:var(--accent-emerald)]/30 text-[color:var(--accent-emerald)] px-5 py-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-md animate-[fade-in_0.2s_ease-out]">
          <Check className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-[color:var(--accent-red-soft)] border border-[color:var(--accent-red)]/30 text-[color:var(--accent-red)] px-5 py-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-md animate-[fade-in_0.2s_ease-out]">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-[color:var(--bg-panel)] border border-[color:var(--line-strong)] rounded-3xl p-6 backdrop-blur-lg shadow-md overflow-x-auto">
        <table className="min-w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-[color:var(--line-strong)]">
              <th className="pb-4 font-bold text-xs uppercase tracking-wider text-[color:var(--accent-blue)]">User Name</th>
              <th className="pb-4 font-bold text-xs uppercase tracking-wider text-[color:var(--accent-blue)]">Email</th>
              <th className="pb-4 font-bold text-xs uppercase tracking-wider text-[color:var(--accent-blue)]">Organization ID</th>
              <th className="pb-4 font-bold text-xs uppercase tracking-wider text-[color:var(--accent-blue)]">Org Plan</th>
              <th className="pb-4 font-bold text-xs uppercase tracking-wider text-[color:var(--accent-blue)]">Date Joined</th>
              <th className="pb-4 font-bold text-xs uppercase tracking-wider text-[color:var(--accent-blue)] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--line)]">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[color:var(--muted)] font-medium">
                  No onboarded users found in SQLite database.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-[color:var(--accent-blue-soft)] transition-colors duration-200">
                  <td className="py-4.5 font-bold text-[color:var(--text)]">{u.name}</td>
                  <td className="py-4.5 text-[color:var(--text)]">{u.email}</td>
                  <td className="py-4.5 font-mono text-xs text-[color:var(--accent-blue)]">{u.organization_id || 'N/A'}</td>
                  <td className="py-4.5">
                    <span className={`inline-flex text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${
                      u.organization_plan === 'enterprise' || u.organization_plan === 'premium'
                        ? 'bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)] border border-[color:var(--accent-blue)]/20'
                        : 'bg-[color:var(--bg-chip)] text-[color:var(--muted)] border border-[color:var(--line)]'
                    }`}>
                      {(u.organization_plan || 'free').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4.5 text-[color:var(--muted)]">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-4.5 text-right">
                    <button
                      className="bg-[color:var(--accent-red-soft)] border border-[color:var(--accent-red)]/25 text-[color:var(--accent-red)] hover:bg-[color:var(--accent-red)] hover:text-white hover:shadow-lg rounded-xl px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all duration-200 active:scale-95"
                      onClick={() => handleSuspend(u.id)}
                      disabled={actionLoading}
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                      Suspend User
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
