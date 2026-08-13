import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createProductApi } from '../services/api';
import { 
  PackagePlus, 
  ArrowLeft, 
  MapPin, 
  Lock, 
  AlertCircle 
} from 'lucide-react';

export const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('Specialty Coffee');
  const [brand, setBrand] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('Ethiopia');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [certificationStatus, setCertificationStatus] = useState('Pending Review');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setLoading(true);

    try {
      await createProductApi(token, {
        product_name: productName,
        product_type: productType,
        brand,
        region,
        country,
        harvest_date: harvestDate,
        description: description || undefined,
        certification_status: certificationStatus,
        protected_gps_latitude: latitude ? parseFloat(latitude) : undefined,
        protected_gps_longitude: longitude ? parseFloat(longitude) : undefined,
      });

      navigate('/producer/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* BREADCRUMB */}
        <div>
          <Link
            to="/producer/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors font-mono mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Catalog
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Register New Harvest Batch</h1>
          <p className="text-xs text-gray-600 font-mono mt-1">
            Tag physical harvest origin & seal provenance specifications
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* CREATE FORM */}
        <form onSubmit={handleSubmit} className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl space-y-6 text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Yirgacheffe Heirloom Coffee"
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
                placeholder="e.g. Highland Terroir Co-op"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* PUBLIC TERROIR LOCATION */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" /> Public Regional Terroir (Visible on Ledger & QR)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Region / Terroir Name</label>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Sidama Highlands"
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
                  placeholder="e.g. Ethiopia"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* PROTECTED EXACT GPS (ZERO PUBLIC EXPOSURE) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-700" /> Protected Exact GPS (Private Field)
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded font-bold">
                🔒 NEVER EXPOSED PUBLICLY
              </span>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed">
              Exact harvest coordinates remain strictly protected in private database storage and will <strong>NEVER</strong> be written to public smart contracts or returned in public verification APIs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Latitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 6.1622"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Longitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 38.2058"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Batch ID Generation</label>
              <input
                type="text"
                disabled
                value="Auto-generated on submit (e.g. ECH-BATCH-XXXX)"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-500 bg-gray-50 font-mono italic"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-gray-700 mb-1">Product Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe cultivation conditions, processing methods, and ecosystem characteristics..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-600 outline-none text-xs text-gray-900"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Link
              to="/producer/products"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:from-amber-300 hover:to-emerald-300 shadow-md transition-all flex items-center gap-2"
            >
              {loading ? 'Registering Batch...' : 'Register Product Batch'}
              <PackagePlus className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
