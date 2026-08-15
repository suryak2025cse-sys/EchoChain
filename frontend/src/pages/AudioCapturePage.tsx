import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  fetchProductByIdApi, 
  uploadAudioApi, 
  fetchAudioRecordingsApi, 
  deleteAudioApi 
} from '../services/api';
import type { Product, AudioRecording } from '../types';
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AudioPlayer } from '../components/ui/AudioPlayer';
import { GoldButton } from '../components/ui/GoldButton';
import { 
  Mic, 
  Square, 
  Trash2, 
  Activity, 
  ArrowLeft, 
  Radio
} from 'lucide-react';

export const AudioCapturePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const productIdQuery = searchParams.get('product_id');
  const targetId = id || productIdQuery || '1';

  const { token } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Recorder State
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const loadData = async () => {
    if (!token || !targetId) return;
    setError(null);
    try {
      const prodId = parseInt(targetId, 10);
      const [prodData, audioData] = await Promise.all([
        fetchProductByIdApi(token, prodId).catch(() => null),
        fetchAudioRecordingsApi(token, prodId).catch(() => [])
      ]);
      setProduct(prodData);
      setRecordings((audioData as any).items || (Array.isArray(audioData) ? audioData : []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audio capture page.');
    }
  };

  useEffect(() => {
    loadData();
  }, [token, targetId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Microphone access denied or unavailable on this device.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleUploadBlob = async () => {
    if (!token || !audioBlob || !targetId) return;
    setUploading(true);
    setError(null);
    try {
      const file = new File([audioBlob], `capture_${Date.now()}.wav`, { type: 'audio/wav' });
      await uploadAudioApi(token, parseInt(targetId, 10), file);
      setAudioBlob(null);
      setAudioUrl(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (recordingId: number) => {
    if (!token) return;
    try {
      await deleteAudioApi(token, parseInt(targetId, 10), recordingId);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Delete failed.');
    }
  };

  const formatSecs = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] p-6 md:p-12 space-y-10">
      
      {/* Top Header */}
      <div className="flex items-center justify-between font-mono text-xs">
        <Link to="/producer/dashboard" className="flex items-center gap-2 text-[#9A9A93] hover:text-[#D4AF37]">
          <ArrowLeft className="w-4 h-4" /> Return to Producer Control Center
        </Link>
        <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-xs border border-[#D4AF37]/30">
          ● SCIENTIFIC FIELD INSTRUMENT ACTIVE
        </span>
      </div>

      {/* Main Recording Console Card */}
      <div className="relative p-10 md:p-16 rounded-sm bg-[#101311] border border-[#1D221F] text-center space-y-8 shadow-2xl overflow-hidden">
        
        {/* Ambient Waveform Display */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <EcosystemWaveform height={340} color={recording ? '#E36B6B' : '#D4AF37'} speed={recording ? 0.04 : 0.015} />
        </div>

        <div className="relative z-10 space-y-3 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xs bg-[#080A09] border border-[#1D221F] text-xs font-mono text-[#D4AF37]">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> ENVIRONMENTAL ACOUSTIC INGEST
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light text-[#F5F3ED]">
            Environmental Field Recorder
          </h1>
          {product && (
            <p className="text-xs font-mono text-[#9A9A93]">
              Target Batch: <span className="text-[#D4AF37] font-bold">{product.product_name}</span> ({product.region}, {product.country})
            </p>
          )}
        </div>

        {/* Live Timer Display */}
        <div className="relative z-10 font-mono text-6xl font-extralight tracking-widest text-[#D4AF37]">
          {formatSecs(recordingTime)}
        </div>

        {/* Central Recording Button Ring */}
        <div className="relative z-10 flex justify-center">
          <div className={`p-4 rounded-full transition-all duration-300 ${
            recording
              ? 'bg-[#E36B6B]/20 border-2 border-[#E36B6B] animate-ping'
              : 'bg-[#D4AF37]/10 border border-[#D4AF37]/40'
          }`}>
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`w-28 h-28 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-2xl transition-all ${
                recording
                  ? 'bg-[#E36B6B] text-[#F5F3ED] hover:bg-[#E36B6B]/80'
                  : 'bg-gold-metallic text-[#080A09]'
              }`}
            >
              {recording ? (
                <div className="flex flex-col items-center gap-1">
                  <Square className="w-7 h-7 fill-current" />
                  <span>STOP</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Mic className="w-7 h-7" />
                  <span>RECORD</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Status */}
        <div className="relative z-10 font-mono text-xs text-[#9A9A93] space-y-1">
          <div>STATUS: <span className={recording ? 'text-[#E36B6B] font-bold' : 'text-[#D4AF37]'}>{recording ? 'RECORDING IN PROGRESS' : 'READY TO RECORD'}</span></div>
          <div className="text-[11px]">SAMPLING RATE: 22.05 kHz • 16-BIT MONO PCM • REAL-TIME NOISE SNR DENSITY</div>
        </div>

        {/* Preview & Upload Section */}
        {audioUrl && (
          <div className="relative z-10 max-w-md mx-auto p-6 rounded-xs bg-[#080A09] border border-[#1D221F] space-y-4 text-left font-mono text-xs">
            <div className="text-[#D4AF37] font-bold">✓ Audio Sample Preview Ready</div>
            <AudioPlayer src={audioUrl} title="Recorded Environmental Sample" />
            
            <div className="flex items-center gap-3">
              <GoldButton
                onClick={handleUploadBlob}
                disabled={uploading}
                showArrow
                className="flex-1 !py-3"
              >
                {uploading ? 'Uploading...' : 'Save & Sync Capture'}
              </GoldButton>

              <button
                onClick={() => { setAudioBlob(null); setAudioUrl(null); }}
                className="px-4 py-3 rounded-xs bg-[#101311] border border-[#1D221F] text-[#9A9A93] hover:text-[#E36B6B]"
              >
                Discard
              </button>
            </div>
          </div>
        )}

      </div>

      {error && (
        <div className="p-4 rounded-xs bg-[#E36B6B]/10 border border-[#E36B6B]/40 text-[#E36B6B] text-xs font-mono">
          {error}
        </div>
      )}

      {/* Saved Audio Captures Table */}
      <div className="space-y-4 font-mono text-xs">
        <h2 className="text-2xl font-serif text-[#F5F3ED] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#62C7C0]" />
          <span>Saved Audio Captures</span>
        </h2>

        {recordings.length === 0 ? (
          <div className="p-8 text-center rounded-xs bg-[#101311] border border-[#1D221F] text-[#9A9A93]">
            No audio captures uploaded for this batch yet.
          </div>
        ) : (
          <div className="rounded-xs bg-[#101311] border border-[#1D221F] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#080A09] text-[#9A9A93] border-b border-[#1D221F] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-5">Recording ID</th>
                    <th className="py-3.5 px-5">File Name</th>
                    <th className="py-3.5 px-5">Duration</th>
                    <th className="py-3.5 px-5">DSP Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D221F] text-[#F5F3ED]">
                  {recordings.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#161B18]">
                      <td className="py-4 px-5 font-bold text-[#D4AF37]">REC-#{rec.id}</td>
                      <td className="py-4 px-5 text-[#9A9A93]">{rec.file_name}</td>
                      <td className="py-4 px-5">{rec.duration || '1.0'}s</td>
                      <td className="py-4 px-5">
                        <StatusBadge status={rec.processing_status} size="sm" />
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <Link
                          to={`/acoustic-analysis/${rec.id}`}
                          className="px-3 py-1.5 rounded-xs bg-[#62C7C0]/10 border border-[#62C7C0]/40 text-[#62C7C0] hover:bg-[#62C7C0]/20"
                        >
                          View Spectrogram
                        </Link>

                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="p-1 text-[#9A9A93] hover:text-[#E36B6B]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
