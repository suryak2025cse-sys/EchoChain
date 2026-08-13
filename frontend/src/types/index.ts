export type UserRole = 'PRODUCER' | 'CONSUMER' | 'CERTIFIER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  organization?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    organization?: string;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
  };
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  app_name: string;
  version: string;
  timestamp: string;
  database_status: string;
  environment: string;
  details?: Record<string, unknown>;
}

export interface Product {
  id: number;
  producer_id: number;
  product_name: string;
  product_type: string;
  brand: string;
  batch_id: string;
  echochain_product_id?: string;
  qr_code_b64?: string;
  region: string;
  country: string;
  harvest_date: string;
  description?: string;
  certification_status: string;
  verification_status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'FLAGGED';
  protected_gps_latitude?: number;
  protected_gps_longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface ProducerStats {
  total_products: number;
  registered_batches: number;
  verified_products: number;
  pending_verification: number;
  flagged_products: number;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AudioRecording {
  id: number;
  product_id: number;
  file_name: string;
  mime_type: string;
  file_size: number;
  duration: number;
  sample_rate: number;
  channels: number;
  storage_status: string;
  processing_status: 'UNPROCESSED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
}

export interface AudioCapture {
  id: number;
  capture_id: string;
  user_id: number;
  product_id?: number;
  file_name: string;
  mime_type: string;
  file_size: number;
  duration: number;
  sample_rate: number;
  channels: number;
  evidence_label: string;
  capture_source: 'BROWSER_MIC' | 'FILE_UPLOAD';
  created_at: string;
}

export interface FeatureVectorSummary {
  sample_rate: number;
  duration_sec: number;
  mfcc_means: number[];
  mfcc_stds: number[];
  spectral_centroid_mean: number;
  spectral_centroid_std: number;
  spectral_bandwidth_mean: number;
  spectral_bandwidth_std: number;
  spectral_contrast_mean: number;
  spectral_contrast_std: number;
  zero_crossing_rate_mean: number;
  zero_crossing_rate_std: number;
  chroma_means: number[];
  chroma_stds: number[];
}

export interface AcousticFingerprint {
  id: number;
  capture_id: string;
  fingerprint: string;
  fingerprint_hex_vector: string;
  feature_vector: FeatureVectorSummary;
  algorithm_version: string;
  signal_label: string;
  waveform_plot_b64?: string;
  melspectrogram_plot_b64?: string;
  mfcc_plot_b64?: string;
  created_at: string;
}

export interface LivenessChallenge {
  challenge_id: string;
  nonce: string;
  created_at: string;
  expires_at: string;
  expires_in_seconds: number;
  status: 'ACTIVE' | 'EXPIRED' | 'USED';
}

export interface LivenessResult {
  id: number;
  capture_id: string;
  challenge_id?: string;
  liveness_score: number;
  replay_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'LIVE' | 'LIKELY_LIVE' | 'SUSPICIOUS' | 'REPLAY_SUSPECTED';
  analysis_metadata: {
    clipping_ratio: number;
    high_freq_rolloff_ratio: number;
    noise_floor_snr_db: number;
    spectral_flatness_mean: number;
    duration_sec: number;
  };
  created_at: string;
}

export type ProvenanceStatus = 'DRAFT' | 'AUDIO_CAPTURED' | 'ACOUSTIC_ANALYZED' | 'LIVENESS_VERIFIED' | 'READY_FOR_SEAL' | 'SEALED' | 'ANCHORED';

export interface ProvenanceRecord {
  id: number;
  provenance_id: string;
  product_id: number;
  batch_id: string;
  capture_id: string;
  producer_id: number;
  region: string;
  country: string;
  fingerprint: string;
  liveness_score: number;
  replay_risk: string;
  liveness_status: string;
  status: ProvenanceStatus;
  provenance_hash: string;
  metadata_json: Record<string, any>;
  is_sealed: boolean;
  sealed_at?: string;
  ipfs_cid?: string;
  ipfs_url?: string;
  tx_hash?: string;
  block_number?: number;
  network?: string;
  contract_address?: string;
  is_anchored: boolean;
  anchored_at?: string;
  created_at: string;
}

export interface ProvenanceListResponse {
  items: ProvenanceRecord[];
  total: number;
}

export interface ProvenanceSealResponse {
  provenance_id: string;
  provenance_hash: string;
  status: string;
  is_sealed: boolean;
  sealed_at: string;
  message: string;
}

export interface ProvenanceVerificationResponse {
  provenance_id: string;
  stored_hash: string;
  computed_hash: string;
  status: 'VALID' | 'TAMPERED';
  is_tamper_evident: boolean;
  verified_at: string;
  canonical_payload: Record<string, any>;
}

export interface IPFSUploadResponse {
  provenance_id: string;
  ipfs_cid: string;
  ipfs_url: string;
  pin_timestamp: string;
  status: string;
  message: string;
}

export interface IPFSResponse {
  provenance_id: string;
  ipfs_cid?: string;
  ipfs_url?: string;
  audio_stream_url: string;
  is_pinned: boolean;
  metadata: Record<string, any>;
}

export interface PolygonAnchorResponse {
  provenance_id: string;
  tx_hash: string;
  block_number: number;
  network: string;
  contract_address: string;
  anchored_at: string;
  status: string;
  message: string;
}

export interface PolygonVerificationResponse {
  provenance_id: string;
  is_anchored: boolean;
  tx_hash?: string;
  block_number?: number;
  network?: string;
  contract_address?: string;
  stored_provenance_hash?: string;
  status: string;
  verified_at: string;
  message: string;
}

export interface PublicVerificationResponse {
  echochain_product_id: string;
  product_id: number;
  product_name: string;
  product_type: string;
  brand: string;
  batch_id: string;
  region: string;
  country: string;
  harvest_date: string;
  description?: string;
  certification_status: string;
  verification_status: string;
  qr_code_b64?: string;
  acoustic_evidence?: Record<string, any>;
  cryptographic_proof?: Record<string, any>;
  blockchain_proof?: Record<string, any>;
  ipfs_storage?: Record<string, any>;
  verified_at: string;
}
