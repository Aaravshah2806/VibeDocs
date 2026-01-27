import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => location.pathname === path;

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      // Navigate to home page first, then scroll
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      // Already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span>Vibe<span className="text-gradient">Docs</span></span>
        </Link>

        <div className="navbar-nav">
          <SignedIn>
            <Link 
              to="/dashboard" 
              className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </SignedIn>
          <button onClick={() => scrollToSection('features')} className="navbar-link nav-btn">
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="navbar-link nav-btn">
            How It Works
          </button>
        </div>

        <div className="navbar-actions">
          <SignedOut>
            <Link to="/sign-in" className="btn btn-secondary">
              Sign In
            </Link>
            <Link to="/sign-up" className="btn btn-primary">
              Get Started
            </Link>
          </SignedOut>
          
          <SignedIn>
            <UserButton 
              appearance={{
                variables: {
                  colorPrimary: '#8b5cf6',
                  colorBackground: '#12121a',
                  colorText: '#ffffff',
                  colorTextSecondary: '#a0a0b0',
                  colorInputBackground: 'rgba(26, 26, 37, 0.8)',
                  colorInputText: '#ffffff',
                  borderRadius: '0.75rem',
                  fontFamily: '"Libre Franklin", -apple-system, BlinkMacSystemFont, sans-serif',
                },
                elements: {
                  avatarBox: {
                    width: '42px',
                    height: '42px',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 10px rgba(139, 92, 246, 0.2)',
                    '&:hover': {
                      borderColor: 'rgba(139, 92, 246, 0.6)',
                      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
                      transform: 'scale(1.05)',
                    }
                  },
                  userButtonPopoverCard: {
                    background: 'rgba(18, 18, 26, 0.95)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    borderRadius: '1rem',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                  },
                  userButtonPopoverMain: {
                    padding: '0.5rem',
                  },
                  userButtonPopoverFooter: {
                    display: 'none',
                  },
                  userPreview: {
                    padding: '1rem',
                    borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
                  },
                  userPreviewMainIdentifier: {
                    color: '#ffffff',
                    fontWeight: '600',
                  },
                  userPreviewSecondaryIdentifier: {
                    color: '#a0a0b0',
                  },
                  userButtonPopoverActionButton: {
                    color: '#a0a0b0',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(139, 92, 246, 0.15)',
                      color: '#ffffff',
                    }
                  },
                  userButtonPopoverActionButtonText: {
                    fontWeight: '500',
                  },
                  userButtonPopoverActionButtonIcon: {
                    color: '#8b5cf6',
                    opacity: 0.8,
                  },
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

