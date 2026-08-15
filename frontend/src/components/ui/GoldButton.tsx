import React from 'react';
import { ArrowRight } from 'lucide-react';

interface GoldButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  showArrow?: boolean;
}

export const GoldButton: React.FC<GoldButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  showArrow = false
}) => {
  if (variant === 'primary') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-6 py-3.5 rounded-sm bg-gold-metallic text-[#080A09] font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <span>{children}</span>
        {showArrow && <ArrowRight className="w-4 h-4 text-[#080A09]" />}
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3.5 rounded-sm bg-[#101311]/80 hover:bg-[#161B18] border border-[#1D221F] hover:border-[#D4AF37]/50 text-[#F5F3ED] font-mono text-xs font-medium uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span>{children}</span>
      {showArrow && <ArrowRight className="w-4 h-4 text-[#9A9A93]" />}
    </button>
  );
};
