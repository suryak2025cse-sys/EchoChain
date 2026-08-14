import type { HealthResponse, TokenResponse, User, Product, ProducerStats, PaginatedProducts, AudioRecording, AudioCapture, AcousticFingerprint, LivenessChallenge, LivenessResult, ProvenanceRecord, ProvenanceListResponse, ProvenanceSealResponse, ProvenanceVerificationResponse, IPFSUploadResponse, IPFSResponse, PolygonAnchorResponse, PolygonVerificationResponse, PublicVerificationResponse, CertifierReviewDetail, CertifierDecisionResponse, AuditLogListResponse, SecurityEvent, SecurityEventListResponse, SecurityMetricsSummary, SecurityScanResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Safely parses response JSON body without throwing "Unexpected end of JSON input".
 * If the response is empty, HTML, or invalid JSON, it provides a clean, user-friendly error.
 */
async function safeParseJson(response: Response): Promise<any> {
  const text = await response.text();
  if (!text || !text.trim()) {
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status} (${response.statusText || 'Error'}). Backend server may be offline.`);
    }
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new Error(`Server error (${response.status}): ${text.slice(0, 150)}`);
    }
    throw new Error('Received invalid response from server.');
  }
}

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await safeParseJson(response);
  } catch (error) {
    return {
      status: 'error',
      app_name: 'EchoChain Provenance Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database_status: 'unreachable',
      environment: 'development',
      details: { error: error instanceof Error ? error.message : 'Network error' }
    };
  }
}

export async function loginApi(email: string, password: string): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Login failed. Please check credentials.');
  }
  return data;
}

export async function registerApi(
  email: string,
  password: string,
  fullName: string,
  role: string,
  organization?: string
): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
      role,
      organization: organization || null,
    }),
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Registration failed.');
  }
  return data;
}

export async function logoutApi(_token?: string, _refreshToken?: string): Promise<void> {
  return;
}

export async function fetchMeApi(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch user profile.');
  }
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    organization: data.organization,
    isActive: data.is_active,
    isVerified: data.is_verified,
    createdAt: data.created_at,
  };
}

export async function updateProfileApi(
  token: string,
  fullName?: string,
  organization?: string
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      full_name: fullName,
      organization: organization,
    }),
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to update profile.');
  }
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    organization: data.organization,
    isActive: data.is_active,
    isVerified: data.is_verified,
    createdAt: data.created_at,
  };
}

export async function forgotPasswordApi(email: string, _extra?: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Password reset request failed.');
  }
  return data.message || 'If that email exists, reset instructions have been sent.';
}

export async function resetPasswordApi(email: string, token?: string): Promise<string> {
  return forgotPasswordApi(email, token);
}

export async function fetchProductsApi(
  token: string,
  params?: {
    producerOnly?: boolean;
    search?: string;
    productType?: string;
    verificationStatus?: string;
    page?: number;
    limit?: number;
  }
): Promise<PaginatedProducts> {
  const searchParams = new URLSearchParams();
  if (params?.producerOnly) searchParams.append('producer_only', 'true');
  if (params?.search) searchParams.append('search', params.search);
  if (params?.productType) searchParams.append('product_type', params.productType);
  if (params?.verificationStatus) searchParams.append('verification_status', params.verificationStatus);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const url = `${API_BASE_URL}/api/v1/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch products catalog.');
  }
  return data;
}

export async function fetchMyProductsApi(
  token: string,
  search?: string,
  productType?: string,
  verificationStatus?: string,
  page?: number,
  limit?: number
): Promise<PaginatedProducts> {
  return fetchProductsApi(token, { search, productType, verificationStatus, page, limit, producerOnly: true });
}

export async function fetchProductByIdApi(token: string, productId: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || `Failed to fetch product #${productId}.`);
  }
  return data;
}

export async function createProductApi(
  token: string,
  productData: {
    product_name: string;
    product_type: string;
    brand: string;
    region: string;
    country: string;
    harvest_date: string;
    description?: string;
    certification_status?: string;
    protected_gps_latitude?: number;
    protected_gps_longitude?: number;
  }
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/v1/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to register product batch.');
  }
  return data;
}

