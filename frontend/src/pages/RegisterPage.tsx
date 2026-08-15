import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';
import { GoldButton } from '../components/ui/GoldButton';
import type { UserRole } from '../types';
import { Mail, Lock, User as UserIcon, Building, ShieldCheck, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('PRODUCER');
  const [organization, setOrganization] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await register(email, password, fullName, role, organization.trim() || undefined);
      setSuccess('Registration successful! Proceeding to workspace...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] relative flex items-center justify-center px-4 py-12 bg-[#080A09]">
      
      {/* Waveform Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <EcosystemWaveform height={350} color="#D4AF37" speed={0.015} />
      </div>

      <div className="max-w-md w-full p-10 rounded-sm bg-[#101311] border border-[#1D221F] shadow-2xl space-y-8 relative z-10">
        
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo variant="icon" />
          </div>
          <h2 className="text-3xl font-serif font-light text-[#F5F3ED]">Create EchoChain Account</h2>
          <p className="text-xs font-mono text-[#9A9A93]">
            Register as a Producer, Certifier, or Auditor
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B] text-xs font-mono flex items-center gap-3">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xs bg-[#7CC8A0]/10 border border-[#7CC8A0]/40 text-[#7CC8A0] text-xs font-mono flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-[#9A9A93] font-semibold mb-2 uppercase tracking-wider">
              Full Name *
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-[#9A9A93] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sofia Chen"
                className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] placeholder-[#9A9A93] focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9A9A93] font-semibold mb-2 uppercase tracking-wider">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9A9A93] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="producer@estate.com"
                className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] placeholder-[#9A9A93] focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9A9A93] font-semibold mb-2 uppercase tracking-wider">
              Password (min 8 chars) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9A9A93] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] placeholder-[#9A9A93] focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9A9A93] font-semibold mb-2 uppercase tracking-wider">
              Organization / Estate Name
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#9A9A93] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Highland Estate Co."
                className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] placeholder-[#9A9A93] focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9A9A93] font-semibold mb-2 uppercase tracking-wider">
              Account Role *
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-[#9A9A93] absolute left-3.5 top-3.5 pointer-events-none" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] focus:border-[#D4AF37] outline-none"
              >
                <option value="PRODUCER">Producer / Harvester</option>
                <option value="CONSUMER">Consumer / Public Observer</option>
                <option value="CERTIFIER">Certifier / Auditor</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>
          </div>

          <GoldButton
            type="submit"
            disabled={loading}
            showArrow
            className="w-full !py-3.5"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </GoldButton>
        </form>

        <div className="pt-6 border-t border-[#1D221F] text-center text-xs font-mono text-[#9A9A93]">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-[#D4AF37] hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
