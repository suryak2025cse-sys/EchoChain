import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchSecurityEventsApi,
  fetchSecurityMetricsApi,
  runSecurityScanApi,
  resolveSecurityEventApi
} from '../services/api';
import type {
  SecurityEvent,
  SecurityMetricsSummary,
  SecurityScanResult
} from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Info,
  Radio,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  FileCode2,
  ChevronRight,
  Filter
} from 'lucide-react';

export const SecurityDashboardPage: React.FC = () => {
  const { token } = useAuth();

  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [metrics, setMetrics] = useState<SecurityMetricsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanning, setScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Filters
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected event for detail modal
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<'RESOLVED' | 'FALSE_POSITIVE' | 'INVESTIGATING'>('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [resolving, setResolving] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      loadSecurityData();
    }
  }, [token, riskFilter, statusFilter, typeFilter]);

  const loadSecurityData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [eventsRes, metricsRes] = await Promise.all([
        fetchSecurityEventsApi(token, {
          riskLevel: riskFilter || undefined,
          status: statusFilter || undefined,
          eventType: typeFilter || undefined,
          limit: 100
        }),
        fetchSecurityMetricsApi(token)
      ]);
      setEvents(eventsRes.items);
      setTotal(eventsRes.total);
      setMetrics(metricsRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load security monitoring data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunScan = async () => {
    if (!token) return;
    setScanning(true);
    setScanMessage(null);
    setError(null);
    try {
      const result: SecurityScanResult = await runSecurityScanApi(token);
      setScanMessage(result.summary_message);
      await loadSecurityData();
    } catch (err: any) {
      setError(err.message || 'Security scan execution failed.');
    } finally {
      setScanning(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedEvent || !resolutionNotes.trim()) return;
    setResolving(true);
    try {
      const updated = await resolveSecurityEventApi(token, selectedEvent.event_id, resolutionStatus, resolutionNotes);
      setEvents(prev => prev.map(ev => ev.event_id === updated.event_id ? updated : ev));
      setSelectedEvent(null);
      setResolutionNotes('');
      await loadSecurityData();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve security event.');
    } finally {
      setResolving(false);
    }
  };

  const filteredEvents = events.filter(ev => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      ev.event_id.toLowerCase().includes(term) ||
      ev.event_type.toLowerCase().includes(term) ||
      (ev.provenance_id && ev.provenance_id.toLowerCase().includes(term)) ||
      (ev.capture_id && ev.capture_id.toLowerCase().includes(term)) ||
      ev.description.toLowerCase().includes(term)
    );
  });

  const getRiskBadge = (risk: string) => {
    switch (risk.toUpperCase()) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5" /> CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 border border-orange-500/40 text-orange-400">
            <AlertTriangle className="w-3.5 h-3.5" /> HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Info className="w-3.5 h-3.5" /> MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 border border-blue-500/40 text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" /> LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30">
            OPEN
          </span>
        );
      case 'INVESTIGATING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            INVESTIGATING
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> RESOLVED
          </span>
        );
      case 'FALSE_POSITIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/30">
            <XCircle className="w-3 h-3" /> FALSE POSITIVE
          </span>
        );
      default:
        return <span className="text-xs text-gray-400">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400">
                  Security & Fraud Detection Monitor
                </h1>
                <p className="text-sm text-slate-400">
                  Real-time algorithmic fraud detection for EchoChain audio provenance ({total} events logged)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunScan}
              disabled={scanning}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-950/50 border border-red-500/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Scanning System...' : 'Run Full Security Scan'}
            </button>
          </div>
        </div>

        {/* Scan Result Alert */}
        {scanMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold">Automated Security Audit Complete</div>
              <div className="text-xs text-emerald-400/90 mt-0.5">{scanMessage}</div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold">Security Monitor Alert</div>
              <div className="text-xs text-red-300/90 mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Metrics Summary Widgets */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-red-500/30 backdrop-blur shadow-lg space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold tracking-wider">
                <span>Critical Risk</span>
                <AlertOctagon className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-3xl font-black text-red-400">{metrics.by_risk_level?.CRITICAL || 0}</div>
              <p className="text-xs text-slate-500">Immediate tamper or hash alert</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-orange-500/30 backdrop-blur shadow-lg space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold tracking-wider">
                <span>High Risk</span>
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-3xl font-black text-orange-400">{metrics.by_risk_level?.HIGH || 0}</div>
              <p className="text-xs text-slate-500">Replay or metadata drift</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 backdrop-blur shadow-lg space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold tracking-wider">
                <span>Medium Risk</span>
                <Info className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400">{metrics.by_risk_level?.MEDIUM || 0}</div>
              <p className="text-xs text-slate-500">Duplicate or challenge reuse</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-lg space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold tracking-wider">
                <span>Active Open Threats</span>
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <div className="text-3xl font-black text-slate-100">{metrics.open_events}</div>
              <p className="text-xs text-slate-500">Out of {metrics.total_events} total logged events</p>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search threat events by ID, type, provenance ID, description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </div>

            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-red-500"
            >
              <option value="">All Risk Levels</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-red-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-red-500"
            >
              <option value="">All Event Types</option>
              <option value="DUPLICATE_CAPTURE">Duplicate Capture</option>
              <option value="REPLAYED_AUDIO">Replayed Audio</option>
              <option value="HASH_MISMATCH">Hash Mismatch</option>
              <option value="MODIFIED_METADATA">Modified Metadata</option>
              <option value="INVALID_BLOCKCHAIN_PROOF">Invalid Blockchain Proof</option>
              <option value="SUSPICIOUS_PROVENANCE_REUSE">Suspicious Provenance Reuse</option>
              <option value="REUSED_CHALLENGE">Reused Challenge</option>
            </select>
          </div>
        </div>

        {/* Security Event Table */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-400" />
              <p className="text-sm font-medium">Analyzing security events database...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <div className="text-lg font-bold text-slate-200">Zero Threat Indicators Detected</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No active security events matched your filter criteria. Click "Run Full Security Scan" to trigger real-time algorithmic fraud detection.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800 font-semibold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Event ID</th>
                    <th className="py-3.5 px-4">Risk Level</th>
                    <th className="py-3.5 px-4">Threat Type</th>
                    <th className="py-3.5 px-4">Associated Record</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEvents.map(ev => (
                    <tr key={ev.event_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-100">
                        {ev.event_id}
                      </td>

                      <td className="py-4 px-4">
                        {getRiskBadge(ev.risk_level)}
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-200">
                        <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs">
                          {ev.event_type}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono text-xs text-slate-400">
                        {ev.provenance_id ? (
                          <div className="text-amber-400 font-medium">{ev.provenance_id}</div>
                        ) : ev.capture_id ? (
                          <div className="text-blue-400">{ev.capture_id}</div>
                        ) : (
                          <div className="text-slate-500">System Entity</div>
                        )}
                      </td>

                      <td className="py-4 px-4 max-w-xs text-xs text-slate-300 truncate" title={ev.description}>
                        {ev.description}
                      </td>

                      <td className="py-4 px-4">
                        {getStatusBadge(ev.status)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedEvent(ev);
                            setResolutionStatus('RESOLVED');
                            setResolutionNotes(ev.resolution_notes || '');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                        >
                          Inspect <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Evidence & Resolution Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
              
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-slate-100">{selectedEvent.event_id}</span>
                    {getRiskBadge(selectedEvent.risk_level)}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-300 mt-1">
                    Detector: {selectedEvent.detector_name}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Threat Description */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs uppercase text-slate-400 font-bold tracking-wider">Threat Summary</div>
                <p className="text-sm text-slate-200">{selectedEvent.description}</p>
              </div>

              {/* Technical Evidence Indicators */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
                  <FileCode2 className="w-4 h-4 text-amber-400" /> Cryptographic & Algorithmic Evidence Indicators
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300/90 overflow-x-auto">
                  {JSON.stringify(selectedEvent.evidence_json, null, 2)}
                </pre>
              </div>

              {/* Resolution Form */}
              <form onSubmit={handleResolveSubmit} className="space-y-4 pt-2 border-t border-slate-800">
                <h4 className="text-sm font-bold text-slate-200">Administrator Resolution Action</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setResolutionStatus('RESOLVED')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      resolutionStatus === 'RESOLVED'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    RESOLVED
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolutionStatus('FALSE_POSITIVE')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      resolutionStatus === 'FALSE_POSITIVE'
                        ? 'bg-gray-500/20 border-gray-400 text-gray-300 shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    FALSE POSITIVE
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolutionStatus('INVESTIGATING')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      resolutionStatus === 'INVESTIGATING'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    INVESTIGATING
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Resolution Notes & Action Rationale (Required)
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter audit investigation findings, counter-measures taken, or rationale for resolution..."
                    value={resolutionNotes}
                    onChange={e => setResolutionNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={resolving || !resolutionNotes.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg disabled:opacity-50"
                  >
                    {resolving ? 'Updating...' : 'Save Resolution Action'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
