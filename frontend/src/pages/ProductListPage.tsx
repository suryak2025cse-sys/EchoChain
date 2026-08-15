import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyProductsApi } from '../services/api';
import type { Product } from '../types';
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';
import { StatusBadge } from '../components/ui/StatusBadge';
import { GoldButton } from '../components/ui/GoldButton';
import { ArrowLeft, RefreshCw, MapPin, Calendar, Package } from 'lucide-react';

export const ProductListPage: React.FC = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMyProductsApi(token);
      setProducts(res.items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch registered products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] p-6 md:p-12 space-y-8 font-mono text-xs">
      
      <div className="flex items-center justify-between">
        <Link to="/producer/dashboard" className="flex items-center gap-2 text-[#9A9A93] hover:text-[#D4AF37]">
          <ArrowLeft className="w-4 h-4" /> Return to Control Center
        </Link>
        <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-xs border border-[#D4AF37]/30">
          PRODUCER BATCH CATALOG
        </span>
      </div>

      <div className="relative p-8 rounded-sm bg-[#101311] border border-[#1D221F] overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-25">
          <EcosystemWaveform height={160} color="#D4AF37" speed={0.015} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-serif font-light text-[#F5F3ED]">
              Registered Batches Catalog
            </h1>
            <p className="text-xs text-[#9A9A93]">
              Manage agricultural batches registered for environmental acoustic provenance
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/products/new">
              <GoldButton variant="primary" showArrow className="!py-3 !px-5 text-xs">
                REGISTER NEW BATCH
              </GoldButton>
            </Link>

            <button onClick={loadProducts} className="p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] hover:border-[#D4AF37]">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-[#9A9A93]">Querying batch directory...</div>
      ) : products.length === 0 ? (
        <div className="p-16 text-center rounded-xs bg-[#101311] border border-[#1D221F] text-[#9A9A93] space-y-4">
          <Package className="w-8 h-8 text-[#9A9A93] mx-auto" />
          <div className="text-sm font-semibold text-[#F5F3ED]">No Batches Registered</div>
          <p className="max-w-sm mx-auto">Register your first batch to start recording environmental soundscapes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(prod => (
            <div key={prod.id} className="p-6 rounded-sm bg-[#101311] border border-[#1D221F] hover:border-[#D4AF37]/40 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#D4AF37]">{prod.echochain_product_id || `BATCH-#${prod.id}`}</span>
                <StatusBadge status={prod.verification_status} size="sm" />
              </div>

              <div>
                <h3 className="text-2xl font-serif text-[#F5F3ED]">{prod.product_name}</h3>
                <div className="text-[#9A9A93]">{prod.brand}</div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-[#1D221F] text-[#9A9A93]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#62C7C0]" /> {prod.region}, {prod.country}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> Harvested: {prod.harvest_date}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link to={`/products/${prod.id}`} className="text-[#D4AF37] hover:underline font-bold">
                  View Batch Specs →
                </Link>

                <Link
                  to={`/audio/capture?product_id=${prod.id}`}
                  className="px-3 py-1.5 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] hover:border-[#D4AF37]"
                >
                  Audio Ingest
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
