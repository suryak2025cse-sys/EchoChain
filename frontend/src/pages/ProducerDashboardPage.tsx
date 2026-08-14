import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  fetchProducerStatsApi, 
  fetchMyProductsApi, 
  listProvenanceRecordsApi,
  sealProvenanceRecordApi,
  uploadAudioToIpfsApi,
  anchorProvenanceOnPolygonApi,
  getProductQrCodeApi
} from '../services/api';
import type { ProducerStats, Product, ProvenanceRecord } from '../types';
import { 
  Radio, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  ArrowRight, 
  RefreshCw,
  MapPin,
  Eye,
  ShieldCheck,
  Cpu,
  Lock,
  Globe,
  Link2,
  QrCode,
  Sparkles,
  Download
} from 'lucide-react';

export const ProducerDashboardPage: React.FC = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<ProducerStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [provenanceMap, setProvenanceMap] = useState<Record<number, ProvenanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<{ b64: string; id: string } | null>(null);

  const loadDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [statsData, productsData, provData] = await Promise.all([
        fetchProducerStatsApi(token),
        fetchMyProductsApi(token, undefined, undefined, undefined, 1, 10),
        listProvenanceRecordsApi(token).catch(() => ({ items: [], total: 0 }))
      ]);

      setStats(statsData);
      setRecentProducts(productsData.items);

      // Map provenance records by product_id
      const pMap: Record<number, ProvenanceRecord> = {};
      if (provData.items) {
        provData.items.forEach(rec => {
          pMap[rec.product_id] = rec;
        });
      }
      setProvenanceMap(pMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load live Supabase dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  // Quick Action Handlers
  const handleQuickSeal = async (provId: string) => {
    if (!token) return;
    setActionLoading(`seal-${provId}`);
    setError(null);
    setSuccessMsg(null);
    try {
      await sealProvenanceRecordApi(token, provId);
      setSuccessMsg(`✓ Provenance ${provId} sealed with SHA-256 digest!`);
      await loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Sealing failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickIpfs = async (provId: string) => {
    if (!token) return;
    setActionLoading(`ipfs-${provId}`);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await uploadAudioToIpfsApi(token, provId);
      setSuccessMsg(`✓ Audio evidence pinned to Pinata IPFS (CID: ${res.ipfs_cid.slice(0, 16)}...)!`);
      await loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'IPFS upload failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickPolygon = async (provId: string) => {
    if (!token) return;
    setActionLoading(`polygon-${provId}`);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await anchorProvenanceOnPolygonApi(token, provId);
      setSuccessMsg(`✓ Anchored on Polygon Testnet (Tx: ${res.tx_hash.slice(0, 16)}...)!`);
      await loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Polygon anchoring failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleShowQr = async (productId: number) => {
    try {
      const data = await getProductQrCodeApi(productId);
      setQrModal({ b64: data.qr_code_b64, id: data.echochain_product_id });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch QR code.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Verified
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-700 animate-pulse" /> Pending Review
          </span>
        );
      case 'FLAGGED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-700" /> Flagged
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-gray-100 text-gray-700 border border-gray-300">
            Unverified
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* TOP HEADER & DASHBOARD BANNER */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 shadow-xl bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-mono font-bold border border-emerald-300">
              <Radio className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              Live Supabase Producer Provenance Hub
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Producer Dashboard</h1>
            <p className="text-xs text-gray-600 font-mono">
              Welcome back, <span className="font-bold text-gray-800">{user?.fullName}</span> ({user?.organization || 'Highland Estate Co-op'})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link
              to="/producer/products/new"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Create Batch
            </Link>

            <Link
              to="/producer/audio-capture"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-md font-mono"
            >
              <Radio className="w-4 h-4 text-emerald-400" /> Audio Evidence Studio
            </Link>

            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2.5 rounded-xl border border-gray-300 bg-white text-gray-600 hover:text-gray-900 transition-colors"
              title="Refresh Real Statistics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
            </button>
          </div>
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

        {/* ============================================================ */}
        {/* REAL SUPABASE DASHBOARD STATISTICS (NO FAKE DATA) */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Total Products */}
          <div className="light-card p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
              <span className="font-semibold uppercase tracking-wider">Total Products</span>
              <Package className="w-4 h-4 text-slate-700" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900 font-mono">
              {loading ? '...' : stats?.total_products || 0}
            </p>
            <p className="text-[10px] text-gray-500 font-mono">Registered harvest items</p>
          </div>

          {/* 2. Verified */}
          <div className="light-card p-6 rounded-2xl bg-white border border-emerald-200/80 bg-emerald-50/20 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-mono">
              <span className="font-bold uppercase tracking-wider">Verified</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-700 font-mono">
              {loading ? '...' : stats?.verified_products || 0}
            </p>
            <p className="text-[10px] text-emerald-800 font-mono">Provenanced & Sealed</p>
          </div>

          {/* 3. Pending */}
          <div className="light-card p-6 rounded-2xl bg-white border border-amber-200/80 bg-amber-50/20 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-800 font-mono">
              <span className="font-bold uppercase tracking-wider">Pending</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-3xl font-extrabold text-amber-700 font-mono">
              {loading ? '...' : stats?.pending_verification || 0}
            </p>
            <p className="text-[10px] text-amber-800 font-mono">Awaiting full verification</p>
          </div>

          {/* 4. Flagged */}
          <div className="light-card p-6 rounded-2xl bg-white border border-rose-200/80 bg-rose-50/20 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-rose-800 font-mono">
              <span className="font-bold uppercase tracking-wider">Flagged</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-3xl font-extrabold text-rose-700 font-mono">
              {loading ? '...' : stats?.flagged_products || 0}
            </p>
            <p className="text-[10px] text-rose-800 font-mono">Requires liveness re-check</p>
          </div>

        </div>

        {/* ============================================================ */}
        {/* 9 CORE PROVENANCE WORKFLOW CAPABILITIES HUB */}
        {/* ============================================================ */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Provenance Engine Pipeline
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">9 Core Producer Capabilities</h2>
            </div>
            <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              Phases 1–12 Integrated
            </span>
          </div>

          {/* 9 Capabilities Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            
            {/* 1. Create Batch */}
            <Link
              to="/producer/products/new"
              className="p-5 rounded-2xl bg-gray-50 hover:bg-emerald-50/60 border border-gray-200 hover:border-emerald-300 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-emerald-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-600" /> 1. Create Batch
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-600 font-sans">
                Register a new origin batch with public region terroir & protected exact GPS.
              </p>
            </Link>

            {/* 2. Capture Audio */}
            <Link
              to="/producer/audio-capture"
              className="p-5 rounded-2xl bg-gray-50 hover:bg-cyan-50/60 border border-gray-200 hover:border-cyan-300 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-cyan-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-cyan-600" /> 2. Capture Audio
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-600 font-sans">
                Record or upload environmental acoustic audio evidence from harvest field.
              </p>
            </Link>

            {/* 3. Analyze Audio */}
            <Link
              to="/producer/audio-capture"
              className="p-5 rounded-2xl bg-gray-50 hover:bg-purple-50/60 border border-gray-200 hover:border-purple-300 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-purple-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-600" /> 3. Analyze Audio
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-600 font-sans">
                Extract 32-dim MFCC acoustic fingerprint vector & spectral feature maps.
              </p>
            </Link>

            {/* 4. Run Liveness */}
            <Link
              to="/producer/audio-capture"
              className="p-5 rounded-2xl bg-gray-50 hover:bg-amber-50/60 border border-gray-200 hover:border-amber-300 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-amber-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" /> 4. Run Liveness
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-600 font-sans">
                Run acoustic liveness challenge & anti-replay risk detection score.
              </p>
            </Link>

            {/* 5. Create Provenance */}
            <Link
              to="/producer/provenance"
              className="p-5 rounded-2xl bg-gray-50 hover:bg-emerald-50/60 border border-gray-200 hover:border-emerald-300 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-emerald-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-emerald-600" /> 5. Create Provenance
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-600 font-sans">
                Synthesize batch, acoustic fingerprint, liveness, and origin into record.
              </p>
            </Link>

            {/* 6. Seal Provenance */}
            <Link
              to="/producer/provenance"
              className="p-5 rounded-2xl bg-gray-50 hover:bg-emerald-50/60 border border-gray-200 hover:border-emerald-300 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-emerald-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" /> 6. Seal Provenance
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-600 font-sans">
                Lock record with deterministic SHA-256 canonical hash commitment digest.
              </p>
            </Link>

            {/* 7. Upload IPFS */}
            <Link
              to="/producer/provenance"
              className="p-5 rounded-2xl bg-gray-50 hover:bg-cyan-50/60 border border-gray-200 hover:border-cyan-300 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-cyan-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-600" /> 7. Upload IPFS
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-600 font-sans">
                Pin environmental audio evidence to Pinata IPFS decentralized network.
              </p>
            </Link>

            {/* 8. Anchor Polygon */}
            <Link
              to="/producer/provenance"
              className="p-5 rounded-2xl bg-gray-50 hover:bg-purple-50/60 border border-gray-200 hover:border-purple-300 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-purple-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> 8. Anchor Polygon
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-600 font-sans">
                Broadcast smart contract transaction on Polygon Amoy EVM Testnet.
              </p>
            </Link>

            {/* 9. Generate QR */}
            <Link
              to="/producer/products"
              className="p-5 rounded-2xl bg-gray-50 hover:bg-emerald-50/60 border border-gray-200 hover:border-emerald-300 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-emerald-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-600" /> 9. Generate QR Code
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-600 font-sans">
                Generate & download product packaging QR codes for physical printing.
              </p>
            </Link>

          </div>
        </div>

        {/* ============================================================ */}
        {/* RECENT BATCHES & PROVENANCE PIPELINE ACTIONS CONSOLE */}
        {/* ============================================================ */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-widest">
                Live Supabase Inventory
              </span>
              <h2 className="text-xl font-bold text-gray-900">Batch Provenance Pipeline Console</h2>
            </div>

            <Link
              to="/producer/products"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 font-mono"
            >
              View Full Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center font-mono text-xs text-gray-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" /> Querying Supabase product records...
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-gray-50 border border-dashed border-gray-300 text-center space-y-3">
              <Package className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs font-bold text-gray-800">No product batches registered in Supabase</p>
              <Link
                to="/producer/products/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 font-mono"
              >
                <Plus className="w-3.5 h-3.5" /> Create First Batch
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Batch ID & Echo ID</th>
                    <th className="py-3 px-4">Product & Region</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Provenance Record</th>
                    <th className="py-3 px-4">Proof Stages</th>
                    <th className="py-3 px-4 text-right">Pipeline Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {recentProducts.map((p) => {
                    const prov = provenanceMap[p.id];
                    const echoId = p.echochain_product_id || p.batch_id;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        
                        {/* Batch ID */}
                        <td className="py-4 px-4 font-mono">
                          <span className="font-bold text-emerald-800 block">{p.batch_id}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{echoId}</span>
                        </td>

                        {/* Product & Region */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-gray-900 block">{p.product_name}</span>
                          <span className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                            <MapPin className="w-3 h-3 text-emerald-700 shrink-0" /> {p.region}, {p.country}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          {getStatusBadge(p.verification_status)}
                        </td>

                        {/* Provenance Record */}
                        <td className="py-4 px-4 font-mono text-[11px]">
                          {prov ? (
                            <Link 
                              to={`/provenance/${prov.provenance_id}`}
                              className="text-emerald-700 font-bold hover:underline"
                            >
                              {prov.provenance_id}
                            </Link>
                          ) : (
                            <span className="text-gray-400 italic">No Provenance Yet</span>
                          )}
                        </td>

                        {/* Proof Stages */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 font-mono text-[9px]">
                            {prov?.is_sealed ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                🔐 SHA-256
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                SHA-256
                              </span>
                            )}

                            {prov?.ipfs_cid ? (
                              <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200">
                                🌐 IPFS
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                IPFS
                              </span>
                            )}

                            {prov?.is_anchored ? (
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                                ⛓️ POLYGON
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                POLYGON
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Pipeline Actions */}
                        <td className="py-4 px-4 text-right font-mono space-x-1.5">
                          
                          {/* Audio Capture */}
                          <Link
                            to={`/producer/products/${p.id}/audio`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 text-[11px] font-bold transition"
                            title="Capture Audio"
                          >
                            <Radio className="w-3 h-3" /> Audio
                          </Link>

                          {/* Quick Seal */}
                          {prov && !prov.is_sealed && (
                            <button
                              onClick={() => handleQuickSeal(prov.provenance_id)}
                              disabled={actionLoading === `seal-${prov.provenance_id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition"
                              title="Seal SHA-256"
                            >
                              <Lock className="w-3 h-3" /> {actionLoading === `seal-${prov.provenance_id}` ? '...' : 'Seal'}
                            </button>
                          )}

                          {/* Quick IPFS */}
                          {prov && !prov.ipfs_cid && (
                            <button
                              onClick={() => handleQuickIpfs(prov.provenance_id)}
                              disabled={actionLoading === `ipfs-${prov.provenance_id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold transition"
                              title="Pin to IPFS"
                            >
                              <Globe className="w-3 h-3" /> {actionLoading === `ipfs-${prov.provenance_id}` ? '...' : 'IPFS'}
                            </button>
                          )}

                          {/* Quick Polygon */}
                          {prov && !prov.is_anchored && (
                            <button
                              onClick={() => handleQuickPolygon(prov.provenance_id)}
                              disabled={actionLoading === `polygon-${prov.provenance_id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition"
                              title="Anchor on Polygon"
                            >
                              <Sparkles className="w-3 h-3" /> {actionLoading === `polygon-${prov.provenance_id}` ? '...' : 'Polygon'}
                            </button>
                          )}

                          {/* QR Code Modal Trigger */}
                          <button
                            onClick={() => handleShowQr(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold transition border border-gray-300"
                            title="Show QR Code"
                          >
                            <QrCode className="w-3 h-3" /> QR
                          </button>

                          {/* View Detail */}
                          <Link
                            to={prov ? `/provenance/${prov.provenance_id}` : `/producer/products/${p.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 hover:bg-emerald-100 text-gray-800 hover:text-emerald-900 text-[11px] font-bold transition border border-gray-200"
                          >
                            <Eye className="w-3 h-3" /> View
                          </Link>

                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* PACKAGING QR CODE MODAL */}
      {qrModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center border-2 border-emerald-500 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Packaging QR Code</span>
              <button 
                onClick={() => setQrModal(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-gray-600 font-bold">
              {qrModal.id}
            </div>

            <img src={qrModal.b64} alt="Product QR Code" className="w-48 h-48 mx-auto object-contain border p-2 rounded-xl" />

            <p className="text-[11px] text-gray-500 font-sans">
              Print on physical packaging. Scans to public 7-layer verification page.
            </p>

            <div className="flex gap-2 pt-2">
              <a
                href={qrModal.b64}
                download={`EchoChain_QR_${qrModal.id}.png`}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Download PNG
              </a>
              <Link
                to={`/verify/${qrModal.id}`}
                target="_blank"
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs flex items-center justify-center gap-1 transition"
              >
                Preview ↗
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
