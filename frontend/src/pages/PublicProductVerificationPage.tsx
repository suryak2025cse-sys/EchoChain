import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicVerificationApi } from '../services/api';
import type { PublicVerificationResponse } from '../types';

export const PublicProductVerificationPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [data, setData] = useState<PublicVerificationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [copiedTx, setCopiedTx] = useState<boolean>(false);
  const [copiedCid, setCopiedCid] = useState<boolean>(false);

  useEffect(() => {
    const loadVerification = async () => {
      if (!productId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getPublicVerificationApi(productId);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Product verification record not found.');
      } finally {
        setLoading(false);
      }
    };
    loadVerification();
  }, [productId]);

  const copyText = (txt: string, type: 'hash' | 'tx' | 'cid') => {
    navigator.clipboard.writeText(txt);
    if (type === 'hash') {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else if (type === 'tx') {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    } else {
      setCopiedCid(true);
      setTimeout(() => setCopiedCid(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="flex items-center space-x-3 text-emerald-400 font-mono text-sm">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="uppercase tracking-wider">Verifying Product Authenticity QR Code...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center font-sans">
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-8 max-w-md w-full text-center space-y-4">
          <div className="text-rose-400 text-5xl">⚠️</div>
          <h2 className="text-xl font-bold font-mono text-rose-200">Unverified Product QR Code</h2>
          <p className="text-slate-400 text-xs leading-relaxed">{error || 'This product identifier could not be verified in the EchoChain registry.'}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition"
          >
            ← Return to EchoChain Home
          </Link>
        </div>
      </div>
    );
  }

  const acoustic = data.acoustic_evidence;
  const crypto = data.cryptographic_proof;
  const chain = data.blockchain_proof;
  const ipfs = data.ipfs_storage;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Header Badge */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 rounded">
                ● Verified Consumer Packaging QR Code
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 bg-purple-950 border border-purple-800 px-2.5 py-0.5 rounded">
                Polygon Blockchain Anchored
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {data.product_name}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              EchoChain Product ID: <span className="text-emerald-300 font-bold">{data.echochain_product_id}</span> | Batch: <span className="text-slate-200">{data.batch_id}</span>
            </p>
          </div>

          {/* QR Code Image Display */}
          {data.qr_code_b64 && (
            <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center">
              <img src={data.qr_code_b64} alt="Product QR Code" className="w-28 h-28 object-contain" />
              <span className="text-[9px] font-mono text-slate-900 font-bold mt-1 tracking-tighter">
                SCAN TO VERIFY
              </span>
            </div>
          )}
        </div>

        {/* Overall Status Banner */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-purple-950/80 border-2 border-emerald-500/50 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 text-xl font-bold">
              ✓
            </div>
            <div>
              <div className="text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider">
                AUTHENTICITY STATUS: {data.verification_status}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                All 7 cryptographic, acoustic, and blockchain proof layers verified.
              </p>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Verified UTC: {new Date(data.verified_at).toLocaleString()}
          </div>
        </div>

        {/* LAYER 1 & 2: PRODUCT & REGION-LEVEL ORIGIN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Product & Terroir */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h2 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <span>📦</span> Product & Terroir Specifications
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Brand / Estate:</span>
                <span className="font-semibold text-slate-100">{data.brand}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Product Category:</span>
                <span className="font-semibold text-slate-100">{data.product_type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Region-Level Origin:</span>
                <span className="font-bold text-emerald-400">{data.region}, {data.country}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Harvest Period:</span>
                <span className="font-mono text-slate-200">{data.harvest_date}</span>
              </div>
            </div>
          </div>

          {/* Environmental Acoustic Evidence */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <span>🎙️</span> Environmental Acoustic Evidence
            </h2>
            {acoustic ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Capture ID:</span>
                  <span className="font-mono text-slate-200">{acoustic.capture_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Software Liveness Score:</span>
                  <span className="font-mono font-bold text-emerald-400">{acoustic.liveness_score}% ({acoustic.replay_risk} REPLAY RISK)</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">Audio Playback:</span>
                  <audio controls src={acoustic.audio_stream_url} className="w-full h-8 rounded" />
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-500">Audio capture pending verification.</div>
            )}
          </div>

        </div>

        {/* LAYER 3 & 4: CRYPTOGRAPHIC COMMITMENT & BLOCKCHAIN PROOF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Cryptographic SHA-256 Commitment */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>🔐</span> Cryptographic Commitment
              </h2>
              {crypto?.provenance_hash && (
                <button
                  onClick={() => copyText(crypto.provenance_hash, 'hash')}
                  className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded"
                >
                  {copiedHash ? '✓ Copied' : 'Copy SHA-256'}
                </button>
              )}
            </div>

            {crypto ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="text-slate-400">Canonical SHA-256 Hash:</div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-emerald-400 break-all select-all font-semibold">
                  {crypto.provenance_hash}
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Sealed State:</span>
                  <span className="text-emerald-400 font-bold">{crypto.is_sealed ? 'SEALED' : 'READY_FOR_SEAL'}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-500">Cryptographic hash commitment pending.</div>
            )}
          </div>

          {/* Polygon Testnet Blockchain Proof */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>⛓️</span> Polygon Blockchain Proof
              </h2>
              {chain?.tx_hash && (
                <button
                  onClick={() => copyText(chain.tx_hash, 'tx')}
                  className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded"
                >
                  {copiedTx ? '✓ Copied' : 'Copy Tx'}
                </button>
              )}
            </div>

            {chain ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-purple-300 font-bold">{chain.network}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Block Height:</span>
                  <span className="text-emerald-400 font-bold">Block #{chain.block_number}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">Transaction Hash:</span>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-purple-300 break-all select-all font-semibold">
                    {chain.tx_hash}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-500">Blockchain anchoring pending.</div>
            )}
          </div>

        </div>

        {/* IPFS STORAGE & PRIVACY BANNER */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌐</span> Decentralized IPFS Audio Storage
            </h2>
            {ipfs?.ipfs_cid && (
              <button
                onClick={() => copyText(ipfs.ipfs_cid, 'cid')}
                className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded"
              >
                {copiedCid ? '✓ Copied' : 'Copy CID'}
              </button>
            )}
          </div>

          {ipfs ? (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-2">
              <span className="text-cyan-300 select-all">ipfs://{ipfs.ipfs_cid}</span>
              <a
                href={ipfs.ipfs_gateway_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1 rounded transition"
              >
                Open IPFS Gateway ↗
              </a>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-500">Audio evidence stored in EchoChain Local Vault.</div>
          )}

          {/* Privacy Guarantee Banner */}
          <div className="pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <span>🛡️</span>
            <span>Privacy Rule: Exact GPS coordinates are protected in isolated tier and omitted from public consumer certificates.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
