import { h } from 'preact';
import { useState } from 'preact/hooks';
import { authStorage } from '../../storage/auth-storage';

export function LoginPrompt() {
  const [token, setToken] = useState('');
  const [orgId, setOrgId] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!token.trim() || !orgId.trim()) return;

    await authStorage.setAuth({
      token: token.trim(),
      orgId: orgId.trim(),
      userId: 'manual',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    // Refresh page to reload with auth
    window.location.reload();
  };

  if (showForm) {
    return (
      <div className="pp-sidebar">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
            Manual Login
          </h3>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            Copy token dari CRM:
          </p>
          <ol style={{ fontSize: '11px', color: '#666', marginBottom: '16px', paddingLeft: '16px' }}>
            <li>Buka CRM tab</li>
            <li>DevTools (F12) → Console</li>
            <li>Ketik: copy(localStorage.getItem('sb-access-token'))</li>
            <li>Paste di bawah</li>
          </ol>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Token..."
              value={token}
              onChange={(e) => setToken((e.target as HTMLInputElement).value)}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            <input
              type="text"
              placeholder="Org ID (dari CRM)..."
              value={orgId}
              onChange={(e) => setOrgId((e.target as HTMLInputElement).value)}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '8px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '8px',
                background: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Batal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pp-login-prompt">
      <div className="pp-login-prompt-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="pp-font-semibold pp-text-gray-900 pp-mb-2">Belum Login</h3>
      <p className="pp-text-sm pp-text-gray-500 pp-mb-3">
        Silakan login ke PelangganPro CRM terlebih dahulu
      </p>
      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', width: '100%' }}>
        <button 
          className="pp-button pp-button-primary pp-button-sm"
          onClick={() => window.open('http://localhost:3000/login', '_blank')}
        >
          Buka CRM
        </button>
        <button 
          className="pp-button pp-button-sm"
          onClick={() => setShowForm(true)}
        >
          Manual Login
        </button>
      </div>
      <p style={{ fontSize: '10px', color: '#999', marginTop: '12px', textAlign: 'center' }}>
        Tips: Refresh halaman ini setelah login di CRM
      </p>
    </div>
  );
}
