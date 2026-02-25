const AUTH_KEY = 'pelangganpro_auth';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'STORE_AUTH') {
    chrome.storage.local.set({ [AUTH_KEY]: request.data })
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.type === 'GET_AUTH') {
    chrome.storage.local.get(AUTH_KEY)
      .then((result) => sendResponse({ success: true, data: result[AUTH_KEY] || null }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.type === 'CLEAR_AUTH') {
    chrome.storage.local.remove(AUTH_KEY)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.type === 'OPEN_POPUP') {
    chrome.action.openPopup();
    return true;
  }
});

console.log('[Background] Service worker started');
