import type { HealthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch health check:', error);
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
