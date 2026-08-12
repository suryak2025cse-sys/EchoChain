import React, { useEffect, useState } from 'react';
import { fetchHealth } from '../services/api';
import type { HealthResponse } from '../types';
import { Activity, Database, Server, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const HealthBadge: React.FC = () => {
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
    const interval = setInterval(loadHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status?: string) => {
    if (status === 'ok' || status === 'connected') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
    if (status === 'degraded') {
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
    return <XCircle className="w-4 h-4 text-rose-400" />;
  };

  const getStatusColor = (status?: string) => {
    if (status === 'ok' || status === 'connected') return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
    if (status === 'degraded') return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
    return 'bg-rose-500/10 border-rose-500/30 text-rose-300';
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {/* API Health */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(health?.status)} transition-all`}>
        <Server className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-medium">Backend API:</span>
        {loading ? (
          <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
        ) : (
          <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px]">
            {getStatusIcon(health?.status)}
            {health?.status || 'Offline'}
          </span>
        )}
      </div>

      {/* Database Health */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(health?.database_status)} transition-all`}>
        <Database className="w-3.5 h-3.5 text-purple-400" />
        <span className="font-medium">PostgreSQL DB:</span>
        {loading ? (
          <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
        ) : (
          <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px]">
            {getStatusIcon(health?.database_status)}
            {health?.database_status || 'Disconnected'}
          </span>
        )}
      </div>

      {/* Refresh Trigger */}
      <button
        onClick={loadHealth}
        disabled={loading}
        title="Check Status Now"
        className="p-1.5 rounded-full bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 text-gray-400 hover:text-white transition-colors"
      >
        <Activity className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
      </button>
    </div>
  );
};
