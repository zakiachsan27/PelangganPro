import type { AuthData } from '../types';

const AUTH_KEY = 'pelangganpro_auth';

export const authStorage = {
  async getAuth(): Promise<AuthData | null> {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH' });
      
      if (response?.success && response.data) {
        const auth = response.data as AuthData;
        
        console.log('[AuthStorage] Token check:', {
          hasToken: !!auth.token,
          expiresAt: new Date(auth.expiresAt).toISOString(),
          now: new Date().toISOString(),
          isExpired: Date.now() > auth.expiresAt
        });
        
        // Check expiration - tambah buffer 5 menit
        if (Date.now() > (auth.expiresAt - 5 * 60 * 1000)) {
          console.log('[AuthStorage] Token expired or about to expire');
          return null;
        }
        
        return auth;
      }
      
      console.log('[AuthStorage] No auth in storage');
      return null;
    } catch (error) {
      console.error('[AuthStorage] Error:', error);
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
