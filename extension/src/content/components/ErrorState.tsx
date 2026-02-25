import { h } from 'preact';

interface ErrorStateProps {
  type: 'not_authenticated' | 'not_found' | 'network_error' | 'unknown';
  onRetry?: () => void;
}

export function ErrorState({ type, onRetry }: ErrorStateProps) {
  const messages = {
    not_authenticated: {
      title: 'Belum Login',
      message: 'Silakan login melalui extension',
      action: 'Buka Extension'
    },
    not_found: {
      title: 'Kontak Tidak Ditemukan',
      message: 'Nomor ini belum terdaftar di CRM',
      action: null
    },
    network_error: {
      title: 'Koneksi Error',
      message: 'Gagal terhubung ke server. Coba lagi?',
      action: 'Coba Lagi'
    },
    unknown: {
      title: 'Terjadi Kesalahan',
      message: 'Silakan coba lagi nanti',
      action: 'Coba Lagi'
    }
  };

  const { title, message, action } = messages[type];

  const handleAction = () => {
    if (type === 'not_authenticated') {
      // Open extension popup
      chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    } else if (onRetry) {
      onRetry();
    }
  };

  return (
    <div className="pp-login-prompt">
      <div className="pp-login-prompt-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          {type === 'not_authenticated' && (
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          )}
          {type === 'not_found' && (
            <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          )}
          {(type === 'network_error' || type === 'unknown') && (
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          )}
        </svg>
      </div>
      <h3 className="pp-font-semibold pp-text-gray-900 pp-mb-2">{title}</h3>
      <p className="pp-text-sm pp-text-gray-500 pp-mb-3">{message}</p>
      
      {type === 'not_authenticated' && (
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', textAlign: 'center' }}>
          Click icon PelangganPro di toolbar Chrome untuk login
        </div>
      )}
      
      {action && (
        <button 
          className="pp-button pp-button-primary pp-button-sm"
          onClick={handleAction}
        >
          {action}
        </button>
      )}
    </div>
  );
}
