import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProductByIdApi } from '../services/api';
import type { Product } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { GoldButton } from '../components/ui/GoldButton';
import { ArrowLeft, Edit3, QrCode } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    fetchProductByIdApi(token, parseInt(id, 10))
      .then((res) => setProduct(res))
      .catch((err) => setError(err.message || 'Failed to fetch batch details.'))
      .finally(() => setLoading(false));
  }, [token, id]);

  const pAny = product as any;

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] p-6 md:p-12 space-y-8 font-mono text-xs">
      
      <div className="flex items-center justify-between">
        <Link to="/products" className="flex items-center gap-2 text-[#9A9A93] hover:text-[#D4AF37]">
          <ArrowLeft className="w-4 h-4" /> Return to Products Directory
        </Link>
        <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-xs border border-[#D4AF37]/30">
          BATCH SPECIFICATIONS & TERROIR
        </span>
      </div>

      {loading ? (
        <div className="p-16 text-center text-[#9A9A93]">Loading product specs...</div>
      ) : error || !product ? (
        <div className="p-10 rounded-sm bg-[#101311] border border-[#E36B6B]/40 text-[#E36B6B]">
          {error || 'Batch not found.'}
        </div>
      ) : (
        <div className="space-y-8 max-w-4xl mx-auto">
          
          <div className="p-8 rounded-sm bg-[#101311] border border-[#1D221F] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1D221F] pb-4">
              <div>
                <span className="text-[#D4AF37] font-bold text-sm">{product.echochain_product_id}</span>
                <h1 className="text-4xl font-serif text-[#F5F3ED] mt-1">{product.product_name}</h1>
                <div className="text-[#9A9A93] mt-0.5">{product.brand}</div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={product.verification_status} size="lg" />
                <Link to={`/products/${product.id}/edit`}>
                  <button className="p-2.5 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] hover:border-[#D4AF37]">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <div className="text-[#9A9A93] uppercase">REGION / COUNTRY</div>
                <div className="text-[#F5F3ED] font-bold mt-1">{product.region}, {product.country}</div>
              </div>

              <div>
                <div className="text-[#9A9A93] uppercase">HARVEST DATE</div>
                <div className="text-[#F5F3ED] font-bold mt-1">{product.harvest_date}</div>
              </div>

              <div>
                <div className="text-[#9A9A93] uppercase">FARM / ESTATE</div>
                <div className="text-[#F5F3ED] font-bold mt-1">{pAny.farm_name || 'Independent Estate'}</div>
              </div>

              <div>
                <div className="text-[#9A9A93] uppercase">VARIETAL</div>
                <div className="text-[#F5F3ED] font-bold mt-1">{pAny.varietal || 'Heritage Single Origin'}</div>
              </div>

              <div>
                <div className="text-[#9A9A93] uppercase">PROCESSING METHOD</div>
                <div className="text-[#F5F3ED] font-bold mt-1">{pAny.processing_method || 'Washed'}</div>
              </div>

              <div>
                <div className="text-[#9A9A93] uppercase">BATCH WEIGHT</div>
                <div className="text-[#F5F3ED] font-bold mt-1">{pAny.batch_size_kg ? `${pAny.batch_size_kg} kg` : '500 kg'}</div>
              </div>
            </div>

            {product.description && (
              <div className="pt-4 border-t border-[#1D221F] space-y-2">
                <div className="text-[#9A9A93] uppercase font-bold">TERROIR & BATCH NOTES:</div>
                <p className="text-[#F5F3ED] leading-relaxed font-sans text-xs">{product.description}</p>
              </div>
            )}

            <div className="pt-4 border-t border-[#1D221F] flex flex-wrap items-center gap-4">
              <Link to={`/audio/capture?product_id=${product.id}`}>
                <GoldButton variant="primary" showArrow className="!py-3 !px-5 text-xs">
                  RECORD ENVIRONMENTAL AUDIO
                </GoldButton>
              </Link>

              <Link to={`/verify/${product.echochain_product_id}`}>
                <GoldButton variant="secondary" className="!py-3 !px-5 text-xs">
                  <QrCode className="w-4 h-4 inline mr-1 text-[#62C7C0]" /> CONSUMER QR CERTIFICATE
                </GoldButton>
              </Link>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
