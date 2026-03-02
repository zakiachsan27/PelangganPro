import { authStorage } from '../storage/auth-storage';
import type { 
  ContactData, 
  CreateNoteRequest, 
  UpdateNoteRequest,
  UpdateStageRequest,
  AssignRequest,
  CreateReminderRequest,
  TicketInfo,
  CreateTicketRequest,
  TaskInfo,
  PipelineInfo,
  MessageScheduler
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

  async getContact(
    phoneOrId: string, 
    name?: string, 
    autoCreate: boolean = true, 
    bustCache: boolean = false,
    isId: boolean = false
  ): Promise<ContactData | null> {
    const params = new URLSearchParams();
    
    if (isId) {
      params.append('id', phoneOrId);
    } else {
      params.append('phone', phoneOrId);
    }
    
    if (name) params.append('name', name);
    if (autoCreate) params.append('autoCreate', 'true');
    if (bustCache) params.append('_t', Date.now().toString());
    
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

  async updateNote(data: UpdateNoteRequest): Promise<void> {
    await this.fetch('/note', {
      method: 'PATCH',
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
    await this.fetch('/reminders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getContacts(): Promise<{ id: string; name: string; phone: string | null }[]> {
    const response = await this.fetch<{ data: { id: string; name: string; phone: string | null }[] }>('/contacts');
    return response.data || [];
  }

  async createContact(data: {
    first_name: string;
    last_name?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
  }): Promise<{ id: string; name: string; phone: string | null }> {
    return this.fetch<{ id: string; name: string; phone: string | null }>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getTickets(contactId: string): Promise<TicketInfo[]> {
    const response = await this.fetch<{ data: TicketInfo[] }>(`/tickets?contact_id=${contactId}`);
    return response.data || [];
  }

  async createTicket(data: CreateTicketRequest): Promise<TicketInfo> {
    const token = await authStorage.getValidToken();
    
    if (!token) {
      throw new CRMClientError('Sesi habis. Silakan login ulang.', 'NOT_AUTHENTICATED', 401, false);
    }
    
    const url = `${API_BASE_URL}/api/extension/tickets`;
    
    // Create FormData if there's an image file
    if (data.imageFile) {
      const formData = new FormData();
      formData.append('contactId', data.contactId);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('priority', data.priority);
      formData.append('image', data.imageFile);
      
      // Don't set Content-Type for FormData - browser will set it with boundary
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new CRMClientError(errorText || 'Failed to create ticket', 'HTTP_ERROR', response.status, false);
      }

      return (await response.json()).data;
    }
    
    // Regular JSON request without image
    const response = await this.fetch<{ data: TicketInfo }>('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        contactId: data.contactId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority
      })
    });
    return response.data;
  }

  async getUpcomingReminders(contactId: string): Promise<TaskInfo[]> {
    try {
      const response = await this.fetch<{ data: TaskInfo[] }>(`/reminders?contact_id=${contactId}&upcoming=true`);
      return response.data || [];
    } catch (err) {
      console.error('[CRMClient] Failed to get reminders:', err);
      return [];
    }
  }

  async updateContact(contactId: string, data: { status?: string; source?: string }): Promise<void> {
    await this.fetch(`/contacts/${contactId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async getPipelines(): Promise<PipelineInfo[]> {
    const response = await this.fetch<{ data: PipelineInfo[] }>('/deals');
    return response.data || [];
  }

  async createDeal(data: { 
    contactId: string; 
    title: string; 
    value: number; 
    currency: string;
    pipelineId: string;
    stageId: string;
  }): Promise<void> {
    console.log('[CRMClient] Creating deal:', data);
    try {
      await this.fetch('/deals', {
        method: 'POST',
        body: JSON.stringify({
          contactId: data.contactId,
          title: data.title,
          value: data.value,
          currency: data.currency,
          pipelineId: data.pipelineId,
          stageId: data.stageId,
        })
      });
    } catch (err) {
      console.error('[CRMClient] Create deal error:', err);
      throw err;
    }
  }

  async getSchedulers(): Promise<MessageScheduler[]> {
    try {
      const response = await this.fetch<{ data: MessageScheduler[] }>('/scheduler');
      return response.data || [];
    } catch (err) {
      console.error('[CRMClient] Failed to get schedulers:', err);
      return [];
    }
  }
}

export const crmClient = new CRMClient();
