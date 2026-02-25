import { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { authStorage } from '../storage/auth-storage';

const API_BASE_URL = 'http://localhost:3000';

function Popup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{orgId?: string}>({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const auth = await authStorage.getAuth();
    if (auth) {
      setIsLoggedIn(true);
      setUserInfo({ orgId: auth.orgId });
    }
  };

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call backend login API
      const response = await fetch(`${API_BASE_URL}/api/extension/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Login failed');
      }

      const result = await response.json();
      
      await authStorage.setAuth({
        token: result.token,
        orgId: result.orgId,
        userId: result.userId,
        expiresAt: result.expiresAt || Date.now() + 24 * 60 * 60 * 1000
      });

      setIsLoggedIn(true);
      setUserInfo({ orgId: result.orgId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authStorage.clearAuth();
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  const openCRM = () => {
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  };

  if (isLoggedIn) {
    return (
      <div style={{ width: '280px', padding: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            P
          </div>
          <h2 style={{ margin: '0 0 4px', fontSize: '16px' }}>PelangganPro</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#22c55e' }}>✓ Terhubung</p>
        </div>

        <div style={{ 
          background: '#f3f4f6', 
          padding: '12px', 
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0 0 4px' }}><strong>Org ID:</strong> {userInfo.orgId?.slice(0, 8)}...</p>
          <p style={{ margin: 0, color: '#6b7280' }}>Siap digunakan di WhatsApp Web</p>
        </div>

        <button 
          onClick={openCRM}
          style={{
            width: '100%',
            padding: '10px',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            marginBottom: '8px'
          }}
        >
          Buka Dashboard CRM
        </button>

        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            color: '#dc2626',
            border: '1px solid #dc2626',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '280px', padding: '16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          P
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: '16px' }}>PelangganPro</h2>
        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Login untuk menggunakan extension</p>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '10px',
          borderRadius: '6px',
          fontSize: '12px',
          marginBottom: '12px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            placeholder="email@example.com"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            background: loading ? '#9ca3af' : '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 500
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ 
        fontSize: '11px', 
        color: '#6b7280', 
        textAlign: 'center',
        marginTop: '12px',
        marginBottom: 0
      }}>
        Gunakan akun CRM PelangganPro Anda
      </p>
    </div>
  );
}

render(<Popup />, document.getElementById('root')!);
