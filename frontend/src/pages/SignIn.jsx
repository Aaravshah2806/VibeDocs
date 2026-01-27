import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

function SignInPage() {
  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
        <div className="auth-grid"></div>
      </div>

      {/* Floating Particles */}
      <div className="auth-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="auth-particle" style={{
            '--delay': `${Math.random() * 5}s`,
            '--duration': `${15 + Math.random() * 10}s`,
            '--x-start': `${Math.random() * 100}%`,
            '--x-end': `${Math.random() * 100}%`,
          }}></div>
        ))}
      </div>

      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="auth-logo-text">Vibe<span className="text-gradient">Docs</span></span>
          </Link>
          
          <div className="auth-branding-content">
            <h2 className="auth-branding-title">
              Generate <span className="text-gradient">Professional</span> READMEs
            </h2>
            <p className="auth-branding-desc">
              Transform your repositories with AI-powered documentation that makes your projects shine.
            </p>
            
            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                <span>AI-Powered Generation</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                </div>
                <span>GitHub Integration</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <path d="M3 9h18M9 21V9"/>
                  </svg>
                </div>
                <span>Beautiful Templates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-card">
            <div className="auth-card-header">
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-subtitle">Sign in to continue to your dashboard</p>
            </div>
            
            <div className="auth-clerk-container">
              <SignIn 
                routing="path" 
                path="/sign-in"
                signUpUrl="/sign-up"
                afterSignInUrl="/dashboard"
                appearance={{
                  variables: {
                    colorPrimary: '#8b5cf6',
                    colorBackground: 'transparent',
                    colorText: '#ffffff',
                    colorTextSecondary: '#a0a0b0',
                    colorInputBackground: 'rgba(26, 26, 37, 0.8)',
                    colorInputText: '#ffffff',
                    borderRadius: '0.75rem',
                    fontFamily: '"Libre Franklin", -apple-system, BlinkMacSystemFont, sans-serif',
                  },
                  elements: {
                    rootBox: {
                      width: '100%',
                    },
                    card: {
                      background: 'transparent',
                      boxShadow: 'none',
                      border: 'none',
                      padding: '0',
                    },
                    headerTitle: {
                      display: 'none',
                    },
                    headerSubtitle: {
                      display: 'none',
                    },
                    socialButtonsBlockButton: {
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      color: '#ffffff',
                      borderRadius: '0.75rem',
                      padding: '0.875rem 1rem',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(139, 92, 246, 0.15)',
                        borderColor: 'rgba(139, 92, 246, 0.5)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2)',
                      }
                    },
                    socialButtonsBlockButtonText: {
                      color: '#ffffff',
                      fontWeight: '500',
                    },
                    socialButtonsProviderIcon: {
                      filter: 'brightness(0) invert(1)',
                    },
                    dividerLine: {
                      background: 'rgba(139, 92, 246, 0.2)',
                    },
                    dividerText: {
                      color: '#6a6a7a',
                    },
                    formFieldLabel: {
                      color: '#a0a0b0',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    },
                    formFieldInput: {
                      background: 'rgba(26, 26, 37, 0.8)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      color: '#ffffff',
                      borderRadius: '0.75rem',
                      padding: '0.875rem 1rem',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      '&:focus': {
                        borderColor: '#8b5cf6',
                        boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.2), 0 0 20px rgba(139, 92, 246, 0.15)',
                        background: 'rgba(26, 26, 37, 1)',
                      },
                      '&::placeholder': {
                        color: '#6a6a7a',
                      }
                    },
                    formButtonPrimary: {
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                      borderRadius: '0.75rem',
                      padding: '0.875rem 1.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      textTransform: 'none',
                      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #9d6fff 0%, #4d94ff 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 25px rgba(139, 92, 246, 0.4)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      }
                    },
                    footerAction: {
                      padding: '1rem 0 0',
                    },
                    footerActionText: {
                      color: '#a0a0b0',
                    },
                    footerActionLink: {
                      color: '#8b5cf6',
                      fontWeight: '600',
                      '&:hover': {
                        color: '#9d6fff',
                      }
                    },
                    identityPreview: {
                      background: 'rgba(26, 26, 37, 0.8)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      borderRadius: '0.75rem',
                    },
                    identityPreviewText: {
                      color: '#ffffff',
                    },
                    identityPreviewEditButton: {
                      color: '#8b5cf6',
                    },
                    formFieldAction: {
                      color: '#8b5cf6',
                    },
                    formFieldInputShowPasswordButton: {
                      color: '#8b5cf6',
                    },
                    otpCodeFieldInput: {
                      background: 'rgba(26, 26, 37, 0.8)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      color: '#ffffff',
                      borderRadius: '0.5rem',
                    },
                    alert: {
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '0.75rem',
                    },
                    alertText: {
                      color: '#ef4444',
                    },
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
