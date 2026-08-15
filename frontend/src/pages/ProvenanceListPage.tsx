import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listProvenanceRecordsApi } from '../services/api';
import type { ProvenanceRecord } from '../types';
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';
import { StatusBadge } from '../components/ui/StatusBadge';
import { HashDisplay } from '../components/ui/HashDisplay';
import { ArrowLeft, RefreshCw, ArrowRight } from 'lucide-react';

export const ProvenanceListPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<ProvenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadList = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listProvenanceRecordsApi(token);
      setItems(res.items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch provenance directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] p-6 md:p-12 space-y-8 font-mono text-xs">
      
      <div className="flex items-center justify-between">
        <Link to="/producer/dashboard" className="flex items-center gap-2 text-[#9A9A93] hover:text-[#D4AF37]">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
        <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-xs border border-[#D4AF37]/30">
          PROVENANCE CERTIFICATE DATABASE
        </span>
      </div>

      <div className="relative p-8 rounded-sm bg-[#101311] border border-[#1D221F] overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-25">
          <EcosystemWaveform height={160} color="#D4AF37" speed={0.015} />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-serif font-light text-[#F5F3ED]">
              Provenance Certificates Database
            </h1>
            <p className="text-xs text-[#9A9A93]">
              Immutable SHA-256 Commitments & Polygon State Transitions
            </p>
          </div>

          <button onClick={loadList} className="p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] hover:border-[#D4AF37]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-[#9A9A93]">Loading provenance database...</div>
      ) : items.length === 0 ? (
        <div className="p-16 text-center rounded-xs bg-[#101311] border border-[#1D221F] text-[#9A9A93]">
          No provenance certificates recorded yet.
        </div>
      ) : (
        <div className="rounded-sm bg-[#101311] border border-[#1D221F] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#080A09] text-[#9A9A93] border-b border-[#1D221F] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-4 px-5">Provenance ID</th>
                  <th className="py-4 px-5">Capture ID</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">SHA-256 Digest</th>
                  <th className="py-4 px-5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D221F] text-[#F5F3ED]">
                {items.map(item => (
                  <tr key={item.provenance_id} className="hover:bg-[#161B18]">
                    <td className="py-4 px-5 font-bold text-[#D4AF37]">{item.provenance_id}</td>
                    <td className="py-4 px-5 text-[#9A9A93]">{item.capture_id}</td>
                    <td className="py-4 px-5">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-4 px-5">
                      <HashDisplay hash={item.provenance_hash} truncate label="SHA" />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/provenance/${item.provenance_id}`}
                        className="px-3 py-1.5 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] hover:border-[#D4AF37] inline-flex items-center gap-1"
                      >
                        <span>Lifecycle</span> <ArrowRight className="w-3 h-3" />
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
  );
};
