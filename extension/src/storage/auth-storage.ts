import type { AuthData } from '../types';

const AUTH_KEY = 'pelangganpro_auth';

// Request auth refresh from CRM web app
async function requestAuthRefresh(): Promise<AuthData | null> {
  return new Promise((resolve) => {
    console.log('[AuthStorage] Requesting auth refresh from CRM...');
    
    // Send message to CRM web app via content script
    window.postMessage({ type: 'PELANGGANPRO_REFRESH_AUTH_REQUEST' }, window.location.origin);
    
    // Listen for response
    const handleResponse = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'PELANGGANPRO_AUTH') {
        window.removeEventListener('message', handleResponse);
        clearTimeout(timeout);
        resolve({
          token: event.data.token,
          refreshToken: event.data.refreshToken,
          orgId: event.data.orgId,
          userId: event.data.userId,
          expiresAt: event.data.expiresAt
        });
      }
    };
    
    window.addEventListener('message', handleResponse);
    
    // Timeout after 5 seconds
    const timeout = setTimeout(() => {
      window.removeEventListener('message', handleResponse);
      console.log('[AuthStorage] Auth refresh request timeout');
      resolve(null);
    }, 5000);
  });
}

export const authStorage = {
  async getAuth(): Promise<AuthData | null> {
    try {
      // Try background script first
      const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH' });
      
      if (response?.success && response.data) {
        const auth = response.data as AuthData;
        
        console.log('[AuthStorage] Token check:', {
          hasToken: !!auth.token,
          expiresAt: new Date(auth.expiresAt).toISOString(),
          now: new Date().toISOString(),
          isExpired: Date.now() > auth.expiresAt
        });
        
        // Check expiration - buffer 5 menit
        if (Date.now() > (auth.expiresAt - 5 * 60 * 1000)) {
          console.log('[AuthStorage] Token expired or about to expire, trying refresh...');
          
          // Try to refresh auth from CRM web app
          const refreshedAuth = await requestAuthRefresh();
          if (refreshedAuth) {
            console.log('[AuthStorage] Auth refreshed successfully');
            await this.setAuth(refreshedAuth);
            return refreshedAuth;
          }
          
          console.log('[AuthStorage] Refresh failed, returning null');
          return null;
        }
        
        return auth;
      }
      
      console.log('[AuthStorage] No auth in storage');
      return null;
    } catch (error) {
      console.error('[AuthStorage] Error:', error);
      // Fallback: try direct storage access
      return this.getAuthDirect();
    }
  },

  // Fallback: direct storage access
  async getAuthDirect(): Promise<AuthData | null> {
    try {
      const result = await chrome.storage.local.get(AUTH_KEY);
      const auth = result[AUTH_KEY] as AuthData | undefined;
      
      if (auth && auth.token) {
        console.log('[AuthStorage] Direct access success');
        if (Date.now() > (auth.expiresAt - 30 * 60 * 1000)) {
          return null;
        }
        return auth;
      }
      return null;
    } catch (error) {
      console.error('[AuthStorage] Direct access error:', error);
      return null;
    }
  },

  async setAuth(auth: AuthData): Promise<void> {
    try {
      console.log('[AuthStorage] Saving auth:', {
        hasToken: !!auth.token,
        expiresAt: new Date(auth.expiresAt).toISOString()
      });
      
      await chrome.runtime.sendMessage({
        type: 'STORE_AUTH',
        data: auth
      });
    } catch (error) {
      console.error('[AuthStorage] Set error:', error);
    }
  },

  async clearAuth(): Promise<void> {
    try {
      await chrome.runtime.sendMessage({ type: 'CLEAR_AUTH' });
    } catch (error) {
      console.error('[AuthStorage] Clear error:', error);
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const auth = await this.getAuth();
    return auth !== null;
  },

  async getValidToken(): Promise<string | null> {
    const auth = await this.getAuth();
    return auth?.token || null;
  }
};
