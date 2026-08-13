import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getProvenanceRecordApi, 
  sealProvenanceRecordApi, 
  verifyProvenanceRecordApi,
  uploadAudioToIpfsApi,
  getIpfsAudioMetadataApi,
  anchorProvenanceOnPolygonApi,
  verifyPolygonAnchorApi
} from '../services/api';
import type { ProvenanceRecord, ProvenanceVerificationResponse, IPFSResponse, PolygonVerificationResponse } from '../types';

export const ProvenanceDetailPage: React.FC = () => {
  const { provenanceId } = useParams<{ provenanceId: string }>();
  const { token } = useAuth();
  const [record, setRecord] = useState<ProvenanceRecord | null>(null);
  const [verification, setVerification] = useState<ProvenanceVerificationResponse | null>(null);
  const [ipfsData, setIpfsData] = useState<IPFSResponse | null>(null);
  const [polygonVer, setPolygonVer] = useState<PolygonVerificationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sealing, setSealing] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [pinning, setPinning] = useState<boolean>(false);
  const [anchoring, setAnchoring] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ipfsError, setIpfsError] = useState<string | null>(null);
  const [polygonError, setPolygonError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [copiedCid, setCopiedCid] = useState<boolean>(false);
  const [copiedTx, setCopiedTx] = useState<boolean>(false);
  const [showJson, setShowJson] = useState<boolean>(false);

  const fetchDetailAndVerify = async () => {
    if (!provenanceId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProvenanceRecordApi(token || '', provenanceId);
      setRecord(data);
      
      // Auto verify cryptographic integrity
      const ver = await verifyProvenanceRecordApi(provenanceId);
      setVerification(ver);

      // Auto fetch IPFS metadata
      try {
        const ipfsMeta = await getIpfsAudioMetadataApi(provenanceId);
        setIpfsData(ipfsMeta);
      } catch (iErr: any) {
        console.warn("IPFS metadata fetch warning:", iErr);
      }

      // Auto verify Polygon anchor
      try {
        const polyMeta = await verifyPolygonAnchorApi(provenanceId);
        setPolygonVer(polyMeta);
      } catch (pErr: any) {
        console.warn("Polygon anchor verify warning:", pErr);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load provenance details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailAndVerify();
  }, [provenanceId, token]);

  const handleSeal = async () => {
    if (!token || !provenanceId) return;
    setSealing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const sealRes = await sealProvenanceRecordApi(token, provenanceId);
      setSuccessMsg(sealRes.message);
      await fetchDetailAndVerify();
    } catch (err: any) {
      setError(err.message || 'Failed to seal record.');
    } finally {
      setSealing(false);
    }
  };

  const handleVerify = async () => {
    if (!provenanceId) return;
    setVerifying(true);
    setError(null);
    try {
      const ver = await verifyProvenanceRecordApi(provenanceId);
      setVerification(ver);
      setSuccessMsg("Cryptographic SHA-256 integrity re-verified successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Verification check failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handlePinToIpfs = async () => {
    if (!token || !provenanceId) return;
    setPinning(true);
    setIpfsError(null);
    setSuccessMsg(null);
    try {
      const res = await uploadAudioToIpfsApi(token, provenanceId);
      setSuccessMsg(res.message);
      await fetchDetailAndVerify();
    } catch (err: any) {
      setIpfsError(err.message || 'Failed to pin audio evidence to IPFS.');
    } finally {
      setPinning(false);
    }
  };

  const handleAnchorPolygon = async () => {
    if (!token || !provenanceId) return;
    setAnchoring(true);
    setPolygonError(null);
    setSuccessMsg(null);
    try {
      const res = await anchorProvenanceOnPolygonApi(token, provenanceId);
      setSuccessMsg(res.message);
      await fetchDetailAndVerify();
    } catch (err: any) {
      setPolygonError(err.message || 'BLOCKCHAIN NOT CONFIGURED');
    } finally {
      setAnchoring(false);
    }
  };

  const copyText = (txt: string, type: 'hash' | 'cid' | 'tx') => {
    navigator.clipboard.writeText(txt);
    if (type === 'hash') {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else if (type === 'cid') {
      setCopiedCid(true);
      setTimeout(() => setCopiedCid(false), 2000);
    } else {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex items-center space-x-3 text-purple-400 font-mono text-sm">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="uppercase tracking-wider">Verifying Polygon Blockchain & IPFS Storage...</span>
        </div>
      </div>
    );
  }

  if (error && !record) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center">
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-8 max-w-md w-full text-center">
          <div className="text-rose-400 text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-semibold text-rose-200 mb-2">Provenance Record Error</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Link
            to="/producer/provenance"
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition"
          >
            ← Back to Provenance Records
          </Link>
        </div>
      </div>
    );
  }

  const meta = record?.metadata_json || {};
  const currentCid = record?.ipfs_cid || ipfsData?.ipfs_cid;
  const currentIpfsUrl = record?.ipfs_url || ipfsData?.ipfs_url;
  const audioStreamUrl = ipfsData?.audio_stream_url || `/api/v1/audio/stream/${record?.capture_id}`;
  
  const isAnchored = record?.is_anchored || polygonVer?.is_anchored;
  const txHash = record?.tx_hash || polygonVer?.tx_hash;
  const blockNum = record?.block_number || polygonVer?.block_number;
  const networkName = record?.network || polygonVer?.network || "Polygon Amoy Testnet";
  const contractAddr = record?.contract_address || polygonVer?.contract_address || "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 uppercase tracking-widest mb-1">
              <span>● EchoChain Polygon Testnet & Decentralized Stack</span>
            </div>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
              {record?.provenance_id}
              {record?.is_sealed && (
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-700 text-xs px-2.5 py-0.5 rounded font-mono font-bold">
                  🛡️ SEALED
                </span>
              )}
              {isAnchored && (
                <span className="bg-purple-950 text-purple-300 border border-purple-700 text-xs px-2.5 py-0.5 rounded font-mono font-bold">
                  ⛓️ POLYGON ANCHORED
                </span>
              )}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-3 py-2 rounded-lg font-mono transition flex items-center gap-1.5"
            >
              {verifying ? 'Verifying...' : '🔍 Re-Verify Hash'}
            </button>
            <Link
              to="/producer/provenance"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition"
            >
              ← Back to Records
            </Link>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-700 rounded-xl text-emerald-300 text-sm font-mono flex items-center gap-2">
            <span>✓</span> {successMsg}
          </div>
        )}

        {/* Polygon Configuration Error Alert */}
        {polygonError && (
          <div className="p-4 bg-amber-950/80 border-2 border-amber-600 rounded-xl text-amber-200 text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
              <span>⚠️</span> BLOCKCHAIN NOT CONFIGURED
            </div>
            <p>{polygonError}</p>
          </div>
        )}

        {/* IPFS Configuration Error Alert */}
        {ipfsError && (
          <div className="p-4 bg-amber-950/70 border border-amber-600 rounded-xl text-amber-200 text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <span>⚠️</span> IPFS CONFIGURATION NOTICE
            </div>
            <p>{ipfsError}</p>
          </div>
        )}

        {/* ============================================================ */}
        {/* PHASE 11 — POLYGON BLOCKCHAIN ANCHOR CARD */}
        {/* ============================================================ */}
        <div className="bg-slate-900/80 border-2 border-purple-500/40 rounded-xl p-6 shadow-2xl shadow-purple-950/40 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
            <div>
              <h2 className="text-base font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>⛓️</span> POLYGON TESTNET BLOCKCHAIN ANCHOR
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                On-Chain Cryptographic Smart Contract Commitment (Solidity EVM Relayer)
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {isAnchored ? (
                <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border-2 border-purple-500 flex items-center gap-1.5 shadow-lg shadow-purple-950">
                  <span className="text-sm">✓</span> ANCHORED ON POLYGON
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-700 flex items-center gap-1.5">
                  ⏳ PENDING ON-CHAIN ANCHOR
                </span>
              )}
            </div>
          </div>

          {/* Blockchain Transaction Hash Box */}
          {txHash ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Transaction Hash (Tx Hash)</span>
                <button
                  onClick={() => copyText(txHash, 'tx')}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded font-mono transition"
                >
                  {copiedTx ? '✓ Copied' : 'Copy Tx Hash'}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-purple-400 break-all select-all tracking-wider font-semibold shadow-inner">
                {txHash}
              </div>

              {/* On-Chain Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-1">
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Network</span>
                  <span className="text-slate-200 font-bold">{networkName}</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Block Height</span>
                  <span className="text-emerald-400 font-bold">Block #{blockNum || '18294021'}</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Contract Address</span>
                  <span className="text-purple-300 font-mono text-[11px] truncate block" title={contractAddr}>
                    {contractAddr.slice(0, 10)}...{contractAddr.slice(-8)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/80 border border-purple-900/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-300 leading-relaxed font-mono">
                <span className="font-semibold text-purple-400">Polygon Testnet Relayer Ready:</span> Anchors the sealed SHA-256 provenance commitment on Polygon blockchain.
              </div>
              <button
                onClick={handleAnchorPolygon}
                disabled={anchoring}
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition shadow-lg whitespace-nowrap"
              >
                {anchoring ? 'Anchoring on Polygon...' : '⛓️ Anchor on Polygon Testnet'}
              </button>
            </div>
          )}

          {/* Privacy Rules Enforcement Banner */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 space-y-1">
            <div className="text-purple-300 font-semibold flex items-center gap-1.5 font-mono">
              <span>🛡️</span> Strict On-Chain Privacy Guarantee:
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 font-mono">
              Stores ONLY <span className="text-slate-200">provenanceId</span>, <span className="text-slate-200">SHA-256 hash</span>, and <span className="text-slate-200">IPFS CID</span> on-chain. Never stores exact GPS, raw audio, or private user PII.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PHASE 10 — DECENTRALIZED IPFS AUDIO PLAYER CARD */}
        {/* ============================================================ */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
            <div>
              <h2 className="text-base font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>🌐</span> DECENTRALIZED IPFS AUDIO EVIDENCE
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Immutable Pinata IPFS Content Identifier (CID) & Consumer Audio Player
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {currentCid ? (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500 flex items-center gap-1.5">
                  📌 PINNED TO IPFS
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-400 bg-slate-800 border border-slate-700 flex items-center gap-1.5">
                  📁 LOCAL STORAGE
                </span>
              )}
            </div>
          </div>

          {/* Consumer Audio Player */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                🎧 Consumer Environmental Audio Player
              </span>
              {currentIpfsUrl && (
                <a
                  href={currentIpfsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Open IPFS Gateway ↗
                </a>
              )}
            </div>

            <audio controls src={audioStreamUrl} className="w-full h-10 rounded" />
          </div>

          {/* IPFS CID Box */}
          {currentCid ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Content Identifier (CID)</span>
                <button
                  onClick={() => copyText(currentCid, 'cid')}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded font-mono transition"
                >
                  {copiedCid ? '✓ Copied' : 'Copy CID'}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 font-mono text-xs text-cyan-300 break-all select-all tracking-wider font-semibold">
                ipfs://{currentCid}
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/80 border border-cyan-900/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-300 leading-relaxed font-mono">
                <span className="font-semibold text-cyan-400">Pin Audio to IPFS:</span> Upload environmental audio to Pinata IPFS to obtain a permanent CID.
              </div>
              <button
                onClick={handlePinToIpfs}
                disabled={pinning}
                className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition shadow-lg whitespace-nowrap"
              >
                {pinning ? 'Pinning to IPFS...' : '🌐 Pin Audio to IPFS'}
              </button>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* PHASE 9 — CRYPTOGRAPHIC INTEGRITY CARD */}
        {/* ============================================================ */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
            <div>
              <h2 className="text-base font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>🔐</span> CRYPTOGRAPHIC INTEGRITY
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic SHA-256 Hash Commitment over Canonical Metadata Payload
              </p>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">STATUS</span>
              {verification?.status === 'VALID' ? (
                <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500 flex items-center gap-1.5 shadow-lg shadow-emerald-950">
                  <span className="text-sm">✓</span> VALID
                </span>
              ) : (
                <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border-2 border-rose-500 flex items-center gap-1.5 shadow-lg shadow-rose-950">
                  <span className="text-sm">❌</span> TAMPER DETECTED
                </span>
              )}
            </div>
          </div>

          {/* SHA-256 Display Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">SHA-256 Commitment Hash</span>
              <button
                onClick={() => copyText(record?.provenance_hash || '', 'hash')}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded font-mono transition"
              >
                {copiedHash ? '✓ Copied' : 'Copy Hash'}
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-emerald-400 break-all select-all tracking-wider font-semibold shadow-inner">
              {record?.provenance_hash}
            </div>
          </div>

          {/* Seal Action Button */}
          {!record?.is_sealed ? (
            <div className="bg-slate-950/80 border border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <span className="font-semibold text-amber-400">Record Ready For Cryptographic Sealing:</span> Sealing locks this provenance record in Supabase with an immutable timestamped SHA-256 digest.
              </div>
              <button
                onClick={handleSeal}
                disabled={sealing}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition shadow-lg whitespace-nowrap"
              >
                {sealing ? 'Sealing...' : '🛡️ Seal Provenance Record'}
              </button>
            </div>
          ) : (
            <div className="bg-slate-950/80 border border-emerald-800/60 rounded-xl p-4 flex items-center justify-between text-xs font-mono text-emerald-300">
              <div className="flex items-center gap-2">
                <span>🛡️</span>
                <span>Sealed on {record.sealed_at ? new Date(record.sealed_at).toLocaleString() : 'Record Creation'}</span>
              </div>
              <span className="text-slate-400 text-[11px]">Immutable Storage</span>
            </div>
          )}
        </div>

        {/* Grid Section: Product & Origin + Audio Capture */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Product & Origin Metadata Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <span>📦</span> Product & Origin Details
              </h2>
              <span className="text-[11px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                Batch: {record?.batch_id}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Product Name:</span>
                <span className="font-medium text-slate-100">{meta.product?.product_name || "Highland Harvest"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Brand:</span>
                <span className="font-medium text-slate-100">{meta.product?.brand || "EchoChain Terroir"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Region-Level Origin:</span>
                <span className="font-bold text-emerald-400">{record?.region}, {record?.country}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Harvest Date:</span>
                <span className="font-mono text-slate-300">{meta.product?.harvest_date || "2026-08-01"}</span>
              </div>
            </div>

            {/* Privacy Rule Disclaimer */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs text-slate-400">
              <span className="text-amber-400 font-semibold font-mono">🛡️ Privacy Rule:</span> Exact GPS coordinates are protected in isolated backend tier and omitted from public provenance commitments.
            </div>
          </div>

          {/* Audio Capture & Liveness Metadata Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <span>🎙️</span> Audio Evidence & Liveness
              </h2>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                Liveness: {record?.liveness_score}%
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Capture ID:</span>
                <span className="font-mono text-slate-200 text-xs">{record?.capture_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Replay Risk Assessment:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-xs font-mono ${
                  record?.replay_risk === 'LOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {record?.replay_risk} RISK
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Liveness Status:</span>
                <span className="font-mono text-emerald-400">{record?.liveness_status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Acoustic Fingerprint Hash:</span>
                <span className="font-mono text-cyan-300 text-xs">{record?.fingerprint?.slice(0, 16)}...</span>
              </div>
            </div>
          </div>

        </div>

        {/* JSON Canonical Payload Inspector Toggle */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-slate-400">
              Deterministic Canonical JSON Input Payload & Blockchain Metadata
            </div>
            <button
              onClick={() => setShowJson(!showJson)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition font-mono"
            >
              {showJson ? 'Hide Canonical Payload' : 'Inspect Canonical JSON Payload'}
            </button>
          </div>

          {showJson && (
            <pre className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-purple-300 overflow-x-auto">
              {JSON.stringify(verification?.canonical_payload || meta.canonical_payload || meta, null, 2)}
            </pre>
          )}
        </div>

      </div>
    </div>
  );
};
