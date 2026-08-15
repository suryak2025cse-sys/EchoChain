import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';
import { GoldButton } from '../components/ui/GoldButton';
import { Mail, Lock, AlertOctagon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] relative flex items-center justify-center px-4 py-12 bg-[#080A09]">
      
      {/* Waveform Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <EcosystemWaveform height={300} color="#D4AF37" speed={0.015} />
      </div>

      <div className="max-w-md w-full p-10 rounded-sm bg-[#101311] border border-[#1D221F] shadow-2xl space-y-8 relative z-10">
        
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-3">
            <Logo variant="icon" />
          </div>
          <h2 className="text-3xl font-serif font-light text-[#F5F3ED]">Sign in to EchoChain</h2>
          <p className="text-xs font-mono text-[#9A9A93]">
            Access your agricultural provenance workspace
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B] text-xs font-mono flex items-center gap-3">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-mono">
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
                placeholder="producer@estate.com"
                className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] placeholder-[#9A9A93] focus:border-[#D4AF37] outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[#9A9A93] font-semibold uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-[#D4AF37] hover:underline text-[11px]">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9A9A93] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] placeholder-[#9A9A93] focus:border-[#D4AF37] outline-none transition-colors"
              />
            </div>
          </div>

          <GoldButton
            type="submit"
            disabled={loading}
            showArrow
            className="w-full !py-3.5"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </GoldButton>
        </form>

        <div className="pt-6 border-t border-[#1D221F] text-center text-xs font-mono text-[#9A9A93]">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#D4AF37] hover:underline">
            Register Producer
          </Link>
        </div>

      </div>
    </div>
  );
};