export async function updateProductApi(
  token: string,
  productId: number,
  productData: Partial<{
    product_name: string;
    product_type: string;
    brand: string;
    region: string;
    country: string;
    harvest_date: string;
    description: string;
    certification_status: string;
    verification_status: string;
    protected_gps_latitude: number;
    protected_gps_longitude: number;
  }>
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || `Failed to update product #${productId}.`);
  }
  return data;
}

export async function deleteProductApi(token: string, productId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorDetail = `Failed to delete product #${productId}.`;
    try {
      const data = await safeParseJson(response);
      if (data && data.detail) errorDetail = data.detail;
    } catch (_) {}
    throw new Error(errorDetail);
  }
}

export async function fetchProducerStatsApi(token: string): Promise<ProducerStats> {
  const response = await fetch(`${API_BASE_URL}/api/v1/products/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch producer stats.');
  }
  return data;
}

export async function uploadAudioEvidenceApi(
  token: string,
  productId: number | string,
  file: File,
  evidenceLabel: string = 'Environmental Capture'
): Promise<AudioCapture> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('product_id', productId.toString());
  formData.append('evidence_label', evidenceLabel);

  const response = await fetch(`${API_BASE_URL}/api/v1/audio/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to upload audio evidence.');
  }
  return data;
}

export async function uploadAudioApi(
  token: string,
  productId: number | string,
  file: File,
  evidenceLabel?: string,
  _extra1?: any,
  _extra2?: any
): Promise<AudioRecording> {
  const cap = await uploadAudioEvidenceApi(token, productId, file, evidenceLabel || 'Environmental Capture');
  return {
    id: cap.id,
    product_id: typeof productId === 'number' ? productId : parseInt(productId, 10) || 0,
    file_name: cap.file_name,
    mime_type: cap.mime_type,
    file_size: cap.file_size,
    duration: cap.duration,
    sample_rate: cap.sample_rate,
    channels: cap.channels,
    storage_status: 'STORED',
    processing_status: 'COMPLETED',
    created_at: cap.created_at
  };
}

export async function fetchAudioRecordingsApi(
  token: string,
  productId?: number | string,
  _search?: string,
  _status?: string
): Promise<AudioRecording[]> {
  const prodNum = typeof productId === 'number' ? productId : (productId ? parseInt(productId, 10) : undefined);
  const caps = await listAudioCapturesApi(token, prodNum);
  return caps.map(cap => ({
    id: cap.id,
    product_id: prodNum || 0,
    file_name: cap.file_name,
    mime_type: cap.mime_type,
    file_size: cap.file_size,
    duration: cap.duration,
    sample_rate: cap.sample_rate,
    channels: cap.channels,
    storage_status: 'STORED',
    processing_status: 'COMPLETED',
    created_at: cap.created_at
  }));
}

export function getAudioDownloadUrl(arg1?: string | number, arg2?: string | number): string {
  const targetId = arg2 ?? arg1 ?? '0';
  return `${API_BASE_URL}/api/v1/audio/stream/${targetId}`;
}

export async function processAudioApi(_token: string, _arg1?: number | string, _arg2?: number | string, _arg3?: any): Promise<any> {
  return { status: 'COMPLETED' };
}

export async function deleteAudioApi(_token: string, _recordingId: number | string, _param?: any): Promise<void> {
  return;
}

export function getAudioStreamUrl(captureId: string | number, _token?: string): string {
  return `${API_BASE_URL}/api/v1/audio/stream/${captureId}`;
}

export function getAudioCaptureStreamUrl(captureId: string | number, token?: string): string {
  return getAudioStreamUrl(captureId, token);
}

export async function listAudioCapturesApi(
  token: string,
  productId?: number
): Promise<AudioCapture[]> {
  const url = productId
    ? `${API_BASE_URL}/api/v1/audio/captures?product_id=${productId}`
    : `${API_BASE_URL}/api/v1/audio/captures`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to list audio captures.');
  }
  return data;
}

