import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';
import { GoldButton } from '../components/ui/GoldButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { User, Mail, Building, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await updateProfile(fullName, organization.trim() || undefined);
      setMessage('✓ Profile metadata updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Profile update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] p-6 md:p-12 space-y-8 font-mono text-xs">
      
      <div className="relative p-8 rounded-sm bg-[#101311] border border-[#1D221F] overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-25">
          <EcosystemWaveform height={160} color="#D4AF37" speed={0.015} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-serif font-light text-[#F5F3ED]">
                User Profile & Governance
              </h1>
              <StatusBadge status={user?.role || 'PRODUCER'} size="sm" />
            </div>
            <p className="text-xs text-[#9A9A93]">
              Account ID: {user?.id} • Registered Member
            </p>
          </div>

          <div className="flex items-center gap-4">
            {user?.role === 'PRODUCER' && (
              <Link to="/producer/dashboard">
                <GoldButton variant="primary" showArrow className="!py-3 !px-5 text-xs">
                  PRODUCER DASHBOARD
                </GoldButton>
              </Link>
            )}

            {(user?.role === 'CERTIFIER' || user?.role === 'ADMIN') && (
              <Link to="/certifier/dashboard">
                <GoldButton variant="primary" showArrow className="!py-3 !px-5 text-xs">
                  CERTIFIER DASHBOARD
                </GoldButton>
              </Link>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xs bg-[#7CC8A0]/10 border border-[#7CC8A0]/40 text-[#7CC8A0]">
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B]">
          {error}
        </div>
      )}

      <div className="max-w-2xl mx-auto p-10 rounded-sm bg-[#101311] border border-[#1D221F] space-y-6 shadow-2xl">
        <h2 className="text-xl font-serif text-[#F5F3ED]">Account Settings</h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-[#9A9A93] mb-1 font-semibold uppercase">Email Address (Immutable)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9A9A93] absolute left-3.5 top-3.5" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#9A9A93] cursor-not-allowed opacity-75"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9A9A93] mb-1 font-semibold uppercase">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#9A9A93] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9A9A93] mb-1 font-semibold uppercase">Organization / Estate Name</label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#9A9A93] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9A9A93] mb-1 font-semibold uppercase">Assigned Protocol Role</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-[#9A9A93] absolute left-3.5 top-3.5" />
              <input
                type="text"
                disabled
                value={user?.role || ''}
                className="w-full pl-11 pr-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#D4AF37] font-bold cursor-not-allowed uppercase"
              />
            </div>
          </div>

          <GoldButton
            type="submit"
            disabled={loading}
            showArrow
            className="w-full !py-3.5"
          >
            {loading ? 'Updating Profile...' : 'Save Profile Changes'}
          </GoldButton>
        </form>
      </div>

    </div>
  );
};
