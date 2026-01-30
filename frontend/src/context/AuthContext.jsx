import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL || "http://localhost:8000");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Fetch user info when token exists
  useEffect(() => {
    async function fetchUser() {
      if (!token) {
        setIsLoading(false);
        setIsSignedIn(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsSignedIn(true);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
          setIsSignedIn(false);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setIsSignedIn(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [token]);

  // Handle OAuth callback
  const handleCallback = (newToken) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
  };

  // Login with GitHub
  const loginWithGithub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/github/login`);
      const data = await response.json();
      
      if (data.auth_url) {
        // Store state for CSRF verification
        if (data.state) {
          sessionStorage.setItem('oauth_state', data.state);
        }
        // Redirect to GitHub OAuth
        window.location.href = data.auth_url;
      }
    } catch (error) {
      console.error('Failed to initiate GitHub login:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setIsSignedIn(false);
  };

  // Get token for API requests
  const getToken = () => token;

  const value = {
    user,
    token,
    isLoading,
    isSignedIn,
    isLoaded: !isLoading,
    loginWithGithub,
    logout,
    getToken,
    handleCallback
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convenience hook similar to Clerk's useUser
export function useUser() {
  const { user, isLoading, isSignedIn } = useAuth();
  return {
    user,
    isLoaded: !isLoading,
    isSignedIn
  };
}

export default AuthContext;
