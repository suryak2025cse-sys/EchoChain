import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadAudioApi } from '../services/api';
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';
import { GoldButton } from '../components/ui/GoldButton';
import { Radio, FileAudio, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SoftwareAudioCapturePage: React.FC = () => {
  const { token } = useAuth();
  const [productId, setProductId] = useState('1');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !file) return;
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      await uploadAudioApi(token, parseInt(productId, 10), file);
      setSuccess(`✓ Environmental audio sample "${file.name}" successfully uploaded and queued for DSP spectral analysis!`);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] p-6 md:p-12 space-y-8 font-mono text-xs">
      
      <div className="flex items-center justify-between">
        <Link to="/producer/dashboard" className="flex items-center gap-2 text-[#9A9A93] hover:text-[#D4AF37]">
          <ArrowLeft className="w-4 h-4" /> Return to Producer Control Center
        </Link>
        <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-xs border border-[#D4AF37]/30">
          SOFTWARE AUDIO FILE INGEST
        </span>
      </div>

      <div className="max-w-xl mx-auto p-10 rounded-sm bg-[#101311] border border-[#1D221F] space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <EcosystemWaveform height={280} color="#D4AF37" speed={0.015} />
        </div>

        <div className="relative z-10 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#080A09] border border-[#1D221F] text-xs text-[#D4AF37]">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> ENVIRONMENTAL FILE UPLOAD
          </div>
          <h1 className="text-3xl font-serif font-light text-[#F5F3ED]">
            Upload Acoustic Evidence File
          </h1>
          <p className="text-xs text-[#9A9A93]">
            Select WAV, FLAC, or MP3 field recording sample
          </p>
        </div>

        {error && (
          <div className="relative z-10 p-4 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B]">
            {error}
          </div>
        )}

        {success && (
          <div className="relative z-10 p-4 rounded-xs bg-[#7CC8A0]/10 border border-[#7CC8A0]/40 text-[#7CC8A0]">
            {success}
          </div>
        )}

        <form onSubmit={handleUpload} className="relative z-10 space-y-5">
          <div>
            <label className="block text-[#9A9A93] mb-2 font-semibold uppercase">Product Batch ID *</label>
            <input
              type="number"
              required
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full p-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-[#F5F3ED] focus:border-[#D4AF37] outline-none"
            />
          </div>

          <div>
            <label className="block text-[#9A9A93] mb-2 font-semibold uppercase">Audio Recording File (.wav, .flac, .mp3) *</label>
            <div className="p-8 border-2 border-dashed border-[#1D221F] hover:border-[#D4AF37]/50 rounded-xs bg-[#080A09] text-center space-y-3">
              <FileAudio className="w-8 h-8 text-[#D4AF37] mx-auto" />
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
                id="audio-file-input"
              />
              <label htmlFor="audio-file-input" className="cursor-pointer text-[#F5F3ED] hover:underline block font-semibold">
                {file ? file.name : 'Click to select audio file from disk'}
              </label>
              <div className="text-[11px] text-[#9A9A93]">Recommended: 5-second ambient 22.05kHz WAV sample</div>
            </div>
          </div>

          <GoldButton
            type="submit"
            disabled={uploading || !file}
            showArrow
            className="w-full !py-3.5"
          >
            {uploading ? 'Processing File...' : 'Upload & Compute Acoustic Signature'}
          </GoldButton>
        </form>
      </div>

    </div>
  );
};
