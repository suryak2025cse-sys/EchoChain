import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyProductsApi, deleteProductApi } from '../services/api';
import type { PaginatedProducts } from '../types';
import { 
  Package, 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Eye, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export const ProductListPage: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [search, setSearch] = useState('');
  const [productType, setProductType] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadProducts = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMyProductsApi(
        token,
        search.trim() || undefined,
        productType || undefined,
        verificationStatus || undefined,
        page,
        10
      );
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [token, page, productType, verificationStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleDelete = async (id: number) => {
    if (!token || !window.confirm('Are you sure you want to delete this product batch record?')) return;
    setDeletingId(id);
    try {
      await deleteProductApi(token, id);
      loadProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeletingId(null);
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
            <Clock className="w-3 h-3 text-amber-700 animate-pulse" /> Pending
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

        {/* BREADCRUMB & HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/producer/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors font-mono mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900">Product Batch Catalog</h1>
            <p className="text-xs text-gray-600 font-mono mt-1">
              Search, filter, and manage physical harvest batches
            </p>
          </div>

          <Link
            to="/producer/products/new"
            className="px-5 py-3 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:from-amber-300 hover:to-emerald-300 shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Register Product Batch
          </Link>
        </div>

        {/* SEARCH & FILTER CONTROLS BAR */}
        <div className="light-card p-6 rounded-2xl border border-gray-200/80 bg-white shadow-md space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name, brand, region, country, or batch ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900 bg-white"
              />
            </div>

            {/* Product Type Filter */}
            <div className="sm:col-span-3">
              <select
                value={productType}
                onChange={(e) => { setProductType(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:border-emerald-600 outline-none"
              >
                <option value="">All Product Types</option>
                <option value="Specialty Coffee">Specialty Coffee</option>
                <option value="Organic Tea">Organic Tea</option>
                <option value="Cocoa">Cocoa</option>
                <option value="Wine">Wine</option>
                <option value="Essential Oils">Essential Oils</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <select
                value={verificationStatus}
                onChange={(e) => { setVerificationStatus(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:border-emerald-600 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending Review</option>
                <option value="UNVERIFIED">Unverified</option>
                <option value="FLAGGED">Flagged</option>
              </select>
            </div>

          </form>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* PRODUCT CATALOG GRID */}
        {loading ? (
          <div className="py-16 text-center font-mono text-xs text-gray-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-700" /> Fetching product inventory...
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="light-card p-12 rounded-3xl border border-gray-200/80 bg-white text-center space-y-4 shadow-xl">
            <Package className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">No matching products found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try adjusting your search criteria or register a new harvest batch.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((p) => (
                <div key={p.id} className="light-card p-6 rounded-2xl border border-gray-200/80 bg-white shadow-md light-card-hover flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        {p.batch_id}
                      </span>
                      {getStatusBadge(p.verification_status)}
                    </div>

                    <h3 className="text-lg font-extrabold text-gray-900">{p.product_name}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{p.brand} • {p.product_type}</p>

                    <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                      {p.description || 'No description provided.'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-700">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Public Terroir: {p.region}, {p.country}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-500 font-mono text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Harvested: {p.harvest_date}
                        </span>
                        <span>{p.certification_status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2 text-xs font-mono">
                    <Link
                      to={`/producer/products/${p.id}`}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/producer/products/${p.id}/edit`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200 flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            {data.pages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 text-xs font-mono">
                <span className="text-gray-500">
                  Page {data.page} of {data.pages} ({data.total} total items)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-3 py-1 bg-white border border-gray-300 rounded-lg font-bold">
                    {page}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page >= data.pages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
