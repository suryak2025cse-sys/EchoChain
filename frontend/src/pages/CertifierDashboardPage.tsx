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
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  RefreshCw, 
  Lock, 
  Globe, 
  Sparkles, 
  Radio, 
  FileText, 
  UserCheck, 
  History,
  Check,
  X,
  Flag,
  Activity
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
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
      const res = await decideProvenanceApi(token, selectedRecordId, decision, decisionReason.trim());
      setSuccessMsg(`✓ Decision executed! Record ${res.provenance_id} set to ${res.new_status}. Audit log #${res.audit_log_id} recorded.`);
      
      // Refresh review detail & list
      await handleSelectRecord(selectedRecordId);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to execute certifier decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQueue = queue.filter(r => {
    const matchesSearch = r.provenance_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.batch_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'APPROVED':
      case 'VERIFIED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-700" /> Rejected
          </span>
        );
      case 'FLAGGED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-700" /> Flagged
          </span>
        );
      case 'SEALED':
      case 'READY_FOR_SEAL':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
            <Lock className="w-3 h-3 text-blue-700" /> Ready for Audit
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-gray-100 text-gray-700 border border-gray-300">
            {statusStr}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER & ROLE BADGE */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 shadow-xl bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-mono font-bold border border-purple-300">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              Auditor & Certifier Governance Portal
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Certifier Dashboard</h1>
            <p className="text-xs text-gray-600 font-mono">
              Signed in as <span className="font-bold text-gray-800">{user?.fullName}</span> ({user?.role} Role • Immutable Audit Enforcement)
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-mono font-bold flex items-center gap-2 shadow-sm transition"
          >
            <RefreshCw className={`w-4 h-4 text-purple-700 ${loading ? 'animate-spin' : ''}`} /> Refresh Queue
          </button>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MAIN SPLIT WORKSPACE: LEFT QUEUE, RIGHT AUDIT INSPECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: PROVENANCE QUEUE TABLE (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="light-card p-6 rounded-3xl border border-gray-200/80 bg-white shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-mono font-bold text-purple-800 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-600" /> Provenance Audit Queue
                </span>
                <span className="text-[11px] font-mono text-gray-500 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  {filteredQueue.length} Records
                </span>
              </div>

              {/* SEARCH & FILTERS */}
              <div className="space-y-3 font-mono text-xs">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Provenance or Batch ID..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {['ALL', 'READY_FOR_SEAL', 'SEALED', 'APPROVED', 'FLAGGED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                        statusFilter === st 
                          ? 'bg-purple-900 text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUEUE LIST */}
              {loading ? (
                <div className="py-12 text-center text-xs font-mono text-gray-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-700" /> Querying Supabase queue...
                </div>
              ) : filteredQueue.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-gray-400 border border-dashed rounded-2xl">
                  No records match the current filter.
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {filteredQueue.map((item) => {
                    const isSelected = selectedRecordId === item.provenance_id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectRecord(item.provenance_id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          isSelected 
                            ? 'bg-purple-50/80 border-purple-400 shadow-md ring-1 ring-purple-300' 
                            : 'bg-white hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-purple-900">
                            {item.provenance_id}
                          </span>
                          {getStatusBadge(item.status)}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-600 font-mono">
                          <span>Batch: <span className="font-semibold text-gray-900">{item.batch_id}</span></span>
                          <span>Liveness: <span className="font-semibold text-emerald-700">{item.liveness_score}%</span></span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-1 border-t border-gray-100">
                          <span>{item.region}, {item.country}</span>
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* IMMUTABLE AUDIT TRAIL LOGS PREVIEW */}
            <div className="light-card p-6 rounded-3xl border border-gray-200/80 bg-white shadow-xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-purple-600" /> Platform Immutable Audit Logs
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  Append-Only
                </span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {auditLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-gray-500 text-[10px]">
                      <span className="font-bold text-purple-800">#{log.id} • {log.action}</span>
                      <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-800 text-[10px] break-all">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: FULL EVIDENCE INSPECTION & DECISION WORKSPACE (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {!selectedRecordId ? (
              <div className="light-card p-12 rounded-3xl border border-dashed border-gray-300 bg-white text-center space-y-4">
                <ShieldCheck className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
                <h3 className="text-lg font-bold text-gray-800">Select a Provenance Record to Audit</h3>
                <p className="text-xs text-gray-500 font-mono max-w-md mx-auto">
                  Click on any provenance record from the left audit queue to review acoustic evidence, liveness score, SHA-256 commitment hash, IPFS CID, and Polygon blockchain proofs.
                </p>
              </div>
            ) : detailLoading ? (
              <div className="light-card p-12 rounded-3xl border border-gray-200 bg-white text-center font-mono text-xs text-gray-500 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-700 mx-auto" />
                <p>Loading 7 proof layers for <span className="font-bold text-gray-900">{selectedRecordId}</span>...</p>
              </div>
            ) : reviewDetail ? (
              <div className="space-y-6">

                {/* PROVENANCE HEADER & SHA-256 AUDIT CARD */}
                <div className="light-card p-6 rounded-3xl border border-purple-200 bg-white shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-widest">
                        Audit Inspection Target
                      </span>
                      <h2 className="text-2xl font-extrabold text-gray-900 font-mono">
                        {reviewDetail.provenance_id}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(reviewDetail.status)}
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {reviewDetail.hash_verification_status === 'VALID' ? '✓ SHA-256 VALID' : '❌ TAMPERED'}
                      </span>
                    </div>
                  </div>

                  {/* PROVENANCE RECORD METADATA */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Product & Brand</span>
                      <span className="font-bold text-gray-900">{reviewDetail.product.product_name}</span>
                    </div>

                    <div>
                      <span className="text-gray-500 block text-[10px]">Batch ID</span>
                      <span className="font-bold text-purple-800">{reviewDetail.product.batch_id}</span>
                    </div>

                    <div>
                      <span className="text-gray-500 block text-[10px]">Origin Terroir</span>
                      <span className="font-bold text-gray-900">{reviewDetail.product.region}, {reviewDetail.product.country}</span>
                    </div>

                    <div>
                      <span className="text-gray-500 block text-[10px]">Harvest Period</span>
                      <span className="font-bold text-gray-900">{reviewDetail.product.harvest_date}</span>
                    </div>
                  </div>
                </div>

                {/* 7 EVIDENCE PROOF LAYERS REVIEW TABS / CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* 1. REVIEW ACOUSTIC EVIDENCE & WAVEFORM PLAYER */}
                  <div className="light-card p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-800">
                      <span className="flex items-center gap-1.5">
                        <Radio className="w-4 h-4 text-cyan-600" /> 1. Acoustic Evidence
                      </span>
                      <span className="text-[10px] text-gray-500">{reviewDetail.audio_capture.duration}s</span>
                    </div>

                    <p className="text-[11px] text-gray-600 font-mono">
                      File: <span className="font-bold text-gray-800">{reviewDetail.audio_capture.file_name}</span> ({reviewDetail.audio_capture.sample_rate} Hz)
                    </p>

                    <audio 
                      controls 
                      src={reviewDetail.audio_capture.audio_stream_url} 
                      className="w-full h-9 rounded-lg"
                    />
                  </div>

                  {/* 2. REVIEW ACOUSTIC FINGERPRINT (MFCC) */}
                  <div className="light-card p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between font-bold text-purple-800">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-purple-600" /> 2. MFCC Fingerprint
                      </span>
                      <span className="text-[10px] bg-purple-100 px-2 py-0.5 rounded text-purple-800">32-Vector</span>
                    </div>

                    <div className="p-2 rounded bg-slate-900 text-emerald-400 font-mono text-[10px] break-all truncate">
                      {reviewDetail.acoustic_fingerprint.fingerprint}
                    </div>

                    <div className="flex justify-between text-[10px] text-gray-500 pt-1">
                      <span>Centroid: {reviewDetail.acoustic_fingerprint.spectral_centroid} Hz</span>
                      <span>ZCR: {reviewDetail.acoustic_fingerprint.zero_crossing_rate}</span>
                    </div>
                  </div>

                  {/* 3. REVIEW LIVENESS & REPLAY RISK */}
                  <div className="light-card p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> 3. Liveness Analysis
                      </span>
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {reviewDetail.liveness_evidence.liveness_score}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-[10px] text-gray-500 block">Replay Risk</span>
                        <span className="font-bold text-emerald-800">{reviewDetail.liveness_evidence.replay_risk}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-[10px] text-gray-500 block">SNR Floor</span>
                        <span className="font-bold text-gray-900">{reviewDetail.liveness_evidence.snr_db} dB</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. REVIEW HASH COMMITMENT */}
                  <div className="light-card p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between font-bold text-blue-800">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-blue-600" /> 4. SHA-256 Hash
                      </span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        ✓ Deterministic
                      </span>
                    </div>

                    <div className="p-2 rounded bg-gray-100 text-gray-800 text-[10px] break-all font-mono">
                      {reviewDetail.provenance_hash}
                    </div>
                  </div>

                  {/* 5. REVIEW IPFS DECENTRALIZED STORAGE */}
                  <div className="light-card p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between font-bold text-cyan-800">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-cyan-600" /> 5. IPFS CID Pinning
                      </span>
                    </div>

                    {reviewDetail.ipfs_metadata ? (
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500">CID: <span className="font-bold text-cyan-900">{reviewDetail.ipfs_metadata.ipfs_cid}</span></p>
                        <a 
                          href={reviewDetail.ipfs_metadata.gateway_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-cyan-700 hover:underline inline-flex items-center gap-1"
                        >
                          Pinata Gateway Link ↗
                        </a>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic">Not Pinned to IPFS yet</p>
                    )}
                  </div>

                  {/* 6. REVIEW POLYGON BLOCKCHAIN ANCHOR */}
                  <div className="light-card p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between font-bold text-purple-800">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" /> 6. Polygon EVM Anchor
                      </span>
                    </div>

                    {reviewDetail.polygon_anchor ? (
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500">Tx: <span className="font-bold text-purple-900">{reviewDetail.polygon_anchor.tx_hash?.slice(0, 16)}...</span></p>
                        <p className="text-[10px] text-gray-500">Block Height: #{reviewDetail.polygon_anchor.block_number}</p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic">Not Anchored on Polygon yet</p>
                    )}
                  </div>

                </div>

                {/* ============================================================ */}
                {/* CERTIFIER DECISION CONTROL PANEL & IMMUTABLE AUDIT LOGGING */}
                {/* ============================================================ */}
                <div className="light-card p-6 rounded-3xl border-2 border-purple-400 bg-white shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-xs font-mono font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-purple-600" /> Certifier Governance Decision Panel
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      Action generates immutable Audit Log
                    </span>
                  </div>

                  {/* MANDATORY REASON / COMPLIANCE RATIONALE INPUT */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold text-gray-800">
                      Auditor Compliance Notes & Rationale (Mandatory):
                    </label>
                    <textarea
                      rows={3}
                      value={decisionReason}
                      onChange={(e) => setDecisionReason(e.target.value)}
                      placeholder="Enter certification audit findings, compliance details, or reason for flag/rejection..."
                      className="w-full p-3 rounded-xl border border-gray-300 font-sans text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50/50"
                    />
                  </div>

                  {/* DECISION BUTTONS */}
                  <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                    
                    {/* APPROVE */}
                    <button
                      onClick={() => handleExecuteDecision('APPROVE')}
                      disabled={submitting}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Approve Provenance
                    </button>

                    {/* FLAGGED */}
                    <button
                      onClick={() => handleExecuteDecision('FLAG')}
                      disabled={submitting}
                      className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
                    >
                      <Flag className="w-4 h-4" /> Flag for Re-Audit
                    </button>

                    {/* REJECT */}
                    <button
                      onClick={() => handleExecuteDecision('REJECT')}
                      disabled={submitting}
                      className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reject Provenance
                    </button>

                  </div>
                </div>

                {/* RECORD-SPECIFIC AUDIT TRAIL */}
                <div className="light-card p-6 rounded-3xl border border-gray-200 bg-white shadow-xl space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="font-bold text-gray-900 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-purple-600" /> Audit Trail for {reviewDetail.provenance_id}
                    </span>
                    <span className="text-[10px] text-gray-500">Immutable Supabase Ledger</span>
                  </div>

                  <div className="space-y-2">
                    {reviewDetail.audit_trail.length === 0 ? (
                      <p className="text-gray-400 text-xs italic">No specific audit entries logged yet.</p>
                    ) : (
                      reviewDetail.audit_trail.map((log) => (
                        <div key={log.id} className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
                          <div className="flex justify-between text-[11px] text-purple-900 font-bold">
                            <span>#{log.id} • {log.action}</span>
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-[10px] text-gray-700 break-all">{log.details}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : null}
          </div>

        </div>

      </div>
    </div>
  );
};
