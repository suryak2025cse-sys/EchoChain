import type { HealthResponse, TokenResponse, Product, ProducerStats, PaginatedProducts, AudioRecording, AudioCapture, AcousticFingerprint, LivenessChallenge, LivenessResult, ProvenanceRecord, ProvenanceListResponse, ProvenanceSealResponse, ProvenanceVerificationResponse, IPFSUploadResponse, IPFSResponse, PolygonAnchorResponse, PolygonVerificationResponse, PublicVerificationResponse, CertifierReviewDetail, CertifierDecisionResponse, AuditLogListResponse, SecurityEvent, SecurityEventListResponse, SecurityMetricsSummary, SecurityScanResult, UserProfileResponse } from '../types';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl;

/**
 * Custom fetch wrapper with automatic 1-retry for Render cold starts and diagnostic error handling.
 */
async function apiFetch(input: RequestInfo | URL, init?: RequestInit, isRetry = false): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : input.toString();
  const method = init?.method || 'GET';
  
  try {
    const response = await fetch(input, init);
    return response;
  } catch (error: any) {
    console.error(`[EchoChain API Connection Error] ${method} ${urlStr}`, {
      error,
      targetUrl: urlStr,
      baseUrl: API_BASE_URL
    });

    const isNetworkError = error instanceof TypeError || (error?.message && error.message.toLowerCase().includes('failed to fetch'));
    
    // Auto retry once if Render was sleeping on cold start
    if (isNetworkError && !isRetry) {
      console.info(`[EchoChain API] Retrying request in 2s for Render cold-start wakeup: ${urlStr}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return apiFetch(input, init, true);
    }

    if (isNetworkError) {
      throw new Error(
        `API CONNECTION ERROR (${method} ${urlStr}): Unable to connect to the EchoChain backend API (${API_BASE_URL || 'relative'}). Possible causes: Backend server is offline, incorrect VITE_API_URL, or CORS network restriction.`
      );
    }
    throw error;
  }
}

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
    const response = await apiFetch(`${API_BASE_URL}/api/health`, {
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
  const response = await apiFetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: typeof email === 'string' ? email.toLowerCase().trim() : email, password }),
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
  const response = await apiFetch(`${API_BASE_URL}/api/v1/auth/register`, {
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

export async function fetchUserProfileApi(token: string): Promise<UserProfileResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch user profile.');
  }
  return data;
}

export const fetchMeApi = fetchUserProfileApi;

export async function updateProfileApi(
  token: string,
  fullName: string,
  organization?: string
): Promise<UserProfileResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/auth/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      full_name: fullName,
      organization: organization || null,
    }),
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to update profile.');
  }
  return data;
}

export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Password reset request failed.');
  }
  return data;
}

export const resetPasswordApi = forgotPasswordApi;

export async function fetchProductsApi(
  token: string,
  params?: {
    search?: string;
    productType?: string;
    producerOnly?: boolean;
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
  const response = await apiFetch(url, {
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
  const response = await apiFetch(`${API_BASE_URL}/api/v1/products/${productId}`, {
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
  const response = await apiFetch(`${API_BASE_URL}/api/v1/products`, {
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
    description?: string;
  }>
): Promise<Product> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to update product batch.');
  }
  return data;
}

export async function deleteProductApi(token: string, productId: number): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await safeParseJson(response);
    throw new Error(data.detail || 'Failed to delete product batch.');
  }
}

export async function fetchProducerStatsApi(token: string): Promise<ProducerStats> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/products/stats`, {
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

export async function uploadAudioApi(
  token: string,
  productId: number,
  file: File,
  locationLat?: number,
  locationLng?: number,
  deviceInfo?: string
): Promise<AudioRecording> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('product_id', productId.toString());
  if (locationLat !== undefined) formData.append('location_latitude', locationLat.toString());
  if (locationLng !== undefined) formData.append('location_longitude', locationLng.toString());
  if (deviceInfo) formData.append('device_info', deviceInfo);

  const response = await apiFetch(`${API_BASE_URL}/api/v1/audio/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to upload audio recording.');
  }
  return data;
}

export async function listAudioCapturesApi(
  token: string,
  productId?: number,
  verificationStatus?: string,
  page = 1,
  limit = 20
): Promise<{ items: AudioCapture[]; total: number; page: number; limit: number; total_pages: number }> {
  const query = new URLSearchParams();
  if (productId) query.append('product_id', productId.toString());
  if (verificationStatus) query.append('verification_status', verificationStatus);
  query.append('page', page.toString());
  query.append('limit', limit.toString());

  const response = await apiFetch(`${API_BASE_URL}/api/v1/audio/captures?${query.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch audio captures.');
  }
  return data;
}

export const fetchAudioRecordingsApi = listAudioCapturesApi;
export const deleteAudioApi = deleteProductApi;

export async function analyzeAcousticFingerprintApi(token: string, captureId: number): Promise<AcousticFingerprint> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/acoustic/analyze/${captureId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Acoustic fingerprint analysis failed.');
  }
  return data;
}

export async function getAcousticFingerprintApi(token: string, captureId: number): Promise<AcousticFingerprint> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/acoustic/fingerprint/${captureId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to retrieve acoustic fingerprint.');
  }
  return data;
}

export async function createLivenessChallengeApi(token: string): Promise<LivenessChallenge> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/liveness/challenge`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to create liveness challenge.');
  }
  return data;
}

export async function verifyLivenessApi(
  token: string,
  captureId: number,
  challengeId?: string,
  userPhrase?: string
): Promise<LivenessResult> {
  const params = new URLSearchParams();
  if (challengeId) params.append('challenge_id', challengeId);
  if (userPhrase) params.append('user_phrase', userPhrase);
  const searchParams = params.toString() ? `?${params.toString()}` : '';

  const response = await apiFetch(`${API_BASE_URL}/api/v1/liveness/verify/${captureId}${searchParams}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Liveness verification failed.');
  }
  return data;
}

