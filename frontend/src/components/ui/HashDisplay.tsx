import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface HashDisplayProps {
  hash: string;
  label?: string;
  truncate?: boolean;
  linkUrl?: string;
}

export const HashDisplay: React.FC<HashDisplayProps> = ({
  hash,
  label,
  truncate = false,
  linkUrl
}) => {
  const [copied, setCopied] = useState(false);

  if (!hash) return <span className="text-[#9A9A93] font-mono text-xs">N/A</span>;

  const displayHash = truncate && hash.length > 20
    ? `${hash.slice(0, 10)}...${hash.slice(-8)}`
    : hash;

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center gap-2 bg-[#080A09] border border-[#1D221F] hover:border-[#D4AF37]/40 px-3 py-1.5 rounded-xs font-mono text-xs text-[#F5F3ED] transition-all">
      {label && <span className="text-[#9A9A93] uppercase text-[10px] tracking-wider font-semibold">{label}:</span>}
      <span className="text-[#D4AF37] font-semibold select-all">{displayHash}</span>

      <button
        type="button"
        onClick={handleCopy}
        className="text-[#9A9A93] hover:text-[#D4AF37] transition-colors p-0.5"
        title="Copy full hash to clipboard"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-[#7CC8A0]" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      {linkUrl && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#9A9A93] hover:text-[#62C7C0] transition-colors p-0.5"
          title="Open in external explorer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
};
