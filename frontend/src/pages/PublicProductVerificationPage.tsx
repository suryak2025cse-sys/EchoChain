import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicVerificationApi } from '../services/api';
import type { PublicVerificationResponse } from '../types';
import { VerificationBadge } from '../components/ui/VerificationBadge';
import { HashDisplay } from '../components/ui/HashDisplay';
import { AudioPlayer } from '../components/ui/AudioPlayer';
import { SpectrogramCanvas } from '../components/ui/SpectrogramCanvas';
import { StatusBadge } from '../components/ui/StatusBadge';
import { 
  MapPin, 
  Calendar, 
  Lock, 
  AlertTriangle,
  Radio,
  FileCheck
} from 'lucide-react';

export const PublicProductVerificationPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const productCode = code || 'ECH-COFFEE-8821';

  const [data, setData] = useState<PublicVerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPublicVerificationApi(productCode)
      .then((res: PublicVerificationResponse) => setData(res))
      .catch((err: any) => setError(err.message || 'Product verification certificate not found.'))
      .finally(() => setLoading(false));
  }, [productCode]);

  const p = data ? {
    echochain_product_id: data.echochain_product_id,
    product_name: data.product_name,
    brand: data.brand,
    region: data.region,
    country: data.country,
    harvest_date: data.harvest_date,
    description: data.description
  } : null;

  const prov = data?.cryptographic_proof;
  const audio = data?.acoustic_evidence;
  const acoustic = data?.acoustic_evidence;
  const poly = data?.blockchain_proof;

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] py-10 px-4 sm:px-6 md:px-12 selection:bg-[#D4AF37] selection:text-[#080A09] font-mono text-xs">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Brand Top Bar */}
        <div className="flex items-center justify-between border-b border-[#1D221F] pb-4">
          <Link to="/" className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase">
            ECHOCHAIN PROTOCOL
          </Link>
          <span className="text-[11px] text-[#7CC8A0] flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#7CC8A0] animate-pulse" />
            PUBLIC CONSUMER VERIFICATION LIVE
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#9A9A93] bg-[#101311] border border-[#1D221F] rounded-sm">
            Verifying cryptographic proofs & acoustic DSP signatures...
          </div>
        ) : error || !data ? (
          <div className="p-10 rounded-sm bg-[#101311] border border-[#E36B6B]/40 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-[#E36B6B] mx-auto" />
            <h2 className="text-2xl font-serif text-[#F5F3ED]">Certificate Verification Failed</h2>
            <p className="text-xs text-[#9A9A93] max-w-md mx-auto">{error || 'Unknown certificate ID'}</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* HERO VERIFICATION BADGE */}
            <VerificationBadge status={data.verification_status} productId={p?.echochain_product_id || productCode} />

            {/* PRIVACY PROTECTION CALLOUT */}
            <div className="p-4 rounded-xs bg-[#101311] border border-[#D4AF37]/30 flex items-start gap-3 text-xs">
              <Lock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[#D4AF37] font-bold uppercase tracking-wider">PROVENANCE PRIVACY GUARANTEE</span>
                <p className="text-[#9A9A93] leading-relaxed">
                  Exact harvest coordinates are protected to preserve estate privacy while proving regional terroir authenticity via ambient acoustic signatures.
                </p>
              </div>
            </div>

            {/* PRODUCT TERROIR SPECS */}
            {p && (
              <div className="p-8 rounded-sm bg-[#101311] border border-[#1D221F] space-y-6">
                <div className="flex items-center justify-between border-b border-[#1D221F] pb-4">
                  <div>
                    <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest">{p.brand}</span>
                    <h3 className="text-3xl font-serif text-[#F5F3ED] mt-1">{p.product_name}</h3>
                  </div>
                  <StatusBadge status={data.verification_status} size="lg" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
                  <div>
                    <div className="text-[#9A9A93] uppercase">ORIGIN REGION</div>
                    <div className="text-[#F5F3ED] font-bold mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#62C7C0]" /> {p.region}, {p.country}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#9A9A93] uppercase">HARVEST DATE</div>
                    <div className="text-[#F5F3ED] font-bold mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> {p.harvest_date}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#9A9A93] uppercase">FARM / ESTATE</div>
                    <div className="text-[#F5F3ED] font-bold mt-1">Protected Estate</div>
                  </div>
                </div>
              </div>
            )}

            {/* ACOUSTIC EVIDENCE & SPECTROGRAM */}
            {acoustic && (
              <div className="space-y-4">
                <h4 className="text-xl font-serif text-[#F5F3ED] flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[#62C7C0]" />
                  <span>Ambient Field Acoustic Evidence</span>
                </h4>

                <SpectrogramCanvas featureVector={acoustic.feature_vector || acoustic} height={180} />

                {audio?.audio_stream_url && (
                  <AudioPlayer src={audio.audio_stream_url} title={`Harvest Soundscape Signature (${p?.echochain_product_id})`} />
                )}
              </div>
            )}

            {/* CRYPTOGRAPHIC PROOF BREAKDOWN */}
            <div className="p-8 rounded-sm bg-[#101311] border border-[#1D221F] space-y-6">
              <h4 className="text-xl font-serif text-[#F5F3ED] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#D4AF37]" />
                <span>On-Chain Cryptographic Proof</span>
              </h4>

              <div className="space-y-4 text-xs">
                {prov?.provenance_hash && (
                  <div className="space-y-1">
                    <div className="text-[#9A9A93] uppercase">CANONICAL SHA-256 PROVENANCE DIGEST:</div>
                    <HashDisplay hash={prov.provenance_hash} />
                  </div>
                )}

                {prov?.ipfs_cid && (
                  <div className="space-y-1">
                    <div className="text-[#9A9A93] uppercase">IPFS DECENTRALIZED EVIDENCE CID:</div>
                    <HashDisplay hash={prov.ipfs_cid} label="CID" linkUrl={`https://gateway.pinata.cloud/ipfs/${prov.ipfs_cid}`} />
                  </div>
                )}

                {poly?.tx_hash && (
                  <div className="space-y-1">
                    <div className="text-[#9A9A93] uppercase">POLYGON TESTNET SMART CONTRACT TX:</div>
                    <HashDisplay hash={poly.tx_hash} label="TX" linkUrl={`https://amoy.polygonscan.com/tx/${poly.tx_hash}`} />
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER CTA */}
            <div className="pt-6 border-t border-[#1D221F] text-center space-y-3">
              <p className="text-xs text-[#9A9A93]">
                Secured by <span className="text-[#D4AF37] font-bold">EchoChain Protocol</span> • Powered by Polygon Testnet & Pinata IPFS
              </p>
              <Link to="/" className="text-xs text-[#62C7C0] hover:underline block font-bold">
                Learn more about EchoChain Acoustic Intelligence →
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
