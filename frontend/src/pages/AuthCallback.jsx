import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [error, setError] = useState(null);
  
  const API_URL = '';

  const hasFetched = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      if (!code || hasFetched.current) return;
      
      hasFetched.current = true;
      console.log("Auth code received, exchanging for token...");
      
      try {
        const response = await fetch(`${API_URL}/api/auth/github/callback?code=${code}`);
        const data = await response.json();
        
        if (response.ok) {
          console.log("Token received from backend");
          setToken(data.access_token);
          navigate('/dashboard');
        } else {
          console.error('Callback failed:', data);
          setError(data.detail || 'Authentication failed. Please try again.');
        }
      } catch (error) {
        console.error('Error during callback:', error);
        setError('Network error: Could not reach the backend. Is it running on port 8001?');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setToken]);

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#0a0a0a',
        color: '#fff',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h2 style={{ color: '#f87171' }}>Authentication Failed</h2>
        <p style={{ color: '#94a3b8', maxWidth: '500px' }}>{error}</p>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            padding: '10px 24px', 
            background: '#6366f1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#0a0a0a',
      color: '#fff',
      flexDirection: 'column',
      gap: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="spinner" style={{
        width: '50px',
        height: '50px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>Authenticating with GitHub...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;

