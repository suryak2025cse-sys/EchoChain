import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchCertifierQueueApi, 
  fetchCertifierReviewDetailApi, 
  decideProvenanceApi,
  fetchAuditLogsApi 
} from '../services/api';
import type { 
  ProvenanceRecord, 
  CertifierReviewDetail, 
  AuditLogEntry 
} from '../types';
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';
import { Metric } from '../components/ui/Metric';
import { StatusBadge } from '../components/ui/StatusBadge';
import { HashDisplay } from '../components/ui/HashDisplay';
import { AudioPlayer } from '../components/ui/AudioPlayer';
import { SpectrogramCanvas } from '../components/ui/SpectrogramCanvas';
import { GoldButton } from '../components/ui/GoldButton';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  RefreshCw, 
  Check,
  X,
  Flag,
  FileText
} from 'lucide-react';

export const CertifierDashboardPage: React.FC = () => {
  const { token, user } = useAuth();
  const [queue, setQueue] = useState<ProvenanceRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [reviewDetail, setReviewDetail] = useState<CertifierReviewDetail | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [queueRes, logsRes] = await Promise.all([
        fetchCertifierQueueApi(token),
        fetchAuditLogsApi(token, 30)
      ]);
      setQueue(queueRes.items);
      setAuditLogs(logsRes.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load certifier governance queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleSelectRecord = async (provId: string) => {
    if (!token) return;
    setSelectedRecordId(provId);
    setDetailLoading(true);
    setError(null);
    setSuccessMsg(null);
    setDecisionReason('');
    try {
      const res = await fetchCertifierReviewDetailApi(token, provId);
      setReviewDetail(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch detailed evidence payload.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExecuteDecision = async (decision: 'APPROVE' | 'REJECT' | 'FLAG') => {
    if (!token || !selectedRecordId) return;
    if (!decisionReason || decisionReason.trim().length < 3) {
      setError('Please provide a mandatory audit note / rationale for your decision (min 3 characters).');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await decideProvenanceApi(token, selectedRecordId, decision, decisionReason.trim());
      setSuccessMsg(`✓ Provenance ${selectedRecordId} decision recorded: ${decision}!`);
      setReviewDetail(null);
      setSelectedRecordId(null);
      setDecisionReason('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Governance decision submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQueue = queue.filter(item => {
    const matchesSearch = 
      item.provenance_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.capture_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.product_id && item.product_id.toString().includes(searchQuery));
    return matchesSearch;
  });

  const detailProduct = reviewDetail ? (reviewDetail.product || reviewDetail) : null;
  const detailAcoustic = reviewDetail ? (reviewDetail.acoustic_fingerprint || reviewDetail) : null;
  const detailAudioUrl = reviewDetail ? (reviewDetail.audio_capture?.stream_url || (reviewDetail as any).audio_stream_url) : null;
  const detailLiveness = reviewDetail ? (reviewDetail.liveness_evidence || reviewDetail) : null;

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] p-6 md:p-12 space-y-10 font-mono text-xs">
      
      {/* Header Banner */}
      <div className="relative p-8 rounded-sm bg-[#101311] border border-[#1D221F] overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-30">
          <EcosystemWaveform height={160} color="#62C7C0" speed={0.015} />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#080A09] border border-[#62C7C0]/30 text-xs text-[#62C7C0]">
            <ShieldCheck className="w-3.5 h-3.5" /> CERTIFIER & REGULATOR GOVERNANCE DASHBOARD
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-light text-[#F5F3ED]">
            Certifier Audit Center — <span className="text-[#62C7C0] font-normal">{user?.fullName}</span>
          </h1>
          <p className="text-xs text-[#9A9A93]">
            Role: {user?.role} • Immutable Audit Trail & Decision Log
          </p>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Metric
          label="Governance Queue"
          value={queue.length}
          unit="RECORDS"
          accentColor="#62C7C0"
          icon={<ShieldCheck className="w-4 h-4" />}
        />
        <Metric
          label="Pending Review"
          value={queue.filter(q => (q.status as string) === 'PENDING' || (q.status as string) === 'SEALED' || (q.status as string) === 'DRAFT').length}
          unit="AWAITING AUDIT"
          accentColor="#E4B95C"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <Metric
          label="Approved Provenance"
          value={queue.filter(q => (q.status as string) === 'VERIFIED' || (q.status as string) === 'APPROVED' || (q.status as string) === 'ANCHORED').length}
          unit="VERIFIED"
          accentColor="#D4AF37"
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <Metric
          label="Flagged Threats"
          value={queue.filter(q => (q.status as string) === 'FLAGGED' || (q.status as string) === 'REJECTED').length}
          unit="ALERTS"
          accentColor="#E36B6B"
          icon={<XCircle className="w-4 h-4" />}
        />
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xs bg-[#7CC8A0]/10 border border-[#7CC8A0]/40 text-[#7CC8A0]">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B]">
          {error}
        </div>
      )}

      {/* Audit Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Queue List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-[#F5F3ED]">Provenance Queue</h2>
            <button onClick={loadData} className="p-2 rounded-xs bg-[#101311] border border-[#1D221F] text-[#9A9A93] hover:text-[#F5F3ED]">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 rounded-xs bg-[#101311] border border-[#1D221F] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#9A9A93]" />
            <input
              type="text"
              placeholder="Filter by ID, product, capture..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-[#F5F3ED] placeholder-[#9A9A93]"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-[#9A9A93]">Loading governance queue...</div>
            ) : filteredQueue.length === 0 ? (
              <div className="p-8 text-center text-[#9A9A93]">No matching records found</div>
            ) : (
              filteredQueue.map(item => {
                const isSelected = selectedRecordId === item.provenance_id;
                return (
                  <div
                    key={item.provenance_id}
                    onClick={() => handleSelectRecord(item.provenance_id)}
                    className={`p-4 rounded-xs border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-[#161B18] border-[#D4AF37] shadow-md'
                        : 'bg-[#101311] border-[#1D221F] hover:border-[#62C7C0]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#D4AF37]">{item.provenance_id}</span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>

                    <div className="text-[#9A9A93]">
                      Capture ID: <span className="text-[#F5F3ED]">{item.capture_id}</span>
                    </div>

                    {item.provenance_hash && (
                      <HashDisplay hash={item.provenance_hash} truncate label="SHA" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Evidence Inspector & Decision Form */}
        <div className="lg:col-span-2 space-y-6">
          {detailLoading ? (
            <div className="p-16 text-center rounded-xs bg-[#101311] border border-[#1D221F] text-[#9A9A93]">
              Fetching full cryptographic & acoustic evidence payload...
            </div>
          ) : reviewDetail ? (
            <div className="p-8 rounded-sm bg-[#101311] border border-[#1D221F] space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#1D221F] pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-serif text-[#F5F3ED]">{reviewDetail.provenance_id}</h3>
                    <StatusBadge status={reviewDetail.status} size="sm" />
                  </div>
                  <p className="text-[#9A9A93] mt-1">
                    Submitted for Certifier Audit & Verification
                  </p>
                </div>
              </div>

              {/* Product & Origin */}
              {detailProduct && (
                <div className="p-4 rounded-xs bg-[#080A09] border border-[#1D221F] grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[#9A9A93]">PRODUCT NAME</div>
                    <div className="text-[#F5F3ED] font-bold mt-0.5">{detailProduct.product_name || 'Agri Batch'}</div>
                  </div>
                  <div>
                    <div className="text-[#9A9A93]">REGION / COUNTRY</div>
                    <div className="text-[#62C7C0] mt-0.5">{detailProduct.region || 'Sidama'}, {detailProduct.country || 'Ethiopia'}</div>
                  </div>
                  <div>
                    <div className="text-[#9A9A93]">HARVEST DATE</div>
                    <div className="text-[#F5F3ED] mt-0.5">{detailProduct.harvest_date || '2026-08-14'}</div>
                  </div>
                </div>
              )}

              {/* Spectrogram Canvas */}
              {detailAcoustic && (
                <SpectrogramCanvas featureVector={detailAcoustic.feature_vector || detailAcoustic} height={160} />
              )}

              {/* Audio Player */}
              {detailAudioUrl && (
                <AudioPlayer src={detailAudioUrl} title="Environmental Acoustic Evidence" />
              )}

              {/* Liveness Metrics */}
              {detailLiveness && detailLiveness.liveness_score !== undefined && (
                <div className="p-4 rounded-xs bg-[#080A09] border border-[#1D221F] flex items-center justify-between">
                  <div>
                    <span className="text-[#9A9A93]">LIVENESS SCORE: </span>
                    <span className="text-[#D4AF37] font-bold text-sm">{detailLiveness.liveness_score} / 100</span>
                  </div>
                  <div>
                    <span className="text-[#9A9A93]">REPLAY RISK: </span>
                    <StatusBadge status={detailLiveness.replay_risk || 'LOW'} size="sm" />
                  </div>
                </div>
              )}

              {/* Governance Decision Form */}
              <div className="pt-4 border-t border-[#1D221F] space-y-4">
                <h4 className="font-bold text-[#F5F3ED] uppercase tracking-wider">Certifier Audit Decision</h4>
                
                <div>
                  <label className="block text-[#9A9A93] mb-1.5 font-semibold">
                    Mandatory Audit Note & Decision Rationale
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter audit investigation notes or rationale for approval/rejection..."
                    value={decisionReason}
                    onChange={e => setDecisionReason(e.target.value)}
                    className="w-full p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] placeholder-[#9A9A93] outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <GoldButton
                    onClick={() => handleExecuteDecision('APPROVE')}
                    disabled={submitting || !decisionReason.trim()}
                    className="flex-1 !py-3"
                  >
                    <Check className="w-4 h-4 inline mr-1" /> Approve Provenance
                  </GoldButton>

                  <button
                    onClick={() => handleExecuteDecision('FLAG')}
                    disabled={submitting || !decisionReason.trim()}
                    className="flex-1 py-3 rounded-xs bg-[#E4B95C]/10 border border-[#E4B95C]/40 text-[#E4B95C] font-bold uppercase tracking-wider hover:bg-[#E4B95C]/20 transition-colors disabled:opacity-50"
                  >
                    <Flag className="w-4 h-4 inline mr-1" /> Flag Suspicious
                  </button>

                  <button
                    onClick={() => handleExecuteDecision('REJECT')}
                    disabled={submitting || !decisionReason.trim()}
                    className="flex-1 py-3 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B] font-bold uppercase tracking-wider hover:bg-[#E36B6B]/20 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4 inline mr-1" /> Reject Record
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-16 text-center rounded-xs bg-[#101311] border border-[#1D221F] text-[#9A9A93] space-y-3">
              <FileText className="w-8 h-8 mx-auto text-[#9A9A93]" />
              <div className="text-sm font-semibold text-[#F5F3ED]">No Provenance Record Selected</div>
              <p className="max-w-sm mx-auto">Select a record from the governance queue on the left to inspect raw evidence and issue audit decisions.</p>
            </div>
          )}

          {/* Audit Logs Table */}
          <div className="rounded-sm bg-[#101311] border border-[#1D221F] p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F5F3ED] uppercase tracking-wider">
              Immutable Governance Audit Log
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#080A09] text-[#9A9A93] border-b border-[#1D221F] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D221F] text-[#9A9A93]">
                  {auditLogs.slice(0, 10).map(log => (
                    <tr key={log.id} className="hover:bg-[#161B18]">
                      <td className="py-3 px-4 text-[#F5F3ED]">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4 text-[#D4AF37] font-bold">{log.action}</td>
                      <td className="py-3 px-4">{log.user_id}</td>
                      <td className="py-3 px-4 text-[#F5F3ED]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
