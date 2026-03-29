'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { signUp } from '../actions';

// ─── Password validation ──────────────────────────────────────────────────────

function getChecks(password: string) {
  return {
    length:  password.length >= 8,
    number:  /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{}|;':",.<>?\/]/.test(password),
  };
}

const CHECK_LABELS = {
  length:  'At least 8 characters',
  number:  'Contains a number',
  special: 'Contains a special character',
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);

  const checks = getChecks(password);
  const allChecksPassed = Object.values(checks).every(Boolean);
  const confirmMismatch = confirmTouched && confirmPassword !== password;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!allChecksPassed) return;
    if (confirmPassword !== password) return;

    const form = e.currentTarget;
    const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await signUp(email, password, fullName);
      if (result?.error) setError(result.error);
      if (result?.message) setMessage(result.message);
    });
  }

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create account</h1>

      {message ? (
        <div className="rounded-md bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-800">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputCls}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
            {/* Strength checklist */}
            {password.length > 0 && (
              <ul className="mt-2 space-y-1">
                {(Object.keys(checks) as Array<keyof typeof checks>).map((key) => (
                  <li
                    key={key}
                    className={`flex items-center gap-1.5 text-xs ${
                      checks[key] ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <span className="font-bold">{checks[key] ? '✓' : '○'}</span>
                    {CHECK_LABELS[key]}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setConfirmTouched(true)}
              className={`${inputCls} ${confirmMismatch ? 'border-red-400 focus:ring-red-500' : ''}`}
            />
            {confirmMismatch && (
              <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isPending || !allChecksPassed || confirmPassword !== password}
            className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      )}

      <p className="mt-4 text-sm text-gray-600 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
