export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  app_name: string;
  version: string;
  timestamp: string;
  database_status: string;
  environment: string;
  details?: Record<string, unknown>;
}

export type UserRole = 'producer' | 'consumer' | 'certifier' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organization?: string;
}

export interface ProvenanceBatchOverview {
  batchId: string;
  productName: string;
  originRegion: string; // Public region only!
  acousticHash: string;
  ipfsCid: string;
  blockchainTxHash?: string;
  createdAt: string;
  verificationStatus: 'verified' | 'pending' | 'flagged';
}
