import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassSurface from './GlassSurface';

function Navbar() {
  const { isSignedIn, user, logout, login } = useAuth();
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
    <nav className="navbar-wrapper">
      <div className="container navbar-outer">
        <GlassSurface
          width="100%"
          height={64}
          borderRadius={24}
          borderWidth={0.06}
          brightness={45}
          opacity={0.95}
          blur={14}
          displace={0.5}
          backgroundOpacity={0.03}
          saturation={1.2}
          distortionScale={-160}
          redOffset={0}
          greenOffset={8}
          blueOffset={16}
          className="navbar-glass"
        >
          <div className="navbar-container">
            <Link to="/" className="navbar-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>Vibe<span className="text-gradient">Docs</span></span>
            </Link>

            <div className="navbar-nav">
              {isSignedIn && (
                <Link 
                  to="/dashboard" 
                  className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
              )}
              <button onClick={() => scrollToSection('features')} className="navbar-link nav-btn">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="navbar-link nav-btn">
                How It Works
              </button>
            </div>

            <div className="navbar-actions">
              {!isSignedIn ? (
                <>
                  <button onClick={login} className="btn btn-secondary btn-navbar" style={{cursor: 'pointer'}}>
                    Sign In
                  </button>
                  <button onClick={login} className="btn btn-primary btn-navbar" style={{cursor: 'pointer'}}>
                    Get Started
                  </button>
                </>
              ) : (
                <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img 
                    src={user?.avatar_url} 
                    alt={user?.github_username} 
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%',
                      border: '2px solid rgba(139, 92, 246, 0.4)'
                    }} 
                  />
                  <button onClick={logout} className="btn btn-secondary btn-navbar" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </GlassSurface>
      </div>
    </nav>
  );
}

export default Navbar;

