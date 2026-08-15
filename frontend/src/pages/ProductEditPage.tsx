import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProductByIdApi, updateProductApi } from '../services/api';
import { GoldButton } from '../components/ui/GoldButton';
import { ArrowLeft } from 'lucide-react';

export const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    fetchProductByIdApi(token, parseInt(id, 10))
      .then((p) => {
        setProductName(p.product_name);
        setBrand(p.brand);
        setCountry(p.country);
        setRegion(p.region);
        setHarvestDate(p.harvest_date);
        setDescription(p.description || '');
      })
      .catch((err) => setError(err.message || 'Failed to fetch product.'))
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    setSubmitting(true);
    setError(null);

    try {
      await updateProductApi(token, parseInt(id, 10), {
        product_name: productName,
        brand,
        country,
        region,
        harvest_date: harvestDate,
        description: description || undefined
      });

      navigate(`/products/${id}`);
    } catch (err: any) {
      setError(err.message || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] p-6 md:p-12 space-y-8 font-mono text-xs">
      
      <div className="flex items-center justify-between">
        <Link to={`/products/${id}`} className="flex items-center gap-2 text-[#9A9A93] hover:text-[#D4AF37]">
          <ArrowLeft className="w-4 h-4" /> Cancel & Return
        </Link>
        <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-xs border border-[#D4AF37]/30">
          EDIT BATCH METADATA
        </span>
      </div>

      <div className="max-w-2xl mx-auto p-10 rounded-sm bg-[#101311] border border-[#1D221F] space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="relative z-10 space-y-2 text-center">
          <h1 className="text-3xl font-serif font-light text-[#F5F3ED]">
            Update Batch Metadata
          </h1>
          <p className="text-xs text-[#9A9A93]">
            Modify non-sealed batch specifications
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-[#9A9A93]">Loading specs...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#9A9A93] mb-1 font-semibold">Product Batch Name *</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className="w-full p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[#9A9A93] mb-1 font-semibold">Brand / Estate Label</label>
                <input
                  type="text"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#9A9A93] mb-1 font-semibold">Country *</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[#9A9A93] mb-1 font-semibold">Region *</label>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <GoldButton
              type="submit"
              disabled={submitting}
              showArrow
              className="w-full !py-3.5"
            >
              {submitting ? 'Saving Changes...' : 'Save Updated Batch Metadata'}
            </GoldButton>
          </form>
        )}

      </div>

    </div>
  );
};
