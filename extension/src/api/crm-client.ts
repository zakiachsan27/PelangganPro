import { authStorage } from '../storage/auth-storage';
import type { 
  ContactData, 
  CreateNoteRequest, 
  UpdateStageRequest,
  AssignRequest,
  CreateReminderRequest 
} from '../types';

const API_BASE_URL = 'http://localhost:3000';

class CRMClient {
  private async getHeaders(): Promise<Record<string, string>> {
    const token = await authStorage.getValidToken();
    
    console.log('[CRMClient] Getting headers, token exists:', !!token);
    
    if (!token) {
      throw new Error('NOT_AUTHENTICATED');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers = await this.getHeaders();
    const url = `${API_BASE_URL}/api/extension${endpoint}`;
    
    console.log('[CRMClient] Fetching:', url);
    console.log('[CRMClient] Headers:', { ...headers, Authorization: 'Bearer ***' });
    
    try {
      const response = await fetch(url, {
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
          throw new Error('NOT_AUTHENTICATED');
        }
        
        const errorText = await response.text();
        console.error('[CRMClient] Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('[CRMClient] Fetch error:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{
    token: string;
    refreshToken: string;
    orgId: string;
    userId: string;
    expiresAt: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/extension/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Login failed');
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
      if (error instanceof Error && error.message.includes('404')) {
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
