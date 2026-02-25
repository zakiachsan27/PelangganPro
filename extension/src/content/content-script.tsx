import { h, render } from 'preact';
import { Sidebar } from './components/Sidebar';
import { ChatObserver } from './detectors/chat-observer';
import { createShadowHost, removeShadowHost } from '../utils/shadow-dom';

// Global state
let currentPhone: string | null = null;
let chatObserver: ChatObserver | null = null;
let sidebarContainer: HTMLElement | null = null;
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 10;
const AUTH_KEY = 'pelangganpro_auth';

// Connect to background script for reliable message passing
let port: chrome.runtime.Port | null = null;

/**
 * Initialize the extension
 */
function init(): void {
  console.log('[PelangganPro] Extension initializing...', {
    url: window.location.href,
    timestamp: new Date().toISOString()
  });

  if (!window.location.href.includes('web.whatsapp.com')) {
    console.log('[PelangganPro] Not on WhatsApp Web, skipping');
    return;
  }

  if (!document.querySelector('#app')) {
    initAttempts++;
    console.log(`[PelangganPro] Waiting for #app... attempt ${initAttempts}`);
    
    if (initAttempts < MAX_INIT_ATTEMPTS) {
      setTimeout(init, 1000);
      return;
    } else {
      console.error('[PelangganPro] Failed to find #app after max attempts');
      return;
    }
  }

  console.log('[PelangganPro] #app found, creating shadow DOM...');

  const shadowHost = createShadowHost();
  if (!shadowHost) {
    console.error('[PelangganPro] Failed to create shadow host');
    return;
  }

  sidebarContainer = shadowHost.container;
  console.log('[PelangganPro] Shadow DOM created successfully');

  // Initialize chat observer
  chatObserver = new ChatObserver((phone) => {
    handlePhoneChange(phone);
  });

  chatObserver.start();
  console.log('[PelangganPro] Chat observer started');

  // Connect to background script for reliable communication
  connectToBackground();

  // Listen for auth refresh messages from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUTH_REFRESH') {
      console.log('[PelangganPro] Auth refresh received, reloading sidebar...');
      handleAuthRefresh();
      sendResponse({ success: true });
      return true;
    }
  });

  // Also keep storage listener as fallback
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[AUTH_KEY]) {
      console.log('[PelangganPro] Auth changed via storage, refreshing...');
      handleAuthRefresh();
    }
  });

  // Initial render
  render(
    <div className="pp-sidebar">
      <div className="pp-empty">
        <p>Buka chat individual untuk melihat data CRM</p>
      </div>
    </div>,
    sidebarContainer
  );

  console.log('[PelangganPro] Extension initialized successfully');
}

/**
 * Connect to background script via port for reliable communication
 */
function connectToBackground() {
  try {
    port = chrome.runtime.connect({ name: 'pelangganpro-sidebar' });
    console.log('[PelangganPro] Connected to background script');
    
    port.onDisconnect.addListener(() => {
      console.log('[PelangganPro] Port disconnected, reconnecting...');
      port = null;
      // Attempt to reconnect after a delay
      setTimeout(connectToBackground, 1000);
    });
  } catch (error) {
    console.error('[PelangganPro] Failed to connect to background:', error);
  }
}

/**
 * Handle auth refresh - reload current contact data
 */
function handleAuthRefresh(): void {
  console.log('[PelangganPro] Handling auth refresh, current phone:', currentPhone);
  
  // Show refreshing indicator
  if (sidebarContainer) {
    render(
      <div className="pp-sidebar">
        <div className="pp-loading">
          <div className="pp-spinner" />
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
            Memperbarui sesi...
          </p>
        </div>
      </div>,
      sidebarContainer
    );
  }
  
  // Refresh after a short delay to allow auth to propagate
  setTimeout(() => {
    if (currentPhone) {
      handlePhoneChange(currentPhone);
    } else {
      // Re-render empty state
      if (sidebarContainer) {
        render(
          <div className="pp-sidebar">
            <div className="pp-empty">
              <p>Buka chat individual untuk melihat data CRM</p>
            </div>
          </div>,
          sidebarContainer
        );
      }
    }
  }, 500);
}

/**
 * Handle phone number change
 */
function handlePhoneChange(phone: string | null): void {
  console.log('[PelangganPro] Phone changed:', phone);
  
  currentPhone = phone;

  if (!sidebarContainer) {
    console.error('[PelangganPro] No sidebar container');
    return;
  }

  if (phone) {
    try {
      render(<Sidebar phone={phone} key={phone} />, sidebarContainer);
      console.log('[PelangganPro] Sidebar rendered with phone:', phone);
    } catch (error) {
      console.error('[PelangganPro] Failed to render sidebar:', error);
    }
  } else {
    render(
      <div className="pp-sidebar">
        <div className="pp-empty">
          <p>Buka chat individual untuk melihat data CRM</p>
        </div>
      </div>,
      sidebarContainer
    );
  }
}

/**
 * Cleanup on unload
 */
function cleanup(): void {
  console.log('[PelangganPro] Cleaning up...');
  if (chatObserver) {
    chatObserver.stop();
    chatObserver = null;
  }
  if (port) {
    port.disconnect();
    port = null;
  }
  removeShadowHost();
  sidebarContainer = null;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also try init after a delay (for SPA navigation)
setTimeout(init, 2000);

// Cleanup on unload
window.addEventListener('beforeunload', cleanup);

// Debug helper
(window as any).pelangganproDebug = {
  getCurrentPhone: () => currentPhone,
  refresh: () => currentPhone && handlePhoneChange(currentPhone),
  getContainer: () => sidebarContainer,
  reinit: init,
  forceAuthRefresh: handleAuthRefresh
};

console.log('[PelangganPro] Content script loaded');
