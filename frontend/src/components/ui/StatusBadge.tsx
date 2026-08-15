import React from 'react';
import { CheckCircle2, Clock, AlertOctagon, Lock, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase();

  let bg = 'bg-[#101311] text-[#9A9A93] border-[#1D221F]';
  let icon = <Clock className="w-3.5 h-3.5" />;
  let label = norm;

  if (norm.includes('VERIFIED') || norm.includes('APPROVED') || norm.includes('ANCHORED') || norm === 'VALID') {
    bg = 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/40';
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />;
    label = norm.replace('_', ' ');
  } else if (norm.includes('SEALED') || norm.includes('IPFS')) {
    bg = 'bg-[#62C7C0]/10 text-[#62C7C0] border-[#62C7C0]/40';
    icon = <Lock className="w-3.5 h-3.5 text-[#62C7C0]" />;
    label = norm.replace('_', ' ');
  } else if (norm.includes('PENDING') || norm.includes('DRAFT') || norm.includes('UNVERIFIED')) {
    bg = 'bg-[#E4B95C]/10 text-[#E4B95C] border-[#E4B95C]/40';
    icon = <Clock className="w-3.5 h-3.5 text-[#E4B95C] animate-pulse" />;
    label = norm.replace('_', ' ');
  } else if (norm.includes('FLAGGED') || norm.includes('REJECTED') || norm.includes('REPLAY') || norm.includes('CRITICAL') || norm.includes('HIGH')) {
    bg = 'bg-[#E36B6B]/10 text-[#E36B6B] border-[#E36B6B]/40';
    icon = <AlertOctagon className="w-3.5 h-3.5 text-[#E36B6B]" />;
    label = norm.replace('_', ' ');
  } else if (norm === 'PRODUCER' || norm === 'CERTIFIER' || norm === 'ADMIN') {
    bg = 'bg-[#7CC8A0]/10 text-[#7CC8A0] border-[#7CC8A0]/40';
    icon = <ShieldCheck className="w-3.5 h-3.5 text-[#7CC8A0]" />;
    label = norm;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : size === 'lg' ? 'px-4 py-1.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-xs font-mono font-bold uppercase tracking-wider border ${padding} ${bg}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};
