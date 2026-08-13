import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProductByIdApi, deleteProductApi, getProductQrCodeApi } from '../services/api';
import type { Product } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  Lock, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Radio, 
  ShieldCheck, 
  RefreshCw,
  QrCode,
  Download,
  ExternalLink
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [qrData, setQrData] = useState<{ echochain_product_id: string; verification_url: string; qr_code_b64: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!token || !id) return;
      setLoading(true);
      setError(null);
      try {
        const prodIdNum = parseInt(id, 10);
        const res = await fetchProductByIdApi(token, prodIdNum);
        setProduct(res);

        // Fetch QR code
        try {
          const qr = await getProductQrCodeApi(prodIdNum);
          setQrData(qr);
        } catch (qErr) {
          console.warn("QR code fetch warning:", qErr);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [token, id]);

  const handleDelete = async () => {
    if (!token || !product || !window.confirm('Delete this product batch record permanently?')) return;
    try {
      await deleteProductApi(token, product.id);
      navigate('/producer/products');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const handleDownloadQr = () => {
    if (!qrData?.qr_code_b64 || !product) return;
    const a = document.createElement('a');
    a.href = qrData.qr_code_b64;
    a.download = `EchoChain_QR_${qrData.echochain_product_id || product.batch_id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Authenticity Verified
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-700 animate-pulse" /> Pending Verification Review
          </span>
        );
      case 'FLAGGED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-700" /> Flagged Anomaly
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-gray-100 text-gray-700 border border-gray-300">
            Unverified
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] flex flex-col items-center justify-center text-gray-600 font-mono text-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-700 mb-2" />
        <span>Loading batch specifications...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] py-16 px-4">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-rose-200 text-center space-y-4 shadow-xl">
          <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
          <p className="text-xs text-gray-600">{error || 'The requested product batch could not be found.'}</p>
          <Link
            to="/producer/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isOwnerOrAdmin = user && (user.id === product.producer_id || user.role === 'ADMIN');
  const echoProductId = product.echochain_product_id || qrData?.echochain_product_id || product.batch_id;

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* BREADCRUMB & TOP ACTIONS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            to="/producer/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Link>

          {isOwnerOrAdmin && (
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/producer/products/${product.id}/audio`}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:from-amber-300 hover:to-emerald-300 shadow-md flex items-center gap-1.5 transition-all"
              >
                <Radio className="w-4 h-4" /> Environmental Audio Capture
              </Link>
              <Link
                to={`/producer/products/${product.id}/edit`}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Edit Batch
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* PHASE 12 — PRODUCT PACKAGING QR CODE CARD */}
        {/* ============================================================ */}
        <div className="p-6 rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-900/60 border border-emerald-700 px-2.5 py-0.5 rounded font-bold flex items-center gap-1">
                <QrCode className="w-3 h-3" /> Phase 12 Product QR Code
              </span>
            </div>

            <h2 className="text-xl font-bold font-mono text-emerald-300">
              {echoProductId}
            </h2>

            <p className="text-xs text-slate-300 max-w-md font-mono">
              Print this QR code on physical product packaging. Scanning directs consumers to the public 7-layer verification certificate.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
              {qrData?.qr_code_b64 && (
                <button
                  onClick={handleDownloadQr}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download Packaging QR (PNG)
                </button>
              )}

              <Link
                to={`/verify/${echoProductId}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-xs transition-all border border-slate-700 flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Preview Consumer QR Page ↗
              </Link>
            </div>
          </div>

          {/* QR Code Image Preview */}
          {(qrData?.qr_code_b64 || product.qr_code_b64) && (
            <div className="bg-white p-3 rounded-2xl shadow-2xl border-2 border-emerald-400 flex flex-col items-center shrink-0">
              <img 
                src={qrData?.qr_code_b64 || product.qr_code_b64} 
                alt="Product Packaging QR Code" 
                className="w-32 h-32 object-contain"
              />
              <span className="text-[9px] font-mono text-slate-900 font-bold mt-1 tracking-wider">
                PACKAGING QR CODE
              </span>
            </div>
          )}
        </div>

        {/* MAIN PRODUCT SPECIFICATION CARD */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl space-y-6">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-gray-500 mb-1">
                <span className="font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                  {product.batch_id}
                </span>
                <span>•</span>
                <span>Registered {new Date(product.created_at).toLocaleDateString()}</span>
              </div>

              <h1 className="text-3xl font-extrabold text-gray-900">{product.product_name}</h1>
              <p className="text-xs text-gray-600 font-mono mt-1">{product.brand} • {product.product_type}</p>
            </div>

            <div>{getStatusBadge(product.verification_status)}</div>
          </div>

          {/* PUBLIC TERROIR LOCATION */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" /> Public Terroir Location (Ledger Ready)
            </span>
            <p className="text-lg font-bold text-gray-900">
              {product.region}, {product.country}
            </p>
            <p className="text-xs text-gray-500 font-mono">
              Public location boundary exposed for consumer verification without revealing exact harvest field boundaries.
            </p>
          </div>

          {/* PROTECTED EXACT GPS (OWNER/ADMIN ACCESS) */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-700" /> Protected GPS Coordinates (Owner Access Only)
              </span>
              <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                🔒 PRIVATE DATA
              </span>
            </div>

            {product.protected_gps_latitude && product.protected_gps_longitude ? (
              <div className="font-mono text-sm font-bold text-emerald-900 pt-1">
                Latitude: {product.protected_gps_latitude.toFixed(6)} | Longitude: {product.protected_gps_longitude.toFixed(6)}
              </div>
            ) : (
              <p className="text-xs text-gray-600 font-mono italic">
                No exact GPS coordinates attached to this batch record.
              </p>
            )}
          </div>

          {/* METADATA GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
              <span className="text-gray-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Harvest Date
              </span>
              <p className="font-bold text-gray-900">{product.harvest_date}</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
              <span className="text-gray-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> Certification Standard
              </span>
              <p className="font-bold text-gray-900">{product.certification_status}</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
              <span className="text-gray-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-teal-700" /> Acoustic Signature
              </span>
              <p className="font-bold text-emerald-800">Captured & Provenanced</p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider">Harvest Description</h3>
            <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
              {product.description || 'No description provided for this product batch.'}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
