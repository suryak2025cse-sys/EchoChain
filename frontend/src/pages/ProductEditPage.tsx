import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProductByIdApi, updateProductApi } from '../services/api';
import type { Product } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  Lock, 
  AlertCircle, 
  Save, 
  RefreshCw 
} from 'lucide-react';

export const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('');
  const [brand, setBrand] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [description, setDescription] = useState('');
  const [certificationStatus, setCertificationStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!token || !id) return;
      setLoading(true);
      setError(null);
      try {
        const p = await fetchProductByIdApi(token, parseInt(id, 10));
        setProduct(p);
        setProductName(p.product_name);
        setProductType(p.product_type);
        setBrand(p.brand);
        setRegion(p.region);
        setCountry(p.country);
        setHarvestDate(p.harvest_date);
        setDescription(p.description || '');
        setCertificationStatus(p.certification_status);
        setVerificationStatus(p.verification_status);
        setLatitude(p.protected_gps_latitude?.toString() || '');
        setLongitude(p.protected_gps_longitude?.toString() || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [token, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    setError(null);
    setSubmitting(true);

    try {
      await updateProductApi(token, parseInt(id, 10), {
        product_name: productName,
        product_type: productType,
        brand,
        region,
        country,
        harvest_date: harvestDate,
        description: description || undefined,
        certification_status: certificationStatus,
        verification_status: verificationStatus,
        protected_gps_latitude: latitude ? parseFloat(latitude) : undefined,
        protected_gps_longitude: longitude ? parseFloat(longitude) : undefined,
      });

      navigate(`/producer/products/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center font-mono text-xs text-gray-500">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-700 mr-2" /> Loading product...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* BREADCRUMB */}
        <div>
          <Link
            to={`/producer/products/${id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors font-mono mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel & Return
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Edit Product Batch</h1>
          <p className="text-xs text-gray-600 font-mono mt-1">
            Batch ID: <span className="font-bold text-emerald-800">{product?.batch_id}</span>
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* EDIT FORM */}
        <form onSubmit={handleSubmit} className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl space-y-6 text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Brand / Estate</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Product Type</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900 bg-white"
              >
                <option value="Specialty Coffee">Specialty Coffee</option>
                <option value="Organic Tea">Organic Tea</option>
                <option value="Cocoa">Cocoa</option>
                <option value="Wine">Wine</option>
                <option value="Essential Oils">Essential Oils</option>
                <option value="Artisan Honey">Artisan Honey</option>
                <option value="Botanicals">Botanicals</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Certification Status</label>
              <select
                value={certificationStatus}
                onChange={(e) => setCertificationStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900 bg-white"
              >
                <option value="Pending Review">Pending Review</option>
                <option value="Certified Organic">Certified Organic</option>
                <option value="Fair Trade">Fair Trade</option>
                <option value="Rainforest Alliance">Rainforest Alliance</option>
                <option value="Uncertified">Uncertified</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Verification Status</label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900 bg-white"
              >
                <option value="UNVERIFIED">UNVERIFIED</option>
                <option value="PENDING">PENDING</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="FLAGGED">FLAGGED</option>
              </select>
            </div>
          </div>

          {/* PUBLIC REGIONAL TERROIR */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" /> Public Terroir Location
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Region</label>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* PROTECTED GPS */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-700" /> Protected GPS Coordinates (Private)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Harvest Date</label>
            <input
              type="date"
              required
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900 bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Link
              to={`/producer/products/${id}`}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:from-amber-300 hover:to-emerald-300 shadow-md transition-all flex items-center gap-2"
            >
              {submitting ? 'Saving Changes...' : 'Save Product Specifications'}
              <Save className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
