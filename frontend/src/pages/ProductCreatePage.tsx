import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createProductApi } from '../services/api';
import { GoldButton } from '../components/ui/GoldButton';
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';
import { ArrowLeft } from 'lucide-react';

export const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [country, setCountry] = useState('Ethiopia');
  const [region, setRegion] = useState('Sidama');
  const [harvestDate, setHarvestDate] = useState('2026-08-14');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const created = await createProductApi(token, {
        product_name: productName,
        product_type: 'AGRICULTURAL_BATCH',
        brand: brand || 'EchoChain Terroir Estate',
        country,
        region,
        harvest_date: harvestDate,
        description: description || undefined
      });

      navigate(`/products/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create product batch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] p-6 md:p-12 space-y-8 font-mono text-xs">
      
      <div className="flex items-center justify-between">
        <Link to="/producer/dashboard" className="flex items-center gap-2 text-[#9A9A93] hover:text-[#D4AF37]">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
        <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-xs border border-[#D4AF37]/30">
          REGISTER NEW BATCH
        </span>
      </div>

      <div className="max-w-2xl mx-auto p-10 rounded-sm bg-[#101311] border border-[#1D221F] space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <EcosystemWaveform height={280} color="#D4AF37" speed={0.015} />
        </div>

        <div className="relative z-10 space-y-2 text-center">
          <h1 className="text-3xl font-serif font-light text-[#F5F3ED]">
            Register Agricultural Batch
          </h1>
          <p className="text-xs text-[#9A9A93]">
            Enter harvest terroir metadata to initialize provenance timeline
          </p>
        </div>

        {error && (
          <div className="relative z-10 p-4 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9A9A93] mb-1 font-semibold">Product Batch Name *</label>
              <input
                type="text"
                required
                placeholder="Sidama Reserve Coffee"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                className="w-full p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-[#9A9A93] mb-1 font-semibold">Brand / Estate Label</label>
              <input
                type="text"
                placeholder="Highland Terroir Co."
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9A9A93] mb-1 font-semibold">Country of Origin *</label>
              <input
                type="text"
                required
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-[#9A9A93] mb-1 font-semibold">Region / Zone *</label>
              <input
                type="text"
                required
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9A9A93] mb-1 font-semibold">Harvest Date *</label>
            <input
              type="date"
              required
              value={harvestDate}
              onChange={e => setHarvestDate(e.target.value)}
              className="w-full p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-[#9A9A93] mb-1 font-semibold">Terroir & Batch Description</label>
            <textarea
              rows={3}
              placeholder="Notes on rainfall, elevation, processing..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] outline-none focus:border-[#D4AF37]"
            />
          </div>

          <GoldButton
            type="submit"
            disabled={loading}
            showArrow
            className="w-full !py-3.5"
          >
            {loading ? 'Creating Batch...' : 'Register Batch & Proceed to Audio Capture'}
          </GoldButton>
        </form>

      </div>

    </div>
  );
};
