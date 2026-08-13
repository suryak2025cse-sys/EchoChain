import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyzeAcousticCaptureApi, getAcousticFingerprintApi, getAudioCaptureStreamUrl } from '../services/api';
import type { AcousticFingerprint } from '../types';
import { 
  Activity, 
  ArrowLeft, 
  RefreshCw, 
  Cpu, 
  BarChart2, 
  Tag, 
  AlertCircle, 
  Info, 
  Copy, 
  FileAudio
} from 'lucide-react';

export const AcousticAnalysisPage: React.FC = () => {
  const { captureId } = useParams<{ captureId: string }>();
  const { token } = useAuth();
  
  const [fingerprint, setFingerprint] = useState<AcousticFingerprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    if (!token || !captureId) return;
    setLoading(true);
    setError(null);
    try {
      // Try fetching existing fingerprint first; if not found, trigger analysis
      try {
        const fp = await getAcousticFingerprintApi(token, captureId);
        setFingerprint(fp);
      } catch (err) {
        setAnalyzing(true);
        const fp = await analyzeAcousticCaptureApi(token, captureId);
        setFingerprint(fp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze acoustic capture.');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, captureId]);

  const handleReanalyze = async () => {
    if (!token || !captureId) return;
    setAnalyzing(true);
    setError(null);
    try {
      const fp = await analyzeAcousticCaptureApi(token, captureId);
      setFingerprint(fp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Re-analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyHash = () => {
    if (fingerprint?.fingerprint) {
      navigator.clipboard.writeText(fingerprint.fingerprint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || analyzing) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] flex flex-col items-center justify-center font-mono text-xs text-gray-600">
        <Cpu className="w-8 h-8 animate-spin text-emerald-700 mb-3" />
        <span className="font-bold text-gray-900 text-sm">Processing Acoustic Signal & Feature Extraction...</span>
        <span className="text-gray-500 mt-1">Extracting MFCCs, Mel Spectrogram, Spectral Centroid, Bandwidth & Chroma</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* BREADCRUMB */}
        <div className="flex items-center justify-between">
          <Link
            to="/producer/audio-capture"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Audio Evidence Studio
          </Link>

          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 flex items-center gap-1.5 transition-colors font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} /> Re-run DSP Pipeline
          </button>
        </div>

        {/* HERO BANNER CARD */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-mono font-bold border border-emerald-300">
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              DSP Acoustic Feature Extraction (Phase 6)
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Acoustic Signal Analysis</h1>
            <p className="text-xs text-gray-600 font-mono">
              Capture ID: <span className="font-bold text-emerald-800">{captureId}</span> • Algorithm: {fingerprint?.algorithm_version}
            </p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-right font-mono text-xs text-emerald-900">
            <span className="block text-[10px] text-gray-500 uppercase font-semibold">Signal Classification</span>
            <span className="font-extrabold text-sm text-emerald-800 flex items-center gap-1.5 justify-end">
              <Tag className="w-4 h-4 text-emerald-700" /> Acoustic similarity signal
            </span>
          </div>
        </div>

        {/* SCIENTIFIC DISCLAIMER CARD */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Scientific Classification & Privacy Notice</span>
            <p className="text-[11px] text-amber-800 leading-relaxed font-mono">
              This feature representation is an <strong>"Acoustic similarity signal"</strong>. It represents probabilistic acoustic match evidence for product origin verification and does NOT claim deterministic exact location proof.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {fingerprint && (
          <div className="space-y-8">

            {/* FINGERPRINT REPRESENTATION CARD */}
            <div className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Fingerprint Commitment</span>
                  <h2 className="text-xl font-bold text-gray-900">Acoustic Fingerprint Hash</h2>
                </div>

                <button
                  onClick={handleCopyHash}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-700" />
                  {copied ? 'Copied Hash!' : 'Copy SHA-256 Hash'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900 text-emerald-400 font-mono text-xs break-all space-y-2">
                <span className="text-gray-400 text-[10px] uppercase font-semibold block">SHA-256 Acoustic Commitment Fingerprint</span>
                <p className="font-bold text-sm text-emerald-300">{fingerprint.fingerprint}</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 font-mono text-xs space-y-1">
                <span className="text-gray-500 text-[10px] uppercase font-semibold block">Packed Binary/Hex Feature Vector</span>
                <p className="text-gray-700 truncate">{fingerprint.fingerprint_hex_vector}</p>
              </div>
            </div>

            {/* AUDIO PLAYBACK PLAYER */}
            <div className="light-card p-6 rounded-3xl border border-gray-200/80 bg-white shadow-md space-y-3">
              <span className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-emerald-700" /> Audio Sample Playback
              </span>
              <audio controls src={getAudioCaptureStreamUrl(captureId!)} className="w-full h-10" />
            </div>

            {/* VISUAL FEATURE PLOTS GRID */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-700" /> Visual Feature Extraction Spectral Plots
              </h2>

              <div className="grid grid-cols-1 gap-6">

                {/* Plot 1: Waveform */}
                {fingerprint.waveform_plot_b64 && (
                  <div className="light-card p-6 rounded-3xl border border-gray-200/80 bg-white shadow-lg space-y-3">
                    <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
                      1. Temporal Waveform (Normalized Amplitude)
                    </span>
                    <img
                      src={fingerprint.waveform_plot_b64}
                      alt="Temporal Waveform"
                      className="w-full rounded-xl border border-gray-900 bg-slate-950 shadow-inner"
                    />
                  </div>
                )}

                {/* Plot 2: Mel Spectrogram */}
                {fingerprint.melspectrogram_plot_b64 && (
                  <div className="light-card p-6 rounded-3xl border border-gray-200/80 bg-white shadow-lg space-y-3">
                    <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
                      2. Mel Spectrogram Heatmap (dB)
                    </span>
                    <img
                      src={fingerprint.melspectrogram_plot_b64}
                      alt="Mel Spectrogram"
                      className="w-full rounded-xl border border-gray-900 bg-slate-950 shadow-inner"
                    />
                  </div>
                )}

                {/* Plot 3: MFCC Heatmap */}
                {fingerprint.mfcc_plot_b64 && (
                  <div className="light-card p-6 rounded-3xl border border-gray-200/80 bg-white shadow-lg space-y-3">
                    <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
                      3. MFCC Feature Matrix (13 Mel-Frequency Cepstral Coefficients)
                    </span>
                    <img
                      src={fingerprint.mfcc_plot_b64}
                      alt="MFCC Heatmap"
                      className="w-full rounded-xl border border-gray-900 bg-slate-950 shadow-inner"
                    />
                  </div>
                )}

              </div>
            </div>

            {/* EXTRACTED FEATURE SUMMARY METRICS TABLE */}
            <div className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl space-y-6">
              <div className="pb-3 border-b border-gray-100">
                <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Feature Vector Metrics</span>
                <h2 className="text-xl font-bold text-gray-900">Extracted Acoustic Feature Summary</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
                  <span className="text-gray-500 text-[10px] uppercase font-semibold">Spectral Centroid</span>
                  <p className="font-bold text-gray-900">{fingerprint.feature_vector.spectral_centroid_mean} Hz</p>
                  <span className="text-[10px] text-gray-500">std: ±{fingerprint.feature_vector.spectral_centroid_std}</span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
                  <span className="text-gray-500 text-[10px] uppercase font-semibold">Spectral Bandwidth</span>
                  <p className="font-bold text-gray-900">{fingerprint.feature_vector.spectral_bandwidth_mean} Hz</p>
                  <span className="text-[10px] text-gray-500">std: ±{fingerprint.feature_vector.spectral_bandwidth_std}</span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
                  <span className="text-gray-500 text-[10px] uppercase font-semibold">Spectral Contrast</span>
                  <p className="font-bold text-gray-900">{fingerprint.feature_vector.spectral_contrast_mean} dB</p>
                  <span className="text-[10px] text-gray-500">std: ±{fingerprint.feature_vector.spectral_contrast_std}</span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
                  <span className="text-gray-500 text-[10px] uppercase font-semibold">Zero-Crossing Rate</span>
                  <p className="font-bold text-gray-900">{fingerprint.feature_vector.zero_crossing_rate_mean}</p>
                  <span className="text-[10px] text-gray-500">std: ±{fingerprint.feature_vector.zero_crossing_rate_std}</span>
                </div>
              </div>

              {/* MFCC COEFF VECTOR & CHROMA VECTOR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <span className="text-gray-700 text-xs font-bold block">MFCC 13 Mean Coefficients Vector</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {fingerprint.feature_vector.mfcc_means.map((val, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white border border-gray-200 rounded text-[11px] font-bold text-emerald-800">
                        C{idx+1}: {val}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <span className="text-gray-700 text-xs font-bold block">Chroma 12 Pitch Classes Vector</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {fingerprint.feature_vector.chroma_means.map((val, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white border border-gray-200 rounded text-[11px] font-bold text-teal-800">
                        P{idx+1}: {val}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
