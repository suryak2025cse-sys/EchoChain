import React from 'react';
import { Logo } from './Logo';
import { GitBranch } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200/80 dark:border-emerald-500/20 bg-white dark:bg-[#070D0B] py-10 px-4 sm:px-6 lg:px-8 text-gray-600 dark:text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand Logo */}
        <Logo variant="full" />

        {/* Links */}
        <div className="flex flex-wrap items-center gap-6 font-semibold text-gray-700 dark:text-gray-300">
          <a href="#platform" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            Platform
          </a>
          <a href="#architecture" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            Architecture
          </a>
          <a href="#privacy" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            Privacy
          </a>
          <a href="#status" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            System Telemetry
          </a>
        </div>

        {/* System & Version */}
        <div className="flex items-center gap-4 font-mono text-[11px] text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> API Operational
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-amber-600 dark:text-amber-400" /> v1.0 Phase 1
          </span>
        </div>
      </div>
    </footer>
  );
};