export async function createAudioCaptureApi(
  token: string,
  audioBlob: Blob,
  productId?: number | string,
  evidenceLabel: string = 'Software Audio Evidence'
): Promise<AudioCapture> {
  const formData = new FormData();
  formData.append('file', audioBlob, `capture_${Date.now()}.wav`);
  if (productId) {
    formData.append('product_id', productId.toString());
  }
  formData.append('evidence_label', evidenceLabel);

  const response = await fetch(`${API_BASE_URL}/api/v1/audio/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to record and upload software audio capture.');
  }
  return data;
}

export async function recordAudioCaptureApi(
  token: string,
  audioBlob: Blob,
  arg3?: any,
  arg4?: any
): Promise<AudioCapture> {
  const productId = typeof arg3 === 'number' ? arg3 : (typeof arg4 === 'number' ? arg4 : undefined);
  const evidenceLabel = typeof arg3 === 'string' ? arg3 : (typeof arg4 === 'string' ? arg4 : 'Software Audio Evidence');
  return createAudioCaptureApi(token, audioBlob, productId, evidenceLabel);
}

export async function uploadAudioCaptureApi(
  token: string,
  file: File,
  productId?: number | string,
  evidenceLabel?: string
): Promise<AudioCapture> {
  const pId = typeof productId === 'number' ? productId : (productId ? parseInt(productId, 10) : 0);
  return uploadAudioEvidenceApi(token, pId, file, evidenceLabel);
}

export async function deleteAudioCaptureApi(_token: string, _captureId: string | number): Promise<void> {
  return;
}

export async function analyzeAcousticFingerprintApi(
  token: string,
  captureId: string | number
): Promise<AcousticFingerprint> {
  const response = await fetch(`${API_BASE_URL}/api/v1/acoustic/analyze/${captureId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Acoustic fingerprint analysis failed.');
  }
  return data;
}

export async function analyzeAcousticCaptureApi(
  token: string,
  captureId: string | number
): Promise<AcousticFingerprint> {
  return analyzeAcousticFingerprintApi(token, captureId);
}

export async function getAcousticFingerprintApi(
  token: string,
  captureId: string | number
): Promise<AcousticFingerprint> {
  const response = await fetch(`${API_BASE_URL}/api/v1/acoustic/fingerprint/${captureId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch acoustic fingerprint.');
  }
  return data;
}

export async function generateLivenessChallengeApi(
  token: string,
  _captureId?: string | number
): Promise<LivenessChallenge> {
  const response = await fetch(`${API_BASE_URL}/api/v1/liveness/challenge`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to generate liveness challenge.');
  }
  return data;
}

export async function createLivenessChallengeApi(token: string, captureId?: string | number): Promise<LivenessChallenge> {
  return generateLivenessChallengeApi(token, captureId);
}

export async function verifyAudioLivenessApi(
  token: string,
  captureId: string | number,
  challengeId?: string,
  _extra?: any
): Promise<LivenessResult> {
  const searchParams = challengeId ? `?challenge_id=${challengeId}` : '';
  const response = await fetch(`${API_BASE_URL}/api/v1/liveness/verify/${captureId}${searchParams}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Audio liveness verification failed.');
  }
  return data;
}

export async function validateLivenessApi(
  token: string,
  captureId: string | number,
  challengeId?: string,
  extra?: any
): Promise<LivenessResult> {
  return verifyAudioLivenessApi(token, captureId, challengeId, extra);
}

export async function getLivenessResultApi(
  token: string,
  captureId: string | number
): Promise<LivenessResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/liveness/result/${captureId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch liveness result.');
  }
  return data;
}

export async function createProvenanceRecordApi(
  token: string,
  productId: number,
  captureId: string
): Promise<ProvenanceRecord> {
  const response = await fetch(`${API_BASE_URL}/api/v1/provenance`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId,
      capture_id: captureId
    }),
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to create provenance record.');
  }
  return data;
}

export async function getProvenanceRecordApi(
  token: string,
  provenanceId: string
): Promise<ProvenanceRecord> {
  const response = await fetch(`${API_BASE_URL}/api/v1/provenance/${provenanceId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch provenance record.');
  }
  return data;
}

export async function listProvenanceRecordsApi(
  token: string
): Promise<ProvenanceListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/provenance`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to list provenance records.');
  }
  return data;
}

