/**
 * Shadow DOM utilities for isolating extension styles from WhatsApp Web
 */

export interface ShadowHost {
  host: HTMLElement;
  shadow: ShadowRoot;
  container: HTMLElement;
}

const HOST_ID = 'pelangganpro-crm-host';

/**
 * Create or get existing shadow DOM host
 */
export function createShadowHost(): ShadowHost | null {
  // Check if already exists
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    const shadow = existing.shadowRoot;
    if (shadow) {
      const container = shadow.getElementById('pp-root');
      if (container) {
        return {
          host: existing,
          shadow,
          container
        };
      }
    }
  }

  // Remove any existing host to ensure clean state
  if (existing) {
    existing.remove();
  }

  // Create host element
  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.cssText = `
    position: fixed;
    right: 0;
    top: 0;
    width: 320px;
    height: 100vh;
    z-index: 9999;
    pointer-events: none;
  `;

  // Attach shadow DOM
  const shadow = host.attachShadow({ mode: 'open' });

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = getShadowStyles();
  shadow.appendChild(styleSheet);

  // Create container for React app
  const container = document.createElement('div');
  container.id = 'pp-root';
  container.style.cssText = `
    width: 100%;
    height: 100%;
    pointer-events: auto;
  `;
  shadow.appendChild(container);

  // Append to body
  document.body.appendChild(host);

  return { host, shadow, container };
}

/**
 * Remove shadow host
 */
export function removeShadowHost(): void {
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    existing.remove();
  }
}

/**
 * Get CSS styles for shadow DOM
 * Includes Tailwind-like utilities + custom component styles
 */
function getShadowStyles(): string {
  return `
    /* Reset */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Base */
    :host {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #111827;
    }

    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }

    /* Utility Classes */
    .pp-flex { display: flex; }
    .pp-flex-col { flex-direction: column; }
    .pp-items-center { align-items: center; }
    .pp-justify-center { justify-content: center; }
    .pp-justify-between { justify-content: space-between; }
    .pp-gap-2 { gap: 8px; }
    .pp-gap-3 { gap: 12px; }
    
    .pp-w-full { width: 100%; }
    .pp-h-full { height: 100%; }
    
    .pp-p-3 { padding: 12px; }
    .pp-p-4 { padding: 16px; }
    .pp-px-3 { padding-left: 12px; padding-right: 12px; }
    .pp-py-2 { padding-top: 8px; padding-bottom: 8px; }
    
    .pp-mb-2 { margin-bottom: 8px; }
    .pp-mb-3 { margin-bottom: 12px; }
    .pp-mt-2 { margin-top: 8px; }
    
    .pp-text-sm { font-size: 13px; }
    .pp-text-xs { font-size: 11px; }
    .pp-text-lg { font-size: 16px; }
    .pp-font-medium { font-weight: 500; }
    .pp-font-semibold { font-weight: 600; }
    .pp-text-gray-500 { color: #6b7280; }
    .pp-text-gray-600 { color: #4b5563; }
    .pp-text-gray-900 { color: #111827; }
    
    .pp-bg-white { background-color: #ffffff; }
    .pp-bg-gray-50 { background-color: #f9fafb; }
    .pp-bg-gray-100 { background-color: #f3f4f6; }
    
    .pp-rounded { border-radius: 6px; }
    .pp-rounded-full { border-radius: 9999px; }
    
    .pp-border { border: 1px solid #e5e7eb; }
    .pp-border-b { border-bottom: 1px solid #e5e7eb; }
    
    /* Component Styles */
    .pp-sidebar {
      width: 100%;
      height: 100%;
      background: #ffffff;
      border-left: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    
    .pp-header {
      padding: 16px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      flex-shrink: 0;
    }
    
    .pp-header-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .pp-header-subtitle {
      font-size: 12px;
      opacity: 0.9;
    }
    
    .pp-section {
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .pp-section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 8px;
      letter-spacing: 0.025em;
    }
    
    .pp-tag {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 500;
      background: #e0e7ff;
      color: #4338ca;
      margin-right: 4px;
      margin-bottom: 4px;
    }
    
    .pp-button {
      width: 100%;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      background: white;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      color: #374151;
    }
    
    .pp-button:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #9ca3af;
    }
    
    .pp-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .pp-button-primary {
      background: #4f46e5;
      color: white;
      border-color: #4f46e5;
    }
    
    .pp-button-primary:hover:not(:disabled) {
      background: #4338ca;
    }
    
    .pp-button-sm {
      padding: 4px 8px;
      font-size: 12px;
      width: auto;
    }
    
    .pp-input, .pp-textarea, .pp-select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    
    .pp-input:focus, .pp-textarea:focus, .pp-select:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    
    .pp-textarea {
      min-height: 80px;
      resize: vertical;
    }
    
    .pp-select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      padding-right: 28px;
    }
    
    .pp-note-item {
      padding: 10px;
      background: #f9fafb;
      border-radius: 6px;
      margin-bottom: 8px;
      font-size: 13px;
      border: 1px solid #f3f4f6;
    }
    
    .pp-note-date {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
    }
    
    .pp-deal-value {
      font-size: 18px;
      font-weight: 600;
      color: #059669;
    }
    
    .pp-stage-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      background: #dbeafe;
      color: #1e40af;
    }
    
    .pp-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }
    
    .pp-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 32px;
    }
    
    .pp-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #e5e7eb;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: pp-spin 0.8s linear infinite;
    }
    
    @keyframes pp-spin {
      to { transform: rotate(360deg); }
    }
    
    .pp-empty {
      text-align: center;
      padding: 24px;
      color: #9ca3af;
      font-size: 13px;
    }
    
    .pp-error {
      padding: 16px;
      text-align: center;
      color: #dc2626;
      background: #fef2f2;
      border-radius: 6px;
      margin: 16px;
    }
    
    .pp-login-prompt {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 24px;
      text-align: center;
    }
    
    .pp-login-prompt-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #9ca3af;
    }
  `;
}
