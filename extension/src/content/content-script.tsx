import { h, render } from 'preact';
import { Sidebar } from './components/Sidebar';

const HOST_ID = 'pelangganpro-crm-host';
const TOGGLE_ID = 'pelangganpro-toggle';
const STORAGE_KEY = 'pelangganpro_sidebar_visible';

let sidebarHost: HTMLElement | null = null;
let sidebarContainer: HTMLElement | null = null;
let toggleBtn: HTMLElement | null = null;
let isSidebarInitialized = false;

/**
 * Create toggle button
 */
function createToggleButton(isVisible: boolean): HTMLElement {
  const btn = document.createElement('div');
  btn.id = TOGGLE_ID;
  btn.textContent = isVisible ? '›' : '‹';
  btn.style.cssText = `
    position: fixed !important;
    right: ${isVisible ? '320px' : '0'} !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    z-index: 2147483647 !important;
    width: 32px !important;
    height: 70px !important;
    background: #4f46e5 !important;
    color: white !important;
    border-radius: 8px 0 0 8px !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 20px !important;
    font-weight: bold !important;
    box-shadow: -3px 0 10px rgba(0,0,0,0.3) !important;
    font-family: system-ui, -apple-system, sans-serif !important;
    transition: right 0.3s ease !important;
  `;
  
  btn.addEventListener('click', handleToggle);
  document.body.appendChild(btn);
  return btn;
}

/**
 * Update toggle button
 */
function updateToggleButton(isVisible: boolean) {
  if (toggleBtn) {
    toggleBtn.textContent = isVisible ? '›' : '‹';
    toggleBtn.style.right = isVisible ? '320px' : '0';
  }
}

/**
 * Handle toggle click
 */
function handleToggle() {
  chrome.storage.local.get(STORAGE_KEY).then((result) => {
    const current = result[STORAGE_KEY] !== false;
    const next = !current;
    
    chrome.storage.local.set({ [STORAGE_KEY]: next }).then(() => {
      updateToggleButton(next);
      if (next) {
        showSidebar();
      } else {
        hideSidebar();
      }
    });
  });
}

/**
 * Create sidebar host element (only once)
 */
function createSidebarHost(): HTMLElement {
  if (sidebarHost) return sidebarHost;
  
  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.cssText = `
    position: fixed !important;
    right: 0 !important;
    top: 0 !important;
    width: 320px !important;
    height: 100vh !important;
    z-index: 2147483646 !important;
  `;
  
  const shadow = host.attachShadow({ mode: 'open' });
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = getSidebarStyles();
  shadow.appendChild(style);
  
  // Create container
  const container = document.createElement('div');
  container.style.cssText = `
    width: 100%;
    height: 100%;
    background: white;
  `;
  shadow.appendChild(container);
  
  document.body.appendChild(host);
  sidebarHost = host;
  sidebarContainer = container;
  
  return host;
}

/**
 * Show sidebar
 */
function showSidebar() {
  const host = createSidebarHost();
  host.style.display = 'block';
  
  // Only render once - state will be preserved
  if (!isSidebarInitialized && sidebarContainer) {
    render(<Sidebar />, sidebarContainer);
    isSidebarInitialized = true;
  }
}

/**
 * Hide sidebar - only hide with CSS, don't unmount
 */
function hideSidebar() {
  if (sidebarHost) {
    sidebarHost.style.display = 'none';
  }
}

/**
 * Get sidebar styles
 */
function getSidebarStyles(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :host { font-family: system-ui, -apple-system, sans-serif; font-size: 14px; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
    
    .pp-sidebar { background: white; height: 100%; }
    .pp-section { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .pp-button { 
      padding: 8px 12px; border-radius: 6px; border: 1px solid #d1d5db; 
      background: white; cursor: pointer; font-size: 13px; 
    }
    .pp-button-primary { background: #4f46e5; color: white; border-color: #4f46e5; }
    
    .pp-loading { display: flex; justify-content: center; padding: 40px; }
    .pp-spinner { 
      width: 24px; height: 24px; 
      border: 2px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
}

/**
 * Initialize
 */
function init() {
  if (!window.location.href.includes('web.whatsapp.com')) return;
  if (!document.querySelector('#app')) {
    setTimeout(init, 1000);
    return;
  }

  // Check if already initialized
  if (document.getElementById(TOGGLE_ID)) return;

  chrome.storage.local.get(STORAGE_KEY).then((result) => {
    const isVisible = result[STORAGE_KEY] !== false;
    
    // Create toggle button
    toggleBtn = createToggleButton(isVisible);
    
    // Create sidebar (hidden initially if not visible)
    if (isVisible) {
      showSidebar();
    } else {
      createSidebarHost();
      hideSidebar();
    }
  });
}

// Cleanup
function cleanup() {
  if (toggleBtn) {
    toggleBtn.remove();
    toggleBtn = null;
  }
  if (sidebarHost) {
    sidebarHost.remove();
    sidebarHost = null;
    sidebarContainer = null;
    isSidebarInitialized = false;
  }
}

// Connect to background script
const port = chrome.runtime.connect({ name: 'pelangganpro-sidebar' });
console.log('[ContentScript] Connected to background');

// Listen for auth refresh messages from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[ContentScript] Message received:', request);
  if (request.type === 'AUTH_REFRESH') {
    console.log('[ContentScript] Auth refresh received, reloading sidebar...');
    // Re-initialize sidebar to trigger re-auth check
    if (sidebarContainer) {
      render(<Sidebar />, sidebarContainer);
    }
    sendResponse({ success: true });
    return true;
  }
});

// Run
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.addEventListener('beforeunload', cleanup);
