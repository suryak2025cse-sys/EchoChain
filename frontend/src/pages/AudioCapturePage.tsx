import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  fetchProductByIdApi, 
  uploadAudioApi, 
  fetchAudioRecordingsApi, 
  getAudioDownloadUrl, 
  processAudioApi, 
  deleteAudioApi 
} from '../services/api';
import type { Product, AudioRecording } from '../types';
import { 
  Mic, 
  Square, 
  Upload, 
  Trash2, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  FileAudio, 
  Clock, 
  Volume2, 
  RefreshCw
} from 'lucide-react';

export const AudioCapturePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Recorder State
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // MediaRecorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const loadData = async () => {
    if (!token || !id) return;
    setLoading(true);
    setError(null);
    try {
      const prodId = parseInt(id, 10);
      const [prodData, audioData] = await Promise.all([
        fetchProductByIdApi(token, prodId),
        fetchAudioRecordingsApi(token, prodId)
      ]);
      setProduct(prodData);
      setRecordings(audioData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audio page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, id]);

  // Start Mic Recording
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
        // Stop stream tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Microphone access denied or unsupported browser.');
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Upload Recorded Audio Blob
  const handleUploadRecorded = async () => {
    if (!token || !id || !audioBlob) return;
    setUploading(true);
    setUploadProgress(30);
    setError(null);
    try {
      const file = new File([audioBlob], `harvest_audio_${Date.now()}.wav`, { type: 'audio/wav' });
      setUploadProgress(70);
      await uploadAudioApi(token, parseInt(id, 10), file, file.name, recordingTime);
      setUploadProgress(100);
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // File Input Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !token || !id) return;
    const file = files[0];

    // File size check (50 MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('Selected file size exceeds 50 MB max limit.');
      return;
    }

    setUploading(true);
    setUploadProgress(40);
    setError(null);
    try {
      setUploadProgress(80);
      await uploadAudioApi(token, parseInt(id, 10), file, file.name);
      setUploadProgress(100);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File upload failed.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Process Audio Trigger
  const handleProcessAudio = async (recordingId: number) => {
    if (!token || !id) return;
    try {
      await processAudioApi(token, parseInt(id, 10), recordingId);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Audio processing failed.');
    }
  };

  // Delete Audio
  const handleDeleteAudio = async (recordingId: number) => {
    if (!token || !id || !window.confirm('Delete this audio signature permanently?')) return;
    try {
      await deleteAudioApi(token, parseInt(id, 10), recordingId);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center font-mono text-xs text-gray-500">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-700 mr-2" /> Loading audio workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* BREADCRUMB */}
        <div className="flex items-center justify-between">
          <Link
            to={`/producer/products/${id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Product Details
          </Link>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Batch ID: {product?.batch_id}
          </span>
        </div>

        {/* HERO HEADER */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-mono font-bold border border-emerald-300">
              <Mic className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              Environmental Audio Capture System
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">{product?.product_name}</h1>
            <p className="text-xs text-gray-600 font-mono">
              Terroir: <span className="font-bold text-gray-800">{product?.region}, {product?.country}</span> • Brand: {product?.brand}
            </p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-right font-mono text-xs">
            <span className="block text-[10px] text-gray-500 uppercase font-semibold">Target Duration</span>
            <span className="font-extrabold text-sm text-emerald-800 flex items-center gap-1 justify-end">
              <Clock className="w-4 h-4 text-emerald-700" /> 30–60 Seconds
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TWO-COLUMN WORKFLOW: MIC RECORDER & FILE UPLOAD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* COLUMN 1: LIVE MIC RECORDER */}
          <div className="light-card p-6 rounded-3xl border border-gray-200/80 bg-white shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-700" /> Browser Microphone Recorder
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                LIVE CAPTURE
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Capture live ambient harvest audio directly from your mobile device or desktop microphone.
            </p>

            {/* RECORDER TIMER & STATUS */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-3">
              <div className="text-4xl font-extrabold font-mono text-gray-900">
                00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime}
              </div>

              {/* Target Indicator */}
              <div className="text-[11px] font-mono">
                {recordingTime >= 30 && recordingTime <= 60 ? (
                  <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Target Duration Reached (30-60s)
                  </span>
                ) : recordingTime > 60 ? (
                  <span className="text-amber-700 font-semibold">Exceeded 60s target (Recommended 30-60s)</span>
                ) : (
                  <span className="text-gray-500">Target duration: 30 to 60 seconds</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-center gap-3">
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow-md flex items-center gap-2 transition-all"
                  >
                    <Mic className="w-4 h-4" /> Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-md flex items-center gap-2 transition-all animate-pulse"
                  >
                    <Square className="w-4 h-4" /> Stop Recording
                  </button>
                )}
              </div>
            </div>

            {/* PREVIEW RECORDED BLOB */}
            {audioUrl && (
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                <span className="text-xs font-mono font-bold text-emerald-900 block">
                  Recording Preview (Ready to Upload)
                </span>

                <audio controls src={audioUrl} className="w-full h-10" />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => { setAudioBlob(null); setAudioUrl(null); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Discard
                  </button>

                  <button
                    onClick={handleUploadRecorded}
                    disabled={uploading}
                    className="px-4 py-1.5 rounded-lg font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-sm flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Save Audio Signature
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: AUDIO FILE UPLOAD */}
          <div className="light-card p-6 rounded-3xl border border-gray-200/80 bg-white shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-700" /> Audio File Upload
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                FILE INPUT
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Upload pre-recorded environmental audio files (WAV, MP3, M4A, FLAC, OGG, WEBM up to 50 MB).
            </p>

            <label className="block cursor-pointer">
              <div className="p-8 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 hover:border-emerald-600 transition-colors text-center space-y-3">
                <FileAudio className="w-10 h-10 text-emerald-700 mx-auto" />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Click or Drag Audio File to Upload</span>
                  <span className="text-[11px] text-gray-500 font-mono">Supported formats: WAV, MP3, M4A, FLAC, OGG</span>
                </div>

                <input
                  type="file"
                  accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac,.webm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </label>

            {uploading && (
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Uploading audio payload...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* AUDIO RECORDINGS LISTING & SIGNAL PROCESSING */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Audio Signatures</span>
              <h2 className="text-xl font-bold text-gray-900">Recorded Environmental Audio Files</h2>
            </div>
            <span className="text-xs font-mono text-gray-500">{recordings.length} Audio Files</span>
          </div>

          {recordings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-gray-50 border border-dashed border-gray-300 text-center space-y-2">
              <Volume2 className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs font-bold text-gray-800">No audio signatures recorded yet</p>
              <p className="text-[11px] text-gray-500">Record live microphone audio or upload a WAV file above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recordings.map((rec) => (
                <div key={rec.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-sm">{rec.file_name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {rec.mime_type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        Duration: <span className="font-bold text-gray-800">{rec.duration}s</span> • Size: {(rec.file_size / 1024).toFixed(1)} KB • Sample Rate: {rec.sample_rate} Hz
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {rec.processing_status === 'COMPLETED' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-purple-700" /> Processed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleProcessAudio(rec.id)}
                          className="px-3 py-1.5 rounded-lg font-bold text-xs text-purple-900 bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center gap-1.5 transition-colors"
                        >
                          <Cpu className="w-3.5 h-3.5 text-purple-700" /> Process Audio
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteAudio(rec.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 border border-transparent transition-colors"
                        title="Delete Audio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* HTML5 PLAYBACK PLAYER */}
                  <div className="pt-2">
                    <audio controls src={getAudioDownloadUrl(rec.product_id, rec.id)} className="w-full h-10" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
