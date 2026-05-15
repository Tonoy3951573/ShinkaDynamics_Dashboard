import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Failed to login');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--bg)] p-4">
      <div className="w-full max-w-md rounded-2xl bg-[color:var(--bg-panel)] p-8 shadow-xl ring-1 ring-[color:var(--line)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--accent-blue)]/10 text-[color:var(--accent-blue)]">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[color:var(--text)]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Log in to manage your workspace and team.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 ring-1 ring-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-[color:var(--text)]"
            >
              Email address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4 w-4 text-[color:var(--muted)]" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border-0 bg-[color:var(--bg)] py-2.5 pl-10 pr-3 text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--line)] placeholder:text-[color:var(--muted)] focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent-blue)] sm:text-sm sm:leading-6"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-[color:var(--text)]"
            >
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-[color:var(--muted)]" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border-0 bg-[color:var(--bg)] py-2.5 pl-10 pr-3 text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--line)] placeholder:text-[color:var(--muted)] focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent-blue)] sm:text-sm sm:leading-6"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent-blue)] px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent-blue)] disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[color:var(--muted)]">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-[color:var(--accent-blue)] hover:text-blue-500"
          >
            Create your organization
          </Link>
        </p>
      </div>
    </div>
  );
};