export async function getLivenessResultApi(token: string, captureId: number): Promise<LivenessResult> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/liveness/result/${captureId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch liveness result.');
  }
  return data;
}

export async function listProvenanceRecordsApi(token: string): Promise<ProvenanceListResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/provenance`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch provenance records.');
  }
  return data;
}

export async function getProvenanceRecordApi(token: string, provenanceId: string): Promise<ProvenanceRecord> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/provenance/${provenanceId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch provenance record.');
  }
  return data;
}

export async function createProvenanceRecordApi(
  token: string,
  payload: { product_id: number; capture_id: number }
): Promise<ProvenanceRecord> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/provenance`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to create provenance record.');
  }
  return data;
}

export async function sealProvenanceRecordApi(token: string, provenanceId: string): Promise<ProvenanceSealResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/provenance/${provenanceId}/seal`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to seal provenance record.');
  }
  return data;
}

export async function verifyProvenanceRecordApi(provenanceId: string): Promise<ProvenanceVerificationResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/provenance/verify/${provenanceId}`);
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Provenance verification failed.');
  }
  return data;
}

export async function uploadAudioToIpfsApi(token: string, identifier: string): Promise<IPFSUploadResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/ipfs/upload/${identifier}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'IPFS upload failed.');
  }
  return data;
}

export async function getIpfsRecordApi(identifier: string): Promise<IPFSResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/ipfs/${identifier}`);
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch IPFS record.');
  }
  return data;
}

export async function anchorProvenanceOnPolygonApi(token: string, identifier: string): Promise<PolygonAnchorResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/polygon/anchor/${identifier}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Polygon anchoring failed.');
  }
  return data;
}

export async function verifyPolygonAnchorApi(identifier: string): Promise<PolygonVerificationResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/polygon/verify/${identifier}`);
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Polygon verification failed.');
  }
  return data;
}

export async function getPublicVerificationApi(identifier: string): Promise<PublicVerificationResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/verify/${identifier}`);
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Public verification failed.');
  }
  return data;
}

export async function getProductQrCodeApi(productId: number): Promise<{ product_id: number; echochain_product_id: string; qr_code_b64: string }> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/products/${productId}/qr`);
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch QR code.');
  }
  return data;
}

export async function listCertifierProvenanceApi(token: string, status?: string): Promise<ProvenanceListResponse> {
  const query = status ? `?status=${status}` : '';
  const response = await apiFetch(`${API_BASE_URL}/api/v1/certifier/provenance${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch certifier provenance list.');
  }
  return data;
}

export const fetchCertifierQueueApi = listCertifierProvenanceApi;

export async function getCertifierProvenanceDetailApi(token: string, identifier: string): Promise<CertifierReviewDetail> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/certifier/provenance/${identifier}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch certifier detail.');
  }
  return data;
}

export const fetchCertifierReviewDetailApi = getCertifierProvenanceDetailApi;

export async function submitCertifierDecisionApi(
  token: string,
  identifier: string,
  decision: string,
  comments?: string
): Promise<CertifierDecisionResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/certifier/decide/${identifier}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ decision, comments: comments || null }),
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to submit certifier decision.');
  }
  return data;
}

export const decideProvenanceApi = submitCertifierDecisionApi;

export async function fetchAuditLogsApi(token: string, limit = 50): Promise<AuditLogListResponse> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/certifier/audit-logs?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch audit logs.');
  }
  return data;
}

export async function fetchSecurityEventsApi(
  token: string,
  params?: { risk_level?: string; limit?: number; page?: number }
): Promise<SecurityEventListResponse> {
  const q = new URLSearchParams();
  if (params?.risk_level) q.append('risk_level', params.risk_level);
  if (params?.limit) q.append('limit', params.limit.toString());
  if (params?.page) q.append('page', params.page.toString());

  const response = await apiFetch(`${API_BASE_URL}/api/v1/security/events?${q.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch security events.');
  }
  return data;
}

export async function fetchSecurityMetricsApi(token: string): Promise<SecurityMetricsSummary> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/security/metrics`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch security metrics.');
  }
  return data;
}

export async function runSecurityScanApi(token: string): Promise<SecurityScanResult> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/security/scan`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to run security scan.');
  }
  return data;
}

export async function resolveSecurityEventApi(
  token: string,
  eventId: number,
  resolutionNotes: string
): Promise<SecurityEvent> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/security/events/${eventId}/resolve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resolution_notes: resolutionNotes }),
  });
  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to resolve security event.');
  }
  return data;
}
