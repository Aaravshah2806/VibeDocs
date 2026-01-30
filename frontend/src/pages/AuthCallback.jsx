import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(errorParam);
      setTimeout(() => navigate('/sign-in'), 3000);
      return;
    }

    if (token) {
      handleCallback(token);
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } else {
      setError('No authentication token received');
      setTimeout(() => navigate('/sign-in'), 3000);
    }
  }, [searchParams, handleCallback, navigate]);

  if (error) {
    return (
      <div className="auth-callback">
        <div className="auth-callback-container">
          <div className="auth-callback-icon error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <h2>Authentication Failed</h2>
          <p>{error}</p>
          <p className="redirect-text">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback">
      <div className="auth-callback-container">
        <div className="loading-spinner"></div>
        <h2>Completing Sign In...</h2>
        <p>Please wait while we set up your account.</p>
      </div>
    </div>
  );
}

export default AuthCallback;
