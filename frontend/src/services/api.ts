import type { HealthResponse, TokenResponse, User, Product, ProducerStats, PaginatedProducts, AudioRecording, AudioCapture, AcousticFingerprint, LivenessChallenge, LivenessResult, ProvenanceRecord, ProvenanceListResponse, ProvenanceSealResponse, ProvenanceVerificationResponse, IPFSUploadResponse, IPFSResponse, PolygonAnchorResponse, PolygonVerificationResponse, PublicVerificationResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
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
  const data = await response.json();
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
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Registration failed.');
  }
  return data;
}

export async function fetchMeApi(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
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
  const data = await response.json();
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

export async function forgotPasswordApi(email: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Forgot password request failed.');
  }
  return data.message;
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Password reset failed.');
  }
  return data.message;
}

export async function logoutApi(token: string, refreshToken?: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch (e) {
    console.error('Logout error:', e);
  }
}

/* PRODUCT MANAGEMENT APIs */

export async function fetchProducerStatsApi(token: string): Promise<ProducerStats> {
  const response = await fetch(`${API_BASE_URL}/api/v1/products/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch producer stats.');
  }
  return data;
}

export async function fetchMyProductsApi(
  token: string,
  search?: string,
  productType?: string,
  verificationStatus?: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedProducts> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (productType) params.append('product_type', productType);
  if (verificationStatus) params.append('verification_status', verificationStatus);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await fetch(`${API_BASE_URL}/api/v1/products/my-products?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch products.');
  }
  return data;
}

export async function fetchProductByIdApi(token: string, id: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch product details.');
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
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to create product.');
  }
  return data;
}

export async function updateProductApi(
  token: string,
  id: number,
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
  const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to update product.');
  }
  return data;
}

export async function deleteProductApi(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to delete product.');
  }
}

/* AUDIO CAPTURE APIs */

export async function uploadAudioApi(
  token: string,
  productId: number,
  file: File | Blob,
  fileName: string = 'recording.wav',
  duration?: number
): Promise<AudioRecording> {
  const formData = new FormData();
  formData.append('file', file, fileName);
  if (duration) {
    formData.append('duration', duration.toString());
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/audio/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Audio upload failed.');
  }
  return data;
}

export async function fetchAudioRecordingsApi(token: string, productId: number): Promise<AudioRecording[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/audio`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch audio recordings.');
  }
  return data;
}

export function getAudioDownloadUrl(productId: number, recordingId: number): string {
  return `${API_BASE_URL}/api/v1/products/${productId}/audio/${recordingId}/download`;
}

export async function processAudioApi(token: string, productId: number, recordingId: number): Promise<AudioRecording> {
  const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/audio/${recordingId}/process`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'EXTRACT_FEATURES' }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Audio processing failed.');
  }
  return data;
}

export async function deleteAudioApi(token: string, productId: number, recordingId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/audio/${recordingId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to delete audio recording.');
  }
}

/* PHASE 5 — SOFTWARE AUDIO CAPTURE APIs */

export async function uploadAudioCaptureApi(
  token: string,
  file: File | Blob,
  fileName: string = 'environmental_evidence.wav',
  productId?: number
): Promise<AudioCapture> {
  const formData = new FormData();
  formData.append('file', file, fileName);
  if (productId) formData.append('product_id', productId.toString());

  const response = await fetch(`${API_BASE_URL}/api/v1/audio/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Audio upload failed.');
  }
  return data;
}

export async function recordAudioCaptureApi(
  token: string,
  file: Blob,
  fileName: string = 'browser_mic_record.wav',
  duration?: number,
  productId?: number
): Promise<AudioCapture> {
  const formData = new FormData();
  formData.append('file', file, fileName);
  if (duration) formData.append('duration', duration.toString());
  if (productId) formData.append('product_id', productId.toString());

  const response = await fetch(`${API_BASE_URL}/api/v1/audio/record`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Audio recording upload failed.');
  }
  return data;
}

export async function getAudioCaptureApi(token: string, captureId: string): Promise<AudioCapture> {
  const response = await fetch(`${API_BASE_URL}/api/v1/audio/${captureId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch capture metadata.');
  }
  return data;
}

export function getAudioCaptureStreamUrl(captureId: string): string {
  return `${API_BASE_URL}/api/v1/audio/${captureId}/stream`;
}

export async function deleteAudioCaptureApi(token: string, captureId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/audio/${captureId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to delete audio capture.');
  }
}

export async function listAudioCapturesApi(token: string): Promise<AudioCapture[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/audio`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to list captures.');
  }
  return data.items;
}

/* PHASE 6 — ACOUSTIC FINGERPRINTING APIs */

export async function analyzeAcousticCaptureApi(token: string, captureId: string): Promise<AcousticFingerprint> {
  const response = await fetch(`${API_BASE_URL}/api/acoustic/analyze/${captureId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Acoustic feature extraction failed.');
  }
  return data;
}

export async function getAcousticFingerprintApi(token: string, captureId: string): Promise<AcousticFingerprint> {
  const response = await fetch(`${API_BASE_URL}/api/acoustic/fingerprint/${captureId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch acoustic fingerprint.');
  }
  return data;
}

/* PHASE 7 — SOFTWARE AUDIO LIVENESS APIs */

export async function createLivenessChallengeApi(token: string): Promise<LivenessChallenge> {
  const response = await fetch(`${API_BASE_URL}/api/liveness/challenge`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to create liveness challenge.');
  }
  return data;
}

export async function validateLivenessApi(
  token: string,
  captureId: string,
  challengeId: string,
  nonce: string
): Promise<LivenessResult> {
  const response = await fetch(`${API_BASE_URL}/api/liveness/validate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      capture_id: captureId,
      challenge_id: challengeId,
      nonce: nonce,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Liveness validation failed.');
  }
  return data;
}

export async function getLivenessResultApi(token: string, captureId: string): Promise<LivenessResult> {
  const response = await fetch(`${API_BASE_URL}/api/liveness/${captureId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch liveness results.');
  }
  return data;
}

// Phase 8 - Provenance Engine APIs
export async function createProvenanceRecordApi(
  token: string,
  productId: number,
  captureId: string
): Promise<ProvenanceRecord> {
  const response = await fetch(`${API_BASE_URL}/api/provenance`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId,
      capture_id: captureId,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to assemble provenance record.');
  }
  return data;
}

export async function getProvenanceRecordApi(token: string, identifier: string): Promise<ProvenanceRecord> {
  const response = await fetch(`${API_BASE_URL}/api/provenance/${identifier}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch provenance record.');
  }
  return data;
}

export async function listProvenanceRecordsApi(token: string): Promise<ProvenanceListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/provenance`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to list provenance records.');
  }
  return data;
}

export async function sealProvenanceRecordApi(token: string, identifier: string): Promise<ProvenanceSealResponse> {
  const response = await fetch(`${API_BASE_URL}/api/provenance/${identifier}/seal`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to seal provenance record.');
  }
  return data;
}

export async function verifyProvenanceRecordApi(identifier: string): Promise<ProvenanceVerificationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/provenance/verify/${identifier}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to verify cryptographic integrity.');
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
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to pin audio evidence to IPFS.');
  }
  return data;
}

export async function getIpfsAudioMetadataApi(identifier: string): Promise<IPFSResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ipfs/${identifier}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
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
  const data = await response.json();
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
  const data = await response.json();
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
  const data = await response.json();
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
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch product QR code.');
  }
  return data;
}
