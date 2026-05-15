import { useState } from 'react';
import { X, User, Store, ShieldCheck, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn, surfaceCard } from '../lib/ui';

export function AccountSettingsModal({ isOpen, onClose }) {
  const { user, updateProfile, updateOrganization } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  
  // Organization State
  const [orgName, setOrgName] = useState(user?.organization?.name || '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    const result = await updateProfile(name, email, password || undefined);
    
    if (result.success) {
      setMessage('Profile updated successfully!');
      setPassword(''); // Clear password field after success
    } else {
      setError(result.error || 'Failed to update profile');
    }
    setIsLoading(false);
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    const result = await updateOrganization(orgName);
    
    if (result.success) {
      setMessage('Organization updated successfully!');
    } else {
      setError(result.error || 'Failed to update organization');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className={cn(surfaceCard, "relative w-full max-w-xl shadow-2xl transition-all scale-100 opacity-100")}>
        <div className="flex items-center justify-between border-b border-[color:var(--line)] px-6 py-4">
          <h2 className="text-lg font-bold text-[color:var(--text)]">Account Settings</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-[color:var(--muted)] hover:bg-[color:var(--bg-strong)] hover:text-[color:var(--text)] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[color:var(--line)] px-6">
          <button
            onClick={() => { setActiveTab('profile'); setMessage(''); setError(''); }}
            className={cn(
              "border-b-2 px-4 py-4 text-sm font-semibold transition-colors",
              activeTab === 'profile' 
                ? "border-[color:var(--accent-blue)] text-[color:var(--accent-blue)]" 
                : "border-transparent text-[color:var(--muted)] hover:text-[color:var(--text)]"
            )}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Profile
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('organization'); setMessage(''); setError(''); }}
            className={cn(
              "border-b-2 px-4 py-4 text-sm font-semibold transition-colors",
              activeTab === 'organization' 
                ? "border-[color:var(--accent-blue)] text-[color:var(--accent-blue)]" 
                : "border-transparent text-[color:var(--muted)] hover:text-[color:var(--text)]"
            )}
          >
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Organization
            </div>
          </button>
        </div>

        <div className="p-6">
          {message && (
            <div className="mb-6 rounded-lg bg-[color:var(--accent-emerald-soft)] p-4 text-sm font-medium text-[color:var(--pill-good-text)]">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 rounded-lg bg-[color:var(--accent-red-soft)] p-4 text-sm font-medium text-[color:var(--alert-text)]">
              {error}
            </div>
          )}

          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-[color:var(--muted)]" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-xl border-0 bg-[color:var(--bg)] py-2.5 pl-10 pr-3 text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--line)] focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent-blue)] sm:text-sm"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-[color:var(--muted)]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border-0 bg-[color:var(--bg)] py-2.5 pl-10 pr-3 text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--line)] focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent-blue)] sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
                  New Password (optional)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-[color:var(--muted)]" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border-0 bg-[color:var(--bg)] py-2.5 pl-10 pr-3 text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--line)] focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent-blue)] sm:text-sm"
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-xl bg-[color:var(--accent-blue)] px-3 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOrgSubmit} className="space-y-5">
              <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--bg)] p-5 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--accent-emerald-soft)] text-[color:var(--accent-emerald)]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[color:var(--text)]">Current Plan: {user?.organization?.plan || 'Enterprise'}</h3>
                    <p className="text-sm text-[color:var(--muted)]">You have full access to all features.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
                  Organization Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Store className="h-4 w-4 text-[color:var(--muted)]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={user?.role !== 'admin'}
                    className="block w-full rounded-xl border-0 bg-[color:var(--bg)] py-2.5 pl-10 pr-3 text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--line)] focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent-blue)] sm:text-sm disabled:opacity-60"
                  />
                </div>
                {user?.role !== 'admin' && (
                  <p className="mt-2 text-xs text-[color:var(--muted)]">Only administrators can change the organization name.</p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || user?.role !== 'admin'}
                  className="flex w-full justify-center rounded-xl bg-[color:var(--accent-blue)] px-3 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Update Organization'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
