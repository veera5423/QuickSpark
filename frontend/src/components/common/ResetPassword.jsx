import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';

import { authAPI } from '../../api/authAPI';
import {
  ArrowLeft,
  CheckCircle,
  Clock3,
  Fingerprint,
  Lock,
  Loader2,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [searchParams] = useSearchParams();
  const { token: pathToken } = useParams();
  const navigate = useNavigate();

  // Extract token from query params or path (Robust approach)
  const token = searchParams.get('token') || pathToken;

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link: Token is missing.');
      return;
    }

    // Verify token validity
    const verifyToken = async () => {
      try {
        await authAPI.verifyResetToken(token);
        setTokenValid(true);
      } catch {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };

    verifyToken();
  }, [token]);

  const passwordRules = [
    'At least 6 characters',
    'Use a mix of letters and numbers',
    'Avoid reused passwords',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword(token, { password });
      setMessage(response.data.message || 'Password updated successfully. Redirecting...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Token Verification/Error State ---
  if (!tokenValid || error) {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-400">QuickSpark Security</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-400">We are checking your reset link before continuing.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          {error ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Verification failed</h3>
              <p className="mt-2 text-sm leading-6 text-red-700">{error}</p>
              <Link to="/forgot-password" className="mt-5 inline-flex w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Request new link
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
                <Fingerprint className="h-6 w-6 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-900">Checking reset link</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  We are verifying that your password reset request is still active.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    <Clock3 className="mb-2 h-4 w-4 text-indigo-600" />
                    This usually takes a second.
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    <ShieldCheck className="mb-2 h-4 w-4 text-emerald-600" />
                    Your link is checked securely.
                  </div>
                </div>
              </div>
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Render Password Reset Form ---
  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-400">Secure account recovery</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-600">Create a fresh password</h2>
        <p className="mt-2 text-sm text-gray-400">Your reset link is valid. Set a new password to continue.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="bg-gradient-to-r from-teal-300 to-slate-900 px-6 py-5 text-white sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Reset password</p>
              <h3 className="text-xl font-black tracking-tight sm:text-2xl">Choose a new password</h3>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <span>Use a password you have not used before. Keep it private and make it easy for you to remember but hard for others to guess.</span>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                type="password"
                label="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter a strong new password"
                icon={Lock}
                minLength={6}
              />
              <Input
                type="password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter the new password"
                icon={Lock}
                minLength={6}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {passwordRules.map((rule) => (
                <div key={rule} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                  {rule}
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={loading || !tokenValid}
              fullWidth
              className="h-12 w-full bg-slate-800 text-base font-semibold shadow-lg shadow-indigo-600/20 hover:bg-slate-700 cursor-pointer transition-colors duration-150"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating password...
                </span>
              ) : (
                'Update password'
              )}
            </Button>

            <div className="flex items-center justify-between gap-3 pt-1 text-sm">
              <Link to="/forgot-password" className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" /> Request new link
              </Link>
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-800">
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;