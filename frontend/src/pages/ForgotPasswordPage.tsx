import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';
import { GoldButton } from '../components/ui/GoldButton';
import { forgotPasswordApi, resetPasswordApi } from '../services/api';
import { Mail, KeyRound, CheckCircle2, AlertOctagon } from 'lucide-react';

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
    <div className="min-h-[85vh] relative flex items-center justify-center px-4 py-12 bg-[#080A09]">
      
      {/* Waveform Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <EcosystemWaveform height={280} color="#D4AF37" speed={0.015} />
      </div>

      <div className="max-w-md w-full p-10 rounded-sm bg-[#101311] border border-[#1D221F] shadow-2xl space-y-6 relative z-10">
        
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo variant="icon" />
          </div>
          <h2 className="text-3xl font-serif font-light text-[#F5F3ED]">
            {step === 'request' ? 'Forgot Password' : 'Reset Password'}
          </h2>
          <p className="text-xs font-mono text-[#9A9A93]">
            {step === 'request'
              ? 'Enter registered email to request password reset'
              : 'Enter reset token & choose a new password'}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B] text-xs font-mono flex items-center gap-3">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4 rounded-xs bg-[#7CC8A0]/10 border border-[#7CC8A0]/40 text-[#7CC8A0] text-xs font-mono flex items-start gap-3 break-all">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[#9A9A93] font-semibold mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9A9A93] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] placeholder-[#9A9A93] focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>

            <GoldButton
              type="submit"
              disabled={loading}
              showArrow
              className="w-full !py-3.5"
            >
              {loading ? 'Processing Token...' : 'Send Reset Token'}
            </GoldButton>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[#9A9A93] font-semibold mb-2 uppercase tracking-wider">
                Reset Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#9A9A93] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Enter reset token"
                  className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] placeholder-[#9A9A93] focus:border-[#D4AF37] outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#9A9A93] font-semibold mb-2 uppercase tracking-wider">
                New Password (min 8 chars)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#9A9A93] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] placeholder-[#9A9A93] focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>

            <GoldButton
              type="submit"
              disabled={loading}
              showArrow
              className="w-full !py-3.5"
            >
              {loading ? 'Updating Password...' : 'Confirm Reset Password'}
            </GoldButton>
          </form>
        )}

        <div className="pt-6 border-t border-[#1D221F] text-center text-xs font-mono text-[#9A9A93]">
          Remember your password?{' '}
          <Link to="/login" className="font-bold text-[#D4AF37] hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
