import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  ShieldCheck, 
  Building, 
  Mail, 
  LogOut, 
  CheckCircle2, 
  Edit3, 
  ArrowUpRight, 
  Radio, 
  Lock, 
  Sparkles,
  Calendar,
  Key,
  Sliders
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await updateProfile(fullName, organization);
      setMessage('Profile specifications updated successfully.');
      setEditing(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'PRODUCER':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          label: 'Harvester / Producer',
          icon: <Radio className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
        };
      case 'CERTIFIER':
        return {
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
          label: 'Certifier / Auditor',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
        };
      case 'ADMIN':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: 'System Administrator',
          icon: <Sliders className="w-3.5 h-3.5 text-amber-700" />
        };
      default:
        return {
          bg: 'bg-teal-100 text-teal-900 border-teal-300',
          label: 'Consumer / Public',
          icon: <Sparkles className="w-3.5 h-3.5 text-teal-700" />
        };
    }
  };

  const roleInfo = getRoleBadge(user.role);

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* HERO IDENTITY BANNER CARD (LIGHT THEME) */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 shadow-xl bg-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Left User Identity Info */}
            <div className="flex items-center gap-5">
              {/* Avatar Icon */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-700 via-teal-600 to-amber-500 p-0.5 shadow-md shadow-emerald-900/10">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-serif text-3xl font-extrabold text-emerald-900">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{user.fullName}</h1>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border uppercase ${roleInfo.bg}`}>
                    {roleInfo.icon}
                    {user.role}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" /> {user.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-teal-700" /> {user.organization || 'Independent Operator'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setEditing(!editing)}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 bg-white text-xs font-semibold text-gray-800 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Edit3 className="w-4 h-4 text-emerald-700" />
                {editing ? 'Close Edit' : 'Edit Profile'}
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 bg-white text-xs font-semibold text-rose-700 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* FEEDBACK NOTIFICATION */}
        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{message}</span>
          </div>
        )}

        {/* ECOSYSTEM WORKSPACE PORTALS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" /> Role-Authorized Ecosystem Workspaces
            </h2>
            <span className="text-xs font-mono text-gray-500">Current Role: {user.role}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Producer Workspace Card */}
            <div
              className={`p-6 rounded-2xl border transition-all ${
                user.role === 'PRODUCER' || user.role === 'ADMIN'
                  ? 'bg-white border-emerald-500/40 shadow-md shadow-emerald-900/5 hover:border-emerald-600'
                  : 'bg-white/60 border-gray-200/60 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Radio className="w-5 h-5" />
                </div>
                {user.role === 'PRODUCER' && (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase">
                    Primary Role
                  </span>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-base">Producer Workspace</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Record field ambient audio signatures, register harvest batches, and seal origin metadata to IPFS.
              </p>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to="/producer"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors"
                >
                  Access Producer Suite <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Certifier Workspace Card */}
            <div
              className={`p-6 rounded-2xl border transition-all ${
                user.role === 'CERTIFIER' || user.role === 'ADMIN'
                  ? 'bg-white border-purple-500/40 shadow-md shadow-purple-900/5 hover:border-purple-600'
                  : 'bg-white/60 border-gray-200/60 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                {user.role === 'CERTIFIER' && (
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-mono font-bold uppercase">
                    Primary Role
                  </span>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-base">Certifier Portal</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Review harvester origin claims, audit acoustic similarity reports, and issue compliance attestations.
              </p>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to="/certifier"
                  className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1.5 transition-colors"
                >
                  Access Certifier Suite <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Admin Console Card */}
            <div
              className={`p-6 rounded-2xl border transition-all ${
                user.role === 'ADMIN'
                  ? 'bg-white border-amber-500/40 shadow-md shadow-amber-900/5 hover:border-amber-600'
                  : 'bg-white/60 border-gray-200/60 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                {user.role === 'ADMIN' && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase">
                    System Admin
                  </span>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-base">Admin Governance</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Manage user permissions, review system audit logs, configure IPFS nodes & Polygon smart contracts.
              </p>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to="/admin"
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 transition-colors"
                >
                  Access Admin Suite <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ACCOUNT SPECIFICATIONS & EDIT PANEL (LIGHT THEME) */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Configuration & Security</span>
              <h2 className="text-xl font-bold text-gray-900">Account Specifications</h2>
            </div>

            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-700" /> Active JWT Session
            </span>
          </div>

          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-mono font-semibold text-gray-700 mb-1">Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:from-amber-300 hover:to-emerald-300 shadow-md transition-all"
                >
                  {loading ? 'Saving Changes...' : 'Save Profile Specifications'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
                <span className="text-gray-500 text-[10px] uppercase font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-700" /> Email Identity
                </span>
                <p className="font-bold text-gray-900 truncate">{user.email}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
                <span className="text-gray-400 text-[10px] uppercase font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-700" /> Assigned Role
                </span>
                <p className="font-bold text-emerald-800">{user.role}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
                <span className="text-gray-400 text-[10px] uppercase font-semibold flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-purple-700" /> Organization
                </span>
                <p className="font-bold text-gray-900 truncate">{user.organization || 'Not Specified'}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
                <span className="text-gray-400 text-[10px] uppercase font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" /> Member Since
                </span>
                <p className="font-bold text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>

            </div>
          )}

          {/* Security Summary Strip */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-wrap items-center justify-between text-xs text-gray-700 font-mono">
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-700" /> JWT Bearer Token Active
            </span>
            <span className="flex items-center gap-2 text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" /> bcrypt Password Encrypted
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
