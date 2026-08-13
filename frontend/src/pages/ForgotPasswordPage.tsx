import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { forgotPasswordApi, resetPasswordApi } from '../services/api';
import { Mail, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const msg = await forgotPasswordApi(email);
      setMessage(msg);
      // Auto switch to reset view if dev token returned
      if (msg.includes('Dev Reset Token:')) {
        const tokenMatch = msg.split('Dev Reset Token: ')[1]?.replace(/\)$/, '') || '';
        setResetToken(tokenMatch || '');
      }
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const msg = await resetPasswordApi(resetToken, newPassword);
      setMessage(msg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F7F9F7]">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-gray-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Logo variant="navbar" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            {step === 'request' ? 'Forgot Password' : 'Reset Password'}
          </h2>
          <p className="text-xs text-gray-500 font-mono">
            {step === 'request'
              ? 'Enter your registered email to request password reset'
              : 'Enter reset token & choose a new password'}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2 break-all">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleForgotSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-gray-900 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:from-amber-300 hover:to-emerald-300 shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Send Reset Instructions'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Reset Token</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Enter reset token"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-gray-900 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">New Password (min 8 chars)</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-gray-900 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:from-amber-300 hover:to-emerald-300 shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Resetting...' : 'Confirm Reset Password'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
