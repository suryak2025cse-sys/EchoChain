import io
import base64
import hashlib
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive background renderer
import matplotlib.pyplot as plt
import librosa
import soundfile as sf
from typing import Dict, Any, Tuple


class AcousticDSPPipeline:
    TARGET_SR = 22050
    ALGORITHM_VERSION = "ECHO-DSP-v1.0"
    SIGNAL_LABEL = "Acoustic similarity signal"

    @staticmethod
    def load_and_preprocess(file_bytes: bytes, target_sr: int = 22050) -> Tuple[np.ndarray, int]:
        """
        Step 1-4: Load, Normalize, Resample, and Trim Silence.
        """
        try:
            # Load audio using soundfile / librosa
            y, sr = librosa.load(io.BytesIO(file_bytes), sr=target_sr, mono=True)
        except Exception:
            # Fallback if soundfile reader fails
            audio_io = io.BytesIO(file_bytes)
            data, sr = sf.read(audio_io)
            if data.ndim > 1:
                data = np.mean(data, axis=1)
            if sr != target_sr:
                y = librosa.resample(data, orig_sr=sr, target_sr=target_sr)
                sr = target_sr
            else:
                y = data

        # Step 2: Peak Normalize
        max_val = np.max(np.abs(y))
        if max_val > 0:
            y = y / max_val

        # Step 4: Remove obvious silence (top_db threshold = 25 dB)
        y_trimmed, _ = librosa.effects.trim(y, top_db=25)
        if len(y_trimmed) > 0:
            y = y_trimmed

        return y, sr

    @staticmethod
    def extract_features(y: np.ndarray, sr: int = 22050) -> Dict[str, Any]:
        """
        Step 5-11: Extract Mel spectrogram, MFCCs, Spectral Centroid,
        Bandwidth, Contrast, Zero-Crossing Rate, and Chroma features.
        """
        # Step 5: Mel Spectrogram
        S_mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128, fmax=8000)
        S_db = librosa.power_to_db(S_mel, ref=np.max)

        # Step 6: MFCC Features (13 coefficients)
        mfccs = librosa.feature.mfcc(S=S_db, sr=sr, n_mfcc=13)

        # Step 7: Spectral Centroid
        cent = librosa.feature.spectral_centroid(y=y, sr=sr)

        # Step 8: Spectral Bandwidth
        bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)

        # Step 9: Spectral Contrast
        contrast = librosa.feature.spectral_contrast(y=y, sr=sr)

        # Step 10: Zero Crossing Rate
        zcr = librosa.feature.zero_crossing_rate(y=y)

        # Step 11: Chroma Features
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)

        # Calculate numerical summary statistics (mean & std)
        duration_sec = round(float(len(y) / sr), 3)

        feature_summary = {
            "sample_rate": sr,
            "duration_sec": duration_sec,
            "mfcc_means": np.mean(mfccs, axis=1).round(4).tolist(),
            "mfcc_stds": np.std(mfccs, axis=1).round(4).tolist(),
            "spectral_centroid_mean": round(float(np.mean(cent)), 2),
            "spectral_centroid_std": round(float(np.std(cent)), 2),
            "spectral_bandwidth_mean": round(float(np.mean(bandwidth)), 2),
            "spectral_bandwidth_std": round(float(np.std(bandwidth)), 2),
            "spectral_contrast_mean": round(float(np.mean(contrast)), 2),
            "spectral_contrast_std": round(float(np.std(contrast)), 2),
            "zero_crossing_rate_mean": round(float(np.mean(zcr)), 4),
            "zero_crossing_rate_std": round(float(np.std(zcr)), 4),
            "chroma_means": np.mean(chroma, axis=1).round(4).tolist(),
            "chroma_stds": np.std(chroma, axis=1).round(4).tolist(),
        }

        # Generate deterministic acoustic fingerprint hash & hex vector
        packed_features = np.concatenate([
            np.mean(mfccs, axis=1),
            np.std(mfccs, axis=1),
            [np.mean(cent), np.std(cent)],
            [np.mean(bandwidth), np.std(bandwidth)],
            np.mean(contrast, axis=1),
            np.mean(chroma, axis=1),
            [np.mean(zcr)]
        ]).astype(np.float32)

        fingerprint_hash = hashlib.sha256(packed_features.tobytes()).hexdigest()
        fingerprint_hex_vector = packed_features.tobytes().hex()

        return {
            "feature_summary": feature_summary,
            "fingerprint": fingerprint_hash,
            "fingerprint_hex_vector": fingerprint_hex_vector,
            "raw": {
                "y": y,
                "sr": sr,
                "S_db": S_db,
                "mfccs": mfccs
            }
        }

    @staticmethod
    def render_plots_b64(raw_data: Dict[str, Any]) -> Tuple[str, str, str]:
        """
        Generate base64 encoded PNG plots for:
        1. Waveform
        2. Mel Spectrogram
        3. MFCC Heatmap
        """
        y = raw_data["y"]
        sr = raw_data["sr"]
        S_db = raw_data["S_db"]
        mfccs = raw_data["mfccs"]

        # 1. Waveform Plot
        fig, ax = plt.subplots(figsize=(7, 2.5), facecolor="#091210")
        ax.set_facecolor("#091210")
        librosa.display.waveshow(y, sr=sr, ax=ax, color="#10B981", alpha=0.9)
        ax.set_title("Temporal Waveform (Normalized)", color="#FFFFFF", fontsize=10, fontweight="bold")
        ax.tick_params(colors="#9CA3AF", labelsize=8)
        ax.grid(True, color="#1F2937", linestyle="--", alpha=0.5)
        plt.tight_layout()

        buf1 = io.BytesIO()
        plt.savefig(buf1, format="png", dpi=100, bbox_inches="tight")
        plt.close(fig)
        buf1.seek(0)
        waveform_b64 = f"data:image/png;base64,{base64.b64encode(buf1.read()).decode('utf-8')}"

        # 2. Mel Spectrogram Plot
        fig, ax = plt.subplots(figsize=(7, 3), facecolor="#091210")
        ax.set_facecolor("#091210")
        img = librosa.display.specshow(S_db, sr=sr, x_axis="time", y_axis="mel", fmax=8000, ax=ax, cmap="viridis")
        fig.colorbar(img, ax=ax, format="%+2.0f dB")
        ax.set_title("Mel Spectrogram Heatmap (dB)", color="#FFFFFF", fontsize=10, fontweight="bold")
        ax.tick_params(colors="#9CA3AF", labelsize=8)
        plt.tight_layout()

        buf2 = io.BytesIO()
        plt.savefig(buf2, format="png", dpi=100, bbox_inches="tight")
        plt.close(fig)
        buf2.seek(0)
        melspec_b64 = f"data:image/png;base64,{base64.b64encode(buf2.read()).decode('utf-8')}"

        # 3. MFCC Heatmap Plot
        fig, ax = plt.subplots(figsize=(7, 3), facecolor="#091210")
        ax.set_facecolor("#091210")
        img = librosa.display.specshow(mfccs, sr=sr, x_axis="time", ax=ax, cmap="coolwarm")
        fig.colorbar(img, ax=ax)
        ax.set_title("MFCC Feature Matrix (13 Coefficients)", color="#FFFFFF", fontsize=10, fontweight="bold")
        ax.tick_params(colors="#9CA3AF", labelsize=8)
        plt.tight_layout()

        buf3 = io.BytesIO()
        plt.savefig(buf3, format="png", dpi=100, bbox_inches="tight")
        plt.close(fig)
        buf3.seek(0)
        mfcc_b64 = f"data:image/png;base64,{base64.b64encode(buf3.read()).decode('utf-8')}"

        return waveform_b64, melspec_b64, mfcc_b64
