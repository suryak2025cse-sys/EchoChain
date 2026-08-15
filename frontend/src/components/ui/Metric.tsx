import React from 'react';

interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  accentColor?: string;
  className?: string;
}

export const Metric: React.FC<MetricProps> = ({
  label,
  value,
  unit,
  change,
  trend,
  isPositive = true,
  icon,
  accentColor = '#D4AF37',
  className = ''
}) => {
  const displayChange = change || trend;
  return (
    <div className={`p-6 rounded-sm bg-[#101311] border border-[#1D221F] flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest font-mono font-medium text-[#9A9A93]">
          {label}
        </span>
        {icon && <div style={{ color: accentColor }}>{icon}</div>}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl md:text-4xl font-serif font-light text-[#F5F3ED] tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-[#9A9A93] uppercase tracking-wider">
            {unit}
          </span>
        )}
      </div>

      {displayChange && (
        <div className="mt-3 text-xs font-mono flex items-center gap-1.5 pt-2 border-t border-[#1D221F]">
          <span className={isPositive ? 'text-[#7CC8A0]' : 'text-[#E36B6B]'}>
            {isPositive ? '↑' : '↓'} {displayChange}
          </span>
          <span className="text-[#9A9A93]">vs previous cycle</span>
        </div>
      )}
    </div>
  );
};
