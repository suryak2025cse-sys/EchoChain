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
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';
import { Metric } from '../components/ui/Metric';
import { StatusBadge } from '../components/ui/StatusBadge';
import { HashDisplay } from '../components/ui/HashDisplay';
import { GoldButton } from '../components/ui/GoldButton';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  RefreshCw,
  MapPin,
  QrCode,
  Download,
  X,
  Radio
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

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] p-6 md:p-12 space-y-10">
      
      {/* Top Header Banner */}
      <div className="relative p-8 rounded-sm bg-[#101311] border border-[#1D221F] overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-30">
          <EcosystemWaveform height={160} color="#D4AF37" speed={0.015} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#080A09] border border-[#D4AF37]/30 text-xs font-mono text-[#D4AF37]">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> PRODUCER PROVENANCE CONTROL CENTER
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-light text-[#F5F3ED]">
              Producer Control Center — <span className="text-[#D4AF37] font-normal">{user?.fullName}</span>
            </h1>
            <p className="text-xs font-mono text-[#9A9A93]">
              Estate: {user?.organization || 'Independent Producer'} • Supabase Real-Time Sync Active
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link to="/products/new">
              <GoldButton variant="primary" showArrow className="!py-3 !px-5 text-xs">
                REGISTER BATCH
              </GoldButton>
            </Link>

            <Link to="/audio/capture">
              <GoldButton variant="secondary" className="!py-3 !px-5 text-xs">
                CAPTURE ACOUSTIC
              </GoldButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xs bg-[#7CC8A0]/10 border border-[#7CC8A0]/40 text-[#7CC8A0] text-xs font-mono flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B] text-xs font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Editorial Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Metric
            label="Total Products"
            value={stats.total_products}
            unit="BATCHES"
            accentColor="#D4AF37"
            icon={<Package className="w-4 h-4" />}
          />
          <Metric
            label="Fully Verified"
            value={stats.verified_products}
            unit="ANCHORED"
            accentColor="#7CC8A0"
            icon={<CheckCircle2 className="w-4 h-4" />}
          />
          <Metric
            label="Pending Review"
            value={stats.pending_verification}
            unit="IN PIPELINE"
            accentColor="#E4B95C"
            icon={<Clock className="w-4 h-4" />}
          />
          <Metric
            label="Flagged Threats"
            value={stats.flagged_products}
            unit="ALERTS"
            accentColor="#E36B6B"
            icon={<AlertOctagon className="w-4 h-4" />}
          />
        </div>
      )}

      {/* Recent Batches Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif text-[#F5F3ED]">Recent Agricultural Batches</h2>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2 rounded-xs bg-[#101311] border border-[#1D221F] text-[#9A9A93] hover:text-[#F5F3ED]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#9A9A93] font-mono text-xs">
            Querying Supabase protocol data...
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="p-12 text-center rounded-sm bg-[#101311] border border-[#1D221F] space-y-4 font-mono text-xs">
            <Package className="w-8 h-8 text-[#9A9A93] mx-auto" />
            <div className="text-sm font-semibold text-[#F5F3ED]">No Registered Batches Yet</div>
            <p className="text-[#9A9A93] max-w-sm mx-auto">
              Register your first product batch to begin environmental audio capture and Polygon blockchain anchoring.
            </p>
          </div>
        ) : (
          <div className="rounded-sm bg-[#101311] border border-[#1D221F] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#080A09] text-[#9A9A93] border-b border-[#1D221F] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-4 px-5">Batch Identity</th>
                    <th className="py-4 px-5">Product Name</th>
                    <th className="py-4 px-5">Region / Country</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Cryptographic Seal</th>
                    <th className="py-4 px-5 text-right">Protocol Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D221F] text-[#F5F3ED]">
                  {recentProducts.map(prod => {
                    const prov = provenanceMap[prod.id];
                    return (
                      <tr key={prod.id} className="hover:bg-[#161B18] transition-colors">
                        <td className="py-4 px-5 font-bold text-[#D4AF37]">
                          {prod.echochain_product_id || `BATCH-#${prod.id}`}
                        </td>

                        <td className="py-4 px-5 font-sans font-medium text-sm">
                          {prod.product_name}
                          <div className="text-[11px] font-mono text-[#9A9A93]">{prod.brand}</div>
                        </td>

                        <td className="py-4 px-5 text-[#9A9A93]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#62C7C0]" /> {prod.region}, {prod.country}
                          </span>
                        </td>

                        <td className="py-4 px-5">
                          <StatusBadge status={prov ? prov.status : prod.verification_status} size="sm" />
                        </td>

                        <td className="py-4 px-5">
                          {prov ? (
                            <HashDisplay hash={prov.provenance_hash} truncate label="SHA" />
                          ) : (
                            <span className="text-[#9A9A93]">Capture Pending</span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right space-x-2">
                          {prov ? (
                            <>
                              {!prov.is_sealed && (
                                <button
                                  onClick={() => handleQuickSeal(prov.provenance_id)}
                                  disabled={actionLoading === `seal-${prov.provenance_id}`}
                                  className="px-3 py-1.5 rounded-xs bg-[#E4B95C]/10 border border-[#E4B95C]/40 text-[#E4B95C] hover:bg-[#E4B95C]/20 transition-colors"
                                >
                                  {actionLoading === `seal-${prov.provenance_id}` ? 'Sealing...' : 'Seal SHA-256'}
                                </button>
                              )}

                              {prov.is_sealed && !prov.ipfs_cid && (
                                <button
                                  onClick={() => handleQuickIpfs(prov.provenance_id)}
                                  disabled={actionLoading === `ipfs-${prov.provenance_id}`}
                                  className="px-3 py-1.5 rounded-xs bg-[#62C7C0]/10 border border-[#62C7C0]/40 text-[#62C7C0] hover:bg-[#62C7C0]/20 transition-colors"
                                >
                                  {actionLoading === `ipfs-${prov.provenance_id}` ? 'Pinning...' : 'Pin IPFS'}
                                </button>
                              )}

                              {prov.is_sealed && prov.ipfs_cid && !prov.is_anchored && (
                                <button
                                  onClick={() => handleQuickPolygon(prov.provenance_id)}
                                  disabled={actionLoading === `polygon-${prov.provenance_id}`}
                                  className="px-3 py-1.5 rounded-xs bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors"
                                >
                                  {actionLoading === `polygon-${prov.provenance_id}` ? 'Anchoring...' : 'Anchor Polygon'}
                                </button>
                              )}

                              <button
                                onClick={() => handleShowQr(prod.id)}
                                className="px-3 py-1.5 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] hover:border-[#D4AF37]"
                              >
                                <QrCode className="w-3.5 h-3.5 inline mr-1" /> QR
                              </button>
                            </>
                          ) : (
                            <Link
                              to={`/audio/capture?product_id=${prod.id}`}
                              className="px-3 py-1.5 rounded-xs bg-gold-metallic text-[#080A09] font-bold"
                            >
                              Record Audio
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Inspection Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101311] border border-[#1D221F] rounded-sm p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1D221F] pb-4">
              <span className="text-xs font-mono text-[#D4AF37] font-bold">{qrModal.id}</span>
              <button onClick={() => setQrModal(null)} className="text-[#9A9A93] hover:text-[#F5F3ED]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-xs inline-block">
              <img src={qrModal.b64} alt="Product Verification QR Code" className="w-48 h-48 mx-auto" />
            </div>

            <p className="text-xs font-mono text-[#9A9A93]">
              Scanned via mobile camera to open consumer public verification page: <br />
              <span className="text-[#D4AF37]">/verify/{qrModal.id}</span>
            </p>

            <a
              href={qrModal.b64}
              download={`${qrModal.id}_QR.png`}
              className="w-full py-3 rounded-xs bg-gold-metallic text-[#080A09] font-mono text-xs font-bold block"
            >
              <Download className="w-4 h-4 inline mr-1" /> Download QR Code PNG
            </a>
          </div>
        </div>
      )}

    </div>
  );
};
