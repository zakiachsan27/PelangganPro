import { authStorage } from '../storage/auth-storage';
import type { 
  ContactData, 
  CreateNoteRequest, 
  UpdateStageRequest,
  AssignRequest,
  CreateReminderRequest 
} from '../types';

const API_BASE_URL = 'http://localhost:3000';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

class CRMClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'CRMClientError';
  }
}

class CRMClient {
  private async getHeaders(): Promise<Record<string, string>> {
    const token = await authStorage.getValidToken();
    
    console.log('[CRMClient] Getting headers, token exists:', !!token);
    
    if (!token) {
      throw new CRMClientError('Sesi habis. Silakan login ulang.', 'NOT_AUTHENTICATED', 401, false);
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private async fetchWithTimeout(
    url: string, 
    options: RequestInit, 
    timeoutMs: number = DEFAULT_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new CRMClientError(
          'Request timeout. Server tidak merespons dalam waktu 10 detik.',
          'TIMEOUT',
          undefined,
          true
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchWithRetry<T>(
    endpoint: string, 
    options?: RequestInit,
    retryCount: number = 0
  ): Promise<T> {
    const headers = await this.getHeaders();
    const url = `${API_BASE_URL}/api/extension${endpoint}`;
    
    console.log(`[CRMClient] Fetching (attempt ${retryCount + 1}/${MAX_RETRIES}):`, url);
    
    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        headers: {
          ...headers,
          ...options?.headers
        }
      });

      console.log('[CRMClient] Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.log('[CRMClient] 401 - Clearing auth');
          await authStorage.clearAuth();
          throw new CRMClientError('Sesi habis. Silakan login ulang.', 'NOT_AUTHENTICATED', 401, false);
        }
        
        // Server errors (5xx) are retryable
        if (response.status >= 500 && response.status < 600) {
          const errorText = await response.text();
          throw new CRMClientError(
            `Server error: ${errorText || response.statusText}`,
            'SERVER_ERROR',
            response.status,
            true
          );
        }
        
        const errorText = await response.text();
        console.error('[CRMClient] Error response:', errorText);
        throw new CRMClientError(
          errorText || `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status,
          false
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      // Check if we should retry
      if (error instanceof CRMClientError && error.isRetryable && retryCount < MAX_RETRIES - 1) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`[CRMClient] Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry<T>(endpoint, options, retryCount + 1);
      }
      
      console.error('[CRMClient] Fetch error:', error);
      throw error;
    }
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.fetchWithRetry<T>(endpoint, options);
  }

  async login(email: string, password: string): Promise<{
    token: string;
    refreshToken: string;
    orgId: string;
    userId: string;
    expiresAt: number;
  }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/extension/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new CRMClientError(data.error || 'Login gagal', 'LOGIN_FAILED', response.status, false);
    }

    const result = await response.json();
    
    // Set default expiration if not provided (1 hour)
    if (!result.expiresAt) {
      result.expiresAt = Date.now() + 3600 * 1000;
    }
    
    console.log('[CRMClient] Login success, expires:', new Date(result.expiresAt).toISOString());
    
    return result;
  }

  async getContact(phone: string, name?: string, autoCreate: boolean = true): Promise<ContactData | null> {
    const params = new URLSearchParams({ phone });
    if (name) params.append('name', name);
    if (autoCreate) params.append('autoCreate', 'true');
    
    try {
      return await this.fetch<ContactData>(`/contact?${params.toString()}`);
    } catch (error) {
      if (error instanceof CRMClientError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async addNote(data: CreateNoteRequest): Promise<void> {
    await this.fetch('/note', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateStage(data: UpdateStageRequest): Promise<void> {
    await this.fetch('/stage', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async assignContact(data: AssignRequest): Promise<void> {
    await this.fetch('/assign', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async addReminder(data: CreateReminderRequest): Promise<void> {
    await this.fetch('/reminder', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const crmClient = new CRMClient();
