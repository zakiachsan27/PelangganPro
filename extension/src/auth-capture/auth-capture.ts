/**
 * Auth Capture - Runs on CRM pages
 * Sends auth to background script
 */

console.log('[Auth Capture] Loaded on', window.location.href);

// Listen for auth from CRM web app
window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;

  if (event.data?.type === 'PELANGGANPRO_AUTH') {
    const { token, refreshToken, orgId, userId, expiresAt } = event.data;
    
    console.log('[Auth Capture] Received auth, sending to background...');

    if (token && orgId && userId) {
      // Send to background script
      chrome.runtime.sendMessage({
        type: 'STORE_AUTH',
        data: {
          token,
          refreshToken,
          orgId,
          userId,
          expiresAt: expiresAt || Date.now() + 24 * 60 * 60 * 1000
        }
      }, (response) => {
        if (response?.success) {
          console.log('[Auth Capture] ✅ Auth stored in background');
        } else {
          console.error('[Auth Capture] ❌ Failed:', response?.error);
        }
      });
    }
  }

  if (event.data?.type === 'PELANGGANPRO_LOGOUT') {
    chrome.runtime.sendMessage({ type: 'CLEAR_AUTH' });
  }
});
