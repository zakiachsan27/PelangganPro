const AUTH_KEY = 'pelangganpro_auth';

// Track connected content script tabs
const connectedTabs = new Set<number>();

// Listen for content scripts connecting
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'pelangganpro-sidebar') {
    const tabId = port.sender?.tab?.id;
    if (tabId) {
      connectedTabs.add(tabId);
      console.log('[Background] Content script connected on tab:', tabId);
      
      port.onDisconnect.addListener(() => {
        connectedTabs.delete(tabId);
        console.log('[Background] Content script disconnected on tab:', tabId);
      });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'STORE_AUTH') {
    chrome.storage.local.set({ [AUTH_KEY]: request.data })
      .then(() => {
        console.log('[Background] Auth stored, notifying tabs...');
        // Notify all connected tabs about auth change
        notifyAuthChanged();
        sendResponse({ success: true });
      })
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
      .then(() => {
        console.log('[Background] Auth cleared, notifying tabs...');
        // Notify all connected tabs about auth change
        notifyAuthChanged();
        sendResponse({ success: true });
      })
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.type === 'OPEN_POPUP') {
    chrome.action.openPopup();
    return true;
  }

  if (request.type === 'AUTH_CHANGED') {
    // This is sent from popup to trigger refresh in content scripts
    console.log('[Background] Auth change notification received');
    notifyAuthChanged();
    sendResponse({ success: true });
    return true;
  }
});

// Notify all WhatsApp Web tabs to refresh
function notifyAuthChanged() {
  console.log('[Background] Notifying tabs about auth change...');
  
  chrome.tabs.query({ url: '*://web.whatsapp.com/*' }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        console.log('[Background] Sending refresh to tab:', tab.id);
        chrome.tabs.sendMessage(tab.id, { type: 'AUTH_REFRESH' }).catch((err) => {
          // Tab might not have content script loaded yet, that's ok
          console.log('[Background] Could not notify tab', tab.id, ':', err.message);
        });
      }
    });
  });
}

console.log('[Background] Service worker started');
