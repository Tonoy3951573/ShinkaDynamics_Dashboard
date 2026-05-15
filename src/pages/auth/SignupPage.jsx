import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Mail, Lock, ArrowRight, User, Eye, EyeOff } from 'lucide-react';

const inputClass =
  'block w-full rounded-xl border-0 bg-[color:var(--bg)] py-2.5 pl-10 pr-3 text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--line)] placeholder:text-[color:var(--muted)] focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent-blue)] sm:text-sm sm:leading-6';

export const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    const result = await signup(orgName, fullName, email, password);
    if (!result.success) {
      setError(result.error || 'Failed to create account');
      setIsSubmitting(false);
    }
  };

  const Field = ({ id, label, icon: Icon, type = 'text', value, onChange, placeholder, extra }) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="h-4 w-4 text-[color:var(--muted)]" />
        </div>
        <input
          id={id}
          type={type}
          required
          value={value}
          onChange={onChange}
          className={inputClass}
          placeholder={placeholder}
        />
        {extra}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--bg)] p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[color:var(--bg-panel)] p-8 shadow-xl ring-1 ring-[color:var(--line)]">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)]">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[color:var(--text)]">
            Create your workspace
          </h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Set up your organization and start monitoring in minutes.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-[color:var(--accent-red-soft)] p-4 text-sm font-medium text-[color:var(--alert-text)] ring-1 ring-[color:var(--accent-red)]/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row: Name + Org */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              id="fullName"
              label="Your Full Name"
              icon={User}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
            />
            <Field
              id="orgName"
              label="Organization Name"
              icon={Building2}
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Corp"
            />
          </div>

          <Field
            id="email"
            label="Admin Email Address"
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />

          {/* Password with toggle */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-[color:var(--muted)]" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border-0 bg-[color:var(--bg)] py-2.5 pl-10 pr-10 text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--line)] placeholder:text-[color:var(--muted)] focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent-blue)] sm:text-sm"
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[color:var(--muted)] hover:text-[color:var(--text)]"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
              Confirm Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-[color:var(--muted)]" />
              </div>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-xl border-0 bg-[color:var(--bg)] py-2.5 pl-10 pr-3 text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--line)] placeholder:text-[color:var(--muted)] focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent-blue)] sm:text-sm"
                placeholder="Re-enter your password"
              />
            </div>
          </div>

          {/* Strength hint */}
          {password.length > 0 && (
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    password.length >= i * 3
                      ? password.length >= 12
                        ? 'bg-[color:var(--accent-emerald)]'
                        : password.length >= 8
                        ? 'bg-[color:var(--accent-amber)]'
                        : 'bg-[color:var(--accent-red)]'
                      : 'bg-[color:var(--line-strong)]'
                  }`}
                />
              ))}
              <span className="text-xs text-[color:var(--muted)] min-w-[40px]">
                {password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Good' : 'Weak'}
              </span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent-blue)] px-3 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-50 disabled:translate-y-0"
            >
              {isSubmitting ? 'Creating your workspace...' : 'Create account'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[color:var(--accent-blue)] hover:text-blue-500">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
