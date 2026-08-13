import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listProvenanceRecordsApi } from '../services/api';
import type { ProvenanceRecord } from '../types';

export const ProvenanceListPage: React.FC = () => {
  const { token } = useAuth();
  const [records, setRecords] = useState<ProvenanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listProvenanceRecordsApi(token || '');
        setRecords(data.items);
      } catch (err: any) {
        setError(err.message || 'Failed to load provenance records.');
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">
              <span>● EchoChain Provenance Engine</span>
            </div>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
              Provenance Records
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Tamper-evident product provenance certificates combining ambient audio captures, AI acoustic fingerprints, and software liveness verification.
            </p>
          </div>
          <Link
            to="/producer/products"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg font-medium transition"
          >
            ← Back to Products Dashboard
          </Link>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 font-mono text-sm space-x-3">
            <svg className="animate-spin h-5 w-5 text-emerald-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Fetching Provenance Records from Supabase...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="text-4xl">📜</div>
            <h3 className="text-lg font-semibold text-slate-200">No Provenance Records Assembled Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create a product batch and upload or record environmental audio signatures to assemble your first tamper-evident provenance record.
            </p>
            <Link
              to="/producer/products"
              className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
            >
              Go to Product Management
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-xs font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Provenance ID</th>
                    <th className="py-3 px-4">Batch ID</th>
                    <th className="py-3 px-4">Region Origin</th>
                    <th className="py-3 px-4">Fingerprint Hash</th>
                    <th className="py-3 px-4">Liveness & Risk</th>
                    <th className="py-3 px-4">Lifecycle Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        {rec.provenance_id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200">
                        {rec.batch_id}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-300">
                        {rec.region}, {rec.country}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {rec.fingerprint ? `${rec.fingerprint.slice(0, 10)}...` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-200 font-semibold">{rec.liveness_score}%</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            rec.replay_risk === 'LOW' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {rec.replay_risk}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/provenance/${rec.provenance_id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-medium rounded transition"
                        >
                          View Certificate →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