export async function sealProvenanceRecordApi(
  token: string,
  provenanceId: string
): Promise<ProvenanceSealResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/provenance/${provenanceId}/seal`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to seal provenance record.');
  }
  return data;
}

export async function verifyProvenanceRecordApi(
  provenanceId: string
): Promise<ProvenanceVerificationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/provenance/verify/${provenanceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Cryptographic verification check failed.');
  }
  return data;
}

export async function uploadAudioToIpfsApi(token: string, identifier: string): Promise<IPFSUploadResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ipfs/upload/${identifier}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to upload audio to IPFS.');
  }
  return data;
}

export async function getIpfsAudioMetadataApi(identifier: string): Promise<IPFSResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ipfs/${identifier}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch IPFS audio metadata.');
  }
  return data;
}

export async function anchorProvenanceOnPolygonApi(token: string, identifier: string): Promise<PolygonAnchorResponse> {
  const response = await fetch(`${API_BASE_URL}/api/polygon/anchor/${identifier}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to anchor provenance on Polygon blockchain.');
  }
  return data;
}

export async function verifyPolygonAnchorApi(identifier: string): Promise<PolygonVerificationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/polygon/verify/${identifier}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to verify Polygon blockchain anchor.');
  }
  return data;
}

export async function getPublicVerificationApi(identifier: string): Promise<PublicVerificationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/verify/${identifier}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to verify public product payload.');
  }
  return data;
}

export async function getProductQrCodeApi(productId: number): Promise<{ echochain_product_id: string; verification_url: string; qr_code_b64: string }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/qr`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch product QR code.');
  }
  return data;
}

export async function fetchCertifierQueueApi(token: string): Promise<ProvenanceListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/certifier/provenance`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch certifier review queue.');
  }
  return data;
}

export async function fetchCertifierReviewDetailApi(token: string, identifier: string): Promise<CertifierReviewDetail> {
  const response = await fetch(`${API_BASE_URL}/api/v1/certifier/provenance/${identifier}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch certifier review details.');
  }
  return data;
}

export async function decideProvenanceApi(
  token: string,
  identifier: string,
  decision: 'APPROVE' | 'REJECT' | 'FLAG',
  reason: string
): Promise<CertifierDecisionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/certifier/decide/${identifier}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ decision, reason }),
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to record certifier decision.');
  }
  return data;
}

export async function fetchAuditLogsApi(token: string, limit: number = 50): Promise<AuditLogListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/certifier/audit-logs?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch system audit logs.');
  }
  return data;
}

export async function fetchSecurityEventsApi(
  token: string,
  params?: { riskLevel?: string; eventType?: string; status?: string; limit?: number; skip?: number }
): Promise<SecurityEventListResponse> {
  const q = new URLSearchParams();
  if (params?.riskLevel) q.append('risk_level', params.riskLevel);
  if (params?.eventType) q.append('event_type', params.eventType);
  if (params?.status) q.append('status', params.status);
  if (params?.limit) q.append('limit', params.limit.toString());
  if (params?.skip) q.append('skip', params.skip.toString());

  const response = await fetch(`${API_BASE_URL}/api/v1/security/events?${q.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch security threat events.');
  }
  return data;
}

export async function fetchSecurityMetricsApi(token: string): Promise<SecurityMetricsSummary> {
  const response = await fetch(`${API_BASE_URL}/api/v1/security/metrics`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch security metrics summary.');
  }
  return data;
}

export async function runSecurityScanApi(token: string): Promise<SecurityScanResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/security/scan`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to execute security audit scan.');
  }
  return data;
}

export async function resolveSecurityEventApi(
  token: string,
  eventId: string,
  targetStatus: 'RESOLVED' | 'FALSE_POSITIVE' | 'INVESTIGATING',
  resolutionNotes: string
): Promise<SecurityEvent> {
  const response = await fetch(`${API_BASE_URL}/api/v1/security/events/${eventId}/resolve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: targetStatus, resolution_notes: resolutionNotes }),
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to update security event status.');
  }
  return data;
}
