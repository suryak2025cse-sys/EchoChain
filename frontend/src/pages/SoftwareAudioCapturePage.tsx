import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  recordAudioCaptureApi, 
  uploadAudioCaptureApi, 
  listAudioCapturesApi, 
  deleteAudioCaptureApi, 
  getAudioCaptureStreamUrl,
  createLivenessChallengeApi,
  validateLivenessApi,
  createProvenanceRecordApi
} from '../services/api';
import type { AudioCapture, LivenessChallenge, LivenessResult } from '../types';
import { 
  Mic, 
  Square, 
  Pause, 
  Play, 
  RotateCcw, 
  Trash2, 
  Send, 
  Upload, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  FileAudio, 
  RefreshCw, 
  Radio,
  Info,
  Activity,
  ShieldCheck
} from 'lucide-react';

export const SoftwareAudioCapturePage: React.FC = () => {
  const { token, user } = useAuth();
  
  const [captures, setCaptures] = useState<AudioCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Phase 7 Liveness Challenge State
  const [challenge, setChallenge] = useState<LivenessChallenge | null>(null);
  const [challengeTimer, setChallengeTimer] = useState<number>(30);
  const [livenessResult, setLivenessResult] = useState<LivenessResult | null>(null);

  // Microphone Recorder States
  const navigate = useNavigate();
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleCreateProvenance = async (productId: number, captureId: string) => {
    if (!token) return;
    try {
      const prov = await createProvenanceRecordApi(token, productId, captureId);
      navigate(`/provenance/${prov.provenance_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to assemble provenance record.');
    }
  };

  // Waveform Visualizer & MediaRecorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const challengeTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const loadCaptures = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listAudioCapturesApi(token);
      setCaptures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audio captures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaptures();
  }, [token]);

  // Request Liveness Challenge
  const handleRequestChallenge = async () => {
    if (!token) return;
    setError(null);
    try {
      const ch = await createLivenessChallengeApi(token);
      setChallenge(ch);
      setChallengeTimer(30);
      setLivenessResult(null);

      if (challengeTimerRef.current) clearInterval(challengeTimerRef.current);
      challengeTimerRef.current = window.setInterval(() => {
        setChallengeTimer((prev) => {
          if (prev <= 1) {
            clearInterval(challengeTimerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request challenge.');
    }
  };

  // Audio Waveform Visualization Loop
  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#059669'; // Emerald 600
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  // Start Mic Recording with Liveness Challenge
  const startRecording = async () => {
    setError(null);
    setSuccessMsg(null);
    setLivenessResult(null);

    // Ensure an active challenge is requested
    if (!challenge || challengeTimer === 0) {
      await handleRequestChallenge();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      drawWaveform();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setRecordingState('stopped');
        stream.getTracks().forEach((t) => t.stop());
        if (audioCtxRef.current) audioCtxRef.current.close();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      recorder.start();
      setRecordingState('recording');
      setRecordingTime(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Microphone permission denied or device unsupported.');
    }
  };

  // Pause / Resume Mic Recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (recordingState === 'recording') {
        mediaRecorderRef.current.pause();
        setRecordingState('paused');
        if (timerRef.current) clearInterval(timerRef.current);
      } else if (recordingState === 'paused') {
        mediaRecorderRef.current.resume();
        setRecordingState('recording');
        timerRef.current = window.setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      }
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && (recordingState === 'recording' || recordingState === 'paused')) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Restart Recording
  const restartRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setRecordingState('idle');
    setLivenessResult(null);
  };

  // Submit Recorded Audio for Liveness Validation & Storage
  const handleSubmitRecorded = async () => {
    if (!token || !audioBlob) return;
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      // 1. Record capture
      const cap = await recordAudioCaptureApi(
        token,
        audioBlob,
        `live_evidence_${Date.now()}.wav`,
        recordingTime
      );

      // 2. Validate liveness if challenge active
      if (challenge && challengeTimer > 0) {
        const liv = await validateLivenessApi(token, cap.capture_id, challenge.challenge_id, challenge.nonce);
        setLivenessResult(liv);
        setSuccessMsg(`Live environmental capture verified! Capture ID: ${cap.capture_id} (Liveness: ${liv.liveness_score}%)`);
      } else {
        setSuccessMsg(`Capture saved. Capture ID: ${cap.capture_id} (No active challenge attached)`);
      }

      loadCaptures();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !token) return;
    const file = files[0];

    if (file.size === 0) {
      setError('Selected audio file is empty (0 bytes).');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds maximum 50 MB limit.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await uploadAudioCaptureApi(token, file, file.name);
      setSuccessMsg(`File upload complete! Capture ID: ${res.capture_id}`);
      loadCaptures();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Capture
  const handleDeleteCapture = async (captureId: string) => {
    if (!token || !window.confirm(`Delete capture record ${captureId}?`)) return;
    try {
      await deleteAudioCaptureApi(token, captureId);
      loadCaptures();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HERO BANNER CARD */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-mono font-bold border border-emerald-300">
              <Radio className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              Software Audio Liveness & Replay Detection (Phase 7)
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Environmental Audio Evidence Studio</h1>
            <p className="text-xs text-gray-600 font-mono">
              Harvester: <span className="font-bold text-gray-800">{user?.fullName}</span> ({user?.organization || 'Independent Operator'})
            </p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-right font-mono text-xs text-emerald-900">
            <span className="block text-[10px] text-gray-500 uppercase font-semibold">Evidence Classification</span>
            <span className="font-extrabold text-sm text-emerald-800 flex items-center gap-1.5 justify-end">
              <Tag className="w-4 h-4 text-emerald-700" /> Environmental audio evidence
            </span>
          </div>
        </div>

        {/* REQUIRED DISCLAIMER BANNER */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Scientific & Security Notice</span>
            <p className="text-[11px] text-amber-800 leading-relaxed font-mono">
              "Software liveness reduces replay risk but cannot guarantee physical presence." Audio signatures provide probabilistic acoustic similarity and do NOT claim deterministic exact location proof.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* CAPTURE INTERFACE: MIC RECORDER WITH CHALLENGE & FILE UPLOAD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT: IN-BROWSER MICROPHONE RECORDER WITH LIVENESS CHALLENGE */}
          <div className="light-card p-6 rounded-3xl border border-gray-200/80 bg-white shadow-lg space-y-4">
            
            {/* Header + Challenge Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-700" /> Live Microphone Capture
              </h2>
              
              {recordingState === 'recording' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-rose-100 text-rose-700 border border-rose-300 animate-pulse flex items-center gap-1">
                  ● LIVE CAPTURE
                </span>
              )}
            </div>

            {/* LIVENESS CHALLENGE STRIP */}
            <div className="p-3.5 rounded-2xl bg-emerald-950 text-white font-mono text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase block">Active Server Challenge</span>
                <span className="font-bold text-sm text-emerald-300">
                  {challenge ? challenge.challenge_id : 'CH-2026-INIT'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-400 block">Window (30s max)</span>
                {challenge ? (
                  <span className={`font-extrabold text-sm ${challengeTimer > 5 ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                    {challengeTimer > 0 ? `${challengeTimer}s remaining` : 'EXPIRED'}
                  </span>
                ) : (
                  <button
                    onClick={handleRequestChallenge}
                    className="text-[11px] font-bold text-emerald-400 hover:underline"
                  >
                    Generate Challenge
                  </button>
                )}
              </div>
            </div>

            {/* LIVE WAVEFORM VISUALIZER */}
            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col items-center justify-center relative min-h-[120px]">
              <canvas ref={canvasRef} width={400} height={80} className="w-full h-20" />
              
              {recordingState === 'idle' && !audioUrl && (
                <span className="text-xs font-mono text-gray-400 absolute">Click "Start Recording" to generate challenge and record audio</span>
              )}
            </div>

            {/* RECORDING TIMER & CONTROLS */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-3">
              <div className="text-4xl font-extrabold font-mono text-gray-900">
                00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime}
              </div>

              {/* CONTROLS TOOLBAR */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {recordingState === 'idle' && (
                  <button
                    onClick={startRecording}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md flex items-center gap-2 transition-all"
                  >
                    <Mic className="w-4 h-4" /> Start Live Capture
                  </button>
                )}

                {(recordingState === 'recording' || recordingState === 'paused') && (
                  <>
                    <button
                      onClick={pauseRecording}
                      className="px-4 py-2 rounded-xl font-semibold text-xs text-gray-800 bg-gray-200 hover:bg-gray-300 flex items-center gap-1.5"
                    >
                      {recordingState === 'paused' ? <Play className="w-4 h-4 text-emerald-700" /> : <Pause className="w-4 h-4 text-amber-700" />}
                      {recordingState === 'paused' ? 'Resume' : 'Pause'}
                    </button>

                    <button
                      onClick={stopRecording}
                      className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 flex items-center gap-1.5 shadow-sm"
                    >
                      <Square className="w-4 h-4" /> Stop
                    </button>

                    <button
                      onClick={restartRecording}
                      className="px-3 py-2 rounded-xl font-semibold text-xs text-gray-600 hover:bg-gray-200"
                      title="Restart"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* PREVIEW & SUBMIT RECORDING */}
            {audioUrl && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <span className="text-xs font-mono font-bold text-emerald-900 block">
                  Recording Preview (Attached Challenge: {challenge?.challenge_id})
                </span>

                <audio controls src={audioUrl} className="w-full h-10" />

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={restartRecording}
                    className="text-xs font-mono text-gray-600 hover:text-rose-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Discard
                  </button>

                  <button
                    onClick={handleSubmitRecorded}
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:from-amber-300 hover:to-emerald-300 shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Validate & Save Evidence
                  </button>
                </div>
              </div>
            )}

            {/* LIVENESS RESULTS SUMMARY PANEL (PART 9 SPEC) */}
            {livenessResult && (
              <div className="p-5 rounded-2xl bg-slate-900 text-white font-mono space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                  <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Replay Risk Analysis
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 text-[10px] font-extrabold uppercase">
                    Challenge {challengeTimer > 0 ? 'PASSED' : 'COMPLETED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-gray-700 space-y-1">
                    <span className="text-[10px] text-gray-400 block uppercase">Liveness Score</span>
                    <p className="text-lg font-extrabold text-emerald-400">{livenessResult.liveness_score}%</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-gray-700 space-y-1">
                    <span className="text-[10px] text-gray-400 block uppercase">Replay Risk</span>
                    <p className={`text-lg font-extrabold ${livenessResult.replay_risk === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {livenessResult.replay_risk}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-gray-700 text-xs flex items-center justify-between">
                  <span className="text-gray-300 font-semibold">Liveness Classification:</span>
                  <span className="font-extrabold text-emerald-300">{livenessResult.status}</span>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: AUDIO FILE UPLOAD */}
          <div className="light-card p-6 rounded-3xl border border-gray-200/80 bg-white shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-700" /> Audio File Upload
              </h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-teal-100 text-teal-800">
                WAV / MP3 / M4A
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Upload existing harvest field audio recordings from your computer or field recorder.
            </p>

            <label className="block cursor-pointer">
              <div className="p-10 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 hover:border-emerald-600 transition-colors text-center space-y-3">
                <FileAudio className="w-12 h-12 text-emerald-700 mx-auto" />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Click to Select Audio File</span>
                  <span className="text-[11px] text-gray-500 font-mono">Supported: WAV, MP3, M4A, FLAC, OGG (Max 50 MB)</span>
                </div>

                <input
                  type="file"
                  accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac,.webm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </label>
          </div>

        </div>

        {/* HISTORICAL AUDIO EVIDENCE LOGS */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Audio Evidence Database</span>
              <h2 className="text-xl font-bold text-gray-900">Captured Environmental Audio Evidence</h2>
            </div>

            <button
              onClick={loadCaptures}
              className="p-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-600"
              title="Refresh Captures"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center font-mono text-xs text-gray-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" /> Fetching capture metadata...
            </div>
          ) : captures.length === 0 ? (
            <div className="p-8 rounded-2xl bg-gray-50 border border-dashed border-gray-300 text-center space-y-2">
              <FileAudio className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs font-bold text-gray-800">No environmental audio evidence captured yet</p>
              <p className="text-[11px] text-gray-500">Record microphone audio or upload a WAV file using the tools above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 font-mono text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Capture ID</th>
                    <th className="py-3 px-4">File & Source</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">File Size</th>
                    <th className="py-3 px-4">Evidence Label</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans text-gray-800">
                  {captures.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-emerald-800">
                        {c.capture_id}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-900 block">{c.file_name}</span>
                        <span className="text-[11px] text-gray-500 font-mono">{c.capture_source} • {c.mime_type}</span>
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {c.duration}s
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {(c.file_size / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-4 px-4 font-mono">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {c.evidence_label}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-gray-600">
                        {new Date(c.created_at).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right font-mono">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCreateProvenance(c.product_id || 1, c.capture_id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                            title="Assemble Tamper-Evident Provenance Record"
                          >
                            🛡️ Assemble Provenance
                          </button>

                          <Link
                            to={`/producer/acoustic-analysis/${c.capture_id}`}
                            className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] border border-emerald-300 flex items-center gap-1 transition-colors"
                          >
                            <Activity className="w-3.5 h-3.5" /> Analyze Fingerprint
                          </Link>

                          <audio controls src={getAudioCaptureStreamUrl(c.capture_id)} className="h-8 w-36" />
                          <button
                            onClick={() => handleDeleteCapture(c.capture_id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete Capture"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
