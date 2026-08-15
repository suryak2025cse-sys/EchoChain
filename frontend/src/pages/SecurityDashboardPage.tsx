import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchSecurityEventsApi, runSecurityScanApi } from '../services/api';
import type { SecurityEvent } from '../types';
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';
import { Metric } from '../components/ui/Metric';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ShieldAlert, RefreshCw, AlertOctagon, Scan, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SecurityDashboardPage: React.FC = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const loadSecurityEvents = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSecurityEventsApi(token, { limit: 50 });
      setEvents(res.items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch security events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityEvents();
  }, [token]);

  const handleRunScan = async () => {
    if (!token) return;
    setScanning(true);
    setError(null);
    setScanResult(null);
    try {
      const res = await runSecurityScanApi(token);
      setScanResult(`✓ Automated scan complete: Evaluated ${res.scanned_records} records, generated ${res.events_generated} event alerts.`);
      await loadSecurityEvents();
    } catch (err: any) {
      setError(err.message || 'Scan failed.');
    } finally {
      setScanning(false);
    }
  };

  const criticalCount = events.filter(e => e.risk_level === 'CRITICAL').length;
  const highCount = events.filter(e => e.risk_level === 'HIGH').length;

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] p-6 md:p-12 space-y-8 font-mono text-xs">
      
      <div className="flex items-center justify-between">
        <Link to="/certifier/dashboard" className="flex items-center gap-2 text-[#9A9A93] hover:text-[#D4AF37]">
          <ArrowLeft className="w-4 h-4" /> Return to Certifier Dashboard
        </Link>
        <span className="text-[#E36B6B] bg-[#E36B6B]/10 px-3 py-1 rounded-xs border border-[#E36B6B]/30">
          SOC THREAT MONITORING ACTIVE
        </span>
      </div>

      <div className="relative p-8 rounded-sm bg-[#101311] border border-[#1D221F] overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-30">
          <EcosystemWaveform height={160} color="#E36B6B" speed={0.02} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#080A09] border border-[#1D221F] text-xs text-[#E36B6B]">
              <ShieldAlert className="w-3.5 h-3.5" /> REPLAY ATTACK & FRAUD MONITORING
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-light text-[#F5F3ED]">
              Security Operations Center (SOC)
            </h1>
            <p className="text-xs text-[#9A9A93]">
              Real-Time Replay Attack Detection, Hash Mismatch, & Provenance Fraud Alerts
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRunScan}
              disabled={scanning}
              className="px-5 py-3 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B] font-bold uppercase tracking-wider hover:bg-[#E36B6B]/20 flex items-center gap-2 disabled:opacity-50"
            >
              <Scan className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning Workspace...' : 'Run Security Audit Scan'}</span>
            </button>
          </div>
        </div>
      </div>

      {scanResult && (
        <div className="p-4 rounded-xs bg-[#7CC8A0]/10 border border-[#7CC8A0]/40 text-[#7CC8A0]">
          {scanResult}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Metric
          label="Total Threat Events"
          value={events.length}
          unit="ALERTS"
          accentColor="#E36B6B"
          icon={<ShieldAlert className="w-4 h-4" />}
        />
        <Metric
          label="Critical Threats"
          value={criticalCount}
          unit="ACTION REQ"
          accentColor="#E36B6B"
          icon={<AlertOctagon className="w-4 h-4" />}
        />
        <Metric
          label="High Severity"
          value={highCount}
          unit="HIGH RISK"
          accentColor="#E4B95C"
          icon={<AlertOctagon className="w-4 h-4" />}
        />
        <Metric
          label="Automated Scanner"
          value="ACTIVE"
          unit="CONTINUOUS"
          accentColor="#7CC8A0"
          icon={<Scan className="w-4 h-4" />}
        />
      </div>

      {/* Security Threat Stream Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif text-[#F5F3ED]">Threat Event Stream</h2>
          <button onClick={loadSecurityEvents} className="p-2 rounded-xs bg-[#101311] border border-[#1D221F] text-[#9A9A93] hover:text-[#F5F3ED]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#9A9A93]">Querying security telemetry database...</div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center rounded-xs bg-[#101311] border border-[#1D221F] text-[#9A9A93]">
            No threat events detected. System operating within normal parameters.
          </div>
        ) : (
          <div className="rounded-sm bg-[#101311] border border-[#1D221F] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#080A09] text-[#9A9A93] border-b border-[#1D221F] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-4 px-5">Timestamp</th>
                    <th className="py-4 px-5">Event Type</th>
                    <th className="py-4 px-5">Risk Level</th>
                    <th className="py-4 px-5">Detector / Provenance</th>
                    <th className="py-4 px-5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D221F] text-[#F5F3ED]">
                  {events.map(evt => (
                    <tr key={evt.id} className="hover:bg-[#161B18]">
                      <td className="py-4 px-5 text-[#9A9A93]">{new Date(evt.created_at).toLocaleString()}</td>
                      <td className="py-4 px-5 font-bold text-[#E36B6B]">{evt.event_type}</td>
                      <td className="py-4 px-5">
                        <StatusBadge status={evt.risk_level} size="sm" />
                      </td>
                      <td className="py-4 px-5 text-[#D4AF37]">
                        {evt.detector_name || evt.provenance_id || 'SYSTEM'}
                      </td>
                      <td className="py-4 px-5 text-[#9A9A93]">{evt.description}</td>
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
