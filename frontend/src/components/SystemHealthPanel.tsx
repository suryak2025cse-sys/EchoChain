import React, { useEffect, useState } from 'react';
import { fetchHealth } from '../services/api';
import type { HealthResponse } from '../types';
import { RefreshCw, Server, Database, Cpu, HardDrive, ShieldCheck } from 'lucide-react';

export const SystemHealthPanel: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadHealth = async () => {
    setLoading(true);
    const data = await fetchHealth();
    setHealth(data);
    setLoading(false);
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="light-card rounded-2xl p-6 sm:p-8 border border-gray-200">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Telemetry & Health</span>
          <h3 className="text-xl font-bold text-gray-900">SYSTEM HEALTH</h3>
        </div>
        <button
          onClick={loadHealth}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-mono text-gray-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Grid of Real System Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
        {/* API Check */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-gray-500 uppercase font-semibold">API Server</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${health?.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-bold text-gray-900">
              {health?.status === 'ok' ? 'Operational' : 'Degraded'}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono mt-1">v{health?.version || '1.0.0'}</span>
        </div>

        {/* Database Check */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-gray-500 uppercase font-semibold">Database</span>
            <Database className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${health?.database_status === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="font-bold text-gray-900 capitalize">
              {health?.database_status || 'Checking...'}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono mt-1">
            {health?.database_status === 'connected' ? 'PostgreSQL Active' : 'SQLite Dev Fallback'}
          </span>
        </div>

        {/* AI Service - Truthful Phase 5 Status */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col justify-between opacity-75">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-gray-500 uppercase font-semibold">AI Service</span>
            <Cpu className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full border border-gray-400" />
            <span className="font-bold text-gray-600">Planned</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono mt-1">Coming Phase 5</span>
        </div>

        {/* IPFS Node - Truthful Phase 8 Status */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col justify-between opacity-75">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-gray-500 uppercase font-semibold">IPFS Node</span>
            <HardDrive className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full border border-gray-400" />
            <span className="font-bold text-gray-600">Planned</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono mt-1">Coming Phase 8</span>
        </div>

        {/* Blockchain Ledger - Truthful Phase 10 Status */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col justify-between opacity-75">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-gray-500 uppercase font-semibold">Blockchain</span>
            <ShieldCheck className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full border border-gray-400" />
            <span className="font-bold text-gray-600">Planned</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono mt-1">Coming Phase 10</span>
        </div>
      </div>
    </div>
  );
};
