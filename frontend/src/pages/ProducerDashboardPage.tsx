import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProducerStatsApi, fetchMyProductsApi } from '../services/api';
import type { ProducerStats, Product } from '../types';
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
  Layers
} from 'lucide-react';

export const ProducerDashboardPage: React.FC = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<ProducerStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [statsData, productsData] = await Promise.all([
        fetchProducerStatsApi(token),
        fetchMyProductsApi(token, undefined, undefined, undefined, 1, 5)
      ]);
      setStats(statsData);
      setRecentProducts(productsData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

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
    <div className="min-h-screen bg-[#F7F9F7] text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* TOP HEADER & QUICK ACTIONS */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 shadow-xl bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-mono font-bold border border-emerald-300">
              <Radio className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              Producer & Harvester Operations
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Producer Dashboard</h1>
            <p className="text-xs text-gray-600 font-mono">
              Welcome back, <span className="font-bold text-gray-800">{user?.fullName}</span> ({user?.organization || 'Independent Operator'})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link
              to="/producer/audio-capture"
              className="px-5 py-3 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:from-amber-300 hover:to-emerald-300 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4" />
              Audio Evidence Studio
            </Link>

            <Link
              to="/producer/products/new"
              className="px-4 py-3 rounded-xl text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              Register Batch
            </Link>

            <Link
              to="/producer/products"
              className="px-4 py-3 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-all flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4 text-emerald-700" />
              View Catalog
            </Link>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-3 rounded-xl border border-gray-300 bg-white text-gray-500 hover:text-gray-900 transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 5 DASHBOARD STATISTICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* 1. Total Products */}
          <div className="light-card p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
              <span>Total Products</span>
              <Package className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900 font-mono">
              {loading ? '...' : stats?.total_products || 0}
            </p>

          </div>

          {/* 2. Registered Batches */}
          <div className="light-card p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
              <span>Registered Batches</span>
              <Layers className="w-4 h-4 text-teal-700" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900 font-mono">
              {loading ? '...' : stats?.registered_batches || 0}
            </p>

          </div>

          {/* 3. Verified Products */}
          <div className="light-card p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
              <span>Verified Products</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-700 font-mono">
              {loading ? '...' : stats?.verified_products || 0}
            </p>

          </div>

          {/* 4. Pending Verification */}
          <div className="light-card p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
              <span>Pending Verification</span>
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
            <p className="text-3xl font-extrabold text-amber-700 font-mono">
              {loading ? '...' : stats?.pending_verification || 0}
            </p>

          </div>

          {/* 5. Flagged Products */}
          <div className="light-card p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-2 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
              <span>Flagged Products</span>
              <AlertTriangle className="w-4 h-4 text-rose-700" />
            </div>
            <p className="text-3xl font-extrabold text-rose-700 font-mono">
              {loading ? '...' : stats?.flagged_products || 0}
            </p>

          </div>

        </div>

        {/* RECENT PRODUCT BATCHES LISTING */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Product Inventory</span>
              <h2 className="text-xl font-bold text-gray-900">Recent Registered Batches</h2>
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
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" /> Loading batch catalog...
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-gray-50 border border-dashed border-gray-300 text-center space-y-3">
              <Package className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs font-bold text-gray-800">No products registered yet</p>
              <Link
                to="/producer/products/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300"
              >
                <Plus className="w-3.5 h-3.5" /> Register First Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Batch ID</th>
                    <th className="py-3 px-4">Product & Brand</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Public Terroir (Region)</th>
                    <th className="py-3 px-4">Harvest Date</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans text-gray-800">
                  {recentProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-emerald-800">
                        {p.batch_id}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-900 block">{p.product_name}</span>
                        <span className="text-[11px] text-gray-500">{p.brand}</span>
                      </td>
                      <td className="py-4 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-700">
                          {p.product_type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-1 font-semibold text-gray-800">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          {p.region}, {p.country}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-gray-600">
                        {p.harvest_date}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(p.verification_status)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono">
                        <Link
                          to={`/producer/products/${p.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-emerald-100 hover:text-emerald-900 font-semibold text-gray-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
