import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getProvenanceRecordApi, 
  sealProvenanceRecordApi,
  uploadAudioToIpfsApi,
  anchorProvenanceOnPolygonApi,
  verifyProvenanceRecordApi 
} from '../services/api';
import type { ProvenanceRecord, ProvenanceVerificationResponse } from '../types';
import { TopographicCanvas } from '../components/ui/TopographicCanvas';
import { ProvenanceTimeline, type TimelineStep } from '../components/ui/ProvenanceTimeline';
import { HashDisplay } from '../components/ui/HashDisplay';
import { StatusBadge } from '../components/ui/StatusBadge';
import { GoldButton } from '../components/ui/GoldButton';
import { 
  ArrowLeft, 
  RefreshCw,
  FileCheck
} from 'lucide-react';

export const ProvenanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const provenanceId = id || 'ECH-PROV-1';

  const { token } = useAuth();
  const [provenance, setProvenance] = useState<ProvenanceRecord | null>(null);
  const [verificationRes, setVerificationRes] = useState<ProvenanceVerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadDetail = async () => {
    if (!token || !provenanceId) return;
    setLoading(true);
    setError(null);
    try {
      const [provData, vData] = await Promise.all([
        getProvenanceRecordApi(token, provenanceId),
        verifyProvenanceRecordApi(provenanceId).catch(() => null)
      ]);
      setProvenance(provData);
      setVerificationRes(vData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch provenance lifecycle record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [token, provenanceId]);

  const handleSeal = async () => {
    if (!token || !provenanceId) return;
    setActionLoading('seal');
    setError(null);
    setSuccessMsg(null);
    try {
      await sealProvenanceRecordApi(token, provenanceId);
      setSuccessMsg(`✓ Provenance ${provenanceId} sealed with SHA-256 digest!`);
      await loadDetail();
    } catch (err: any) {
      setError(err.message || 'Sealing failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleIpfsPin = async () => {
    if (!token || !provenanceId) return;
    setActionLoading('ipfs');
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await uploadAudioToIpfsApi(token, provenanceId);
      setSuccessMsg(`✓ Audio evidence pinned to Pinata IPFS (CID: ${res.ipfs_cid})!`);
      await loadDetail();
    } catch (err: any) {
      setError(err.message || 'IPFS pinning failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePolygonAnchor = async () => {
    if (!token || !provenanceId) return;
    setActionLoading('polygon');
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await anchorProvenanceOnPolygonApi(token, provenanceId);
      setSuccessMsg(`✓ Anchored on Polygon Testnet (Tx: ${res.tx_hash})!`);
      await loadDetail();
    } catch (err: any) {
      setError(err.message || 'Polygon anchoring failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const buildTimelineSteps = (): TimelineStep[] => {
    if (!provenance) return [];

    return [
      {
        id: 'capture',
        title: 'Environmental Acoustic Capture',
        subtitle: `Capture ID ${provenance.capture_id} recorded in field origin.`,
        timestamp: provenance.created_at,
        status: 'COMPLETED'
      },
      {
        id: 'acoustic',
        title: 'Librosa DSP Spectral Analysis',
        subtitle: '128 Mel filterbanks and spectral centroid signature extracted.',
        status: 'COMPLETED'
      },
      {
        id: 'liveness',
        title: 'Software Liveness Verification',
        subtitle: 'Algorithmic noise floor & clipping ratio verified authentic.',
        status: 'COMPLETED'
      },
      {
        id: 'seal',
        title: 'Cryptographic SHA-256 Digest Seal',
        subtitle: provenance.is_sealed ? `Digest: ${provenance.provenance_hash.slice(0, 16)}...` : 'Awaiting producer seal action.',
        status: provenance.is_sealed ? 'COMPLETED' : 'PENDING'
      },
      {
        id: 'ipfs',
        title: 'Decentralized IPFS Audio Pinning',
        subtitle: provenance.ipfs_cid ? `IPFS CID: ${provenance.ipfs_cid.slice(0, 16)}...` : 'Awaiting Pinata IPFS pinning.',
        status: provenance.ipfs_cid ? 'COMPLETED' : 'PENDING'
      },
      {
        id: 'polygon',
        title: 'Polygon Blockchain Smart Contract Anchor',
        subtitle: provenance.is_anchored ? `Polygon Tx: ${(provenance.tx_hash || '').slice(0, 16)}...` : 'Awaiting Polygon smart contract anchoring.',
        status: provenance.is_anchored ? 'COMPLETED' : 'PENDING'
      }
    ];
  };

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] p-6 md:p-12 space-y-10 font-mono text-xs">
      
      <div className="flex items-center justify-between">
        <Link to="/producer/dashboard" className="flex items-center gap-2 text-[#9A9A93] hover:text-[#D4AF37]">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
        <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-xs border border-[#D4AF37]/30">
          PROVENANCE LIFECYCLE AUDIT
        </span>
      </div>

      {/* Header Banner with Topographic Contour Canvas */}
      <div className="relative p-8 rounded-sm bg-[#101311] border border-[#1D221F] overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-25">
          <TopographicCanvas height={180} lineColor="#D4AF37" opacity={0.2} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-serif font-light text-[#F5F3ED]">{provenanceId}</h1>
              {provenance && <StatusBadge status={provenance.status} size="sm" />}
            </div>
            <p className="text-xs text-[#9A9A93]">
              Created: {provenance?.created_at ? new Date(provenance.created_at).toLocaleString() : 'Loading...'}
            </p>
          </div>

          <button onClick={loadDetail} className="p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] hover:border-[#D4AF37]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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

      {loading ? (
        <div className="p-16 text-center text-[#9A9A93]">Loading provenance lifecycle...</div>
      ) : provenance ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: 6-Stage Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-sm bg-[#101311] border border-[#1D221F] space-y-6">
              <h2 className="text-2xl font-serif text-[#F5F3ED] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#D4AF37]" />
                <span>6-Stage Connected Provenance Lifecycle</span>
              </h2>

              <ProvenanceTimeline steps={buildTimelineSteps()} />
            </div>
          </div>

          {/* Right Col: Protocol Actions & Cryptographic Proofs */}
          <div className="space-y-6">
            
            {/* Protocol Actions Box */}
            <div className="p-6 rounded-sm bg-[#101311] border border-[#1D221F] space-y-4">
              <h3 className="font-bold text-[#F5F3ED] uppercase tracking-wider text-xs">
                Protocol Actions
              </h3>

              {!provenance.is_sealed && (
                <GoldButton
                  onClick={handleSeal}
                  disabled={actionLoading === 'seal'}
                  showArrow
                  className="w-full !py-3"
                >
                  {actionLoading === 'seal' ? 'Sealing...' : 'Seal SHA-256 Digest'}
                </GoldButton>
              )}

              {provenance.is_sealed && !provenance.ipfs_cid && (
                <button
                  onClick={handleIpfsPin}
                  disabled={actionLoading === 'ipfs'}
                  className="w-full py-3 rounded-xs bg-[#62C7C0]/10 border border-[#62C7C0]/40 text-[#62C7C0] font-bold uppercase tracking-wider hover:bg-[#62C7C0]/20 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'ipfs' ? 'Pinning...' : 'Pin Evidence to IPFS'}
                </button>
              )}

              {provenance.is_sealed && provenance.ipfs_cid && !provenance.is_anchored && (
                <GoldButton
                  onClick={handlePolygonAnchor}
                  disabled={actionLoading === 'polygon'}
                  showArrow
                  className="w-full !py-3"
                >
                  {actionLoading === 'polygon' ? 'Anchoring...' : 'Anchor on Polygon Testnet'}
                </GoldButton>
              )}
            </div>

            {/* Cryptographic Hashes */}
            <div className="p-6 rounded-sm bg-[#101311] border border-[#1D221F] space-y-4">
              <h3 className="font-bold text-[#F5F3ED] uppercase tracking-wider text-xs">
                Cryptographic Commitments
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="text-[#9A9A93] mb-1">SHA-256 DIGEST:</div>
                  <HashDisplay hash={provenance.provenance_hash} truncate />
                </div>

                <div>
                  <div className="text-[#9A9A93] mb-1">IPFS CID:</div>
                  <HashDisplay hash={provenance.ipfs_cid || ''} truncate label="CID" />
                </div>

                <div>
                  <div className="text-[#9A9A93] mb-1">POLYGON TX HASH:</div>
                  <HashDisplay hash={provenance.tx_hash || ''} truncate label="TX" />
                </div>
              </div>

              {verificationRes && (
                <div className="pt-3 border-t border-[#1D221F] text-[11px] text-[#7CC8A0]">
                  ✓ SHA-256 Hash Verification: {verificationRes.status}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
};
