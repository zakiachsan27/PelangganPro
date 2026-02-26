import { h } from 'preact';
import { useState } from 'preact/hooks';
import { authStorage } from '../../storage/auth-storage';

interface LoginPromptProps {
  onLoginSuccess?: () => void;
}

export function LoginPrompt({ onLoginSuccess }: LoginPromptProps) {
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

    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  if (showForm) {
    return (
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
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{ 
        width: '56px', 
        height: '56px', 
        marginBottom: '20px',
        color: '#9ca3af'
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#1f2937' }}>
        Belum Login
      </h3>
      
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
        Silakan login ke PelangganPro CRM terlebih dahulu
      </p>
      
      {/* Instruksi Langkah-langkah */}
      <div style={{ 
        background: '#f9fafb', 
        borderRadius: '12px', 
        padding: '20px', 
        marginBottom: '20px',
        textAlign: 'left',
        width: '100%',
        border: '1px solid #e5e7eb'
      }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
          🔐 Cara Login:
        </p>
        <ol style={{ 
          fontSize: '12px', 
          color: '#4b5563', 
          paddingLeft: '20px',
          margin: 0,
          lineHeight: '1.8'
        }}>
          <li>Klik icon extension <strong>PelangganPRO CRM</strong> di toolbar browser</li>
          <li>Masukkan email dan password Anda</li>
          <li>Klik tombol <strong>Login</strong></li>
          <li>Refresh halaman ini (klik tombol Refresh atau tekan Ctrl+R)</li>
        </ol>
      </div>

      <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.5' }}>
        💡 Setelah login, refresh halaman WhatsApp Web untuk memuat sidebar
      </p>
    </div>
  );
}
