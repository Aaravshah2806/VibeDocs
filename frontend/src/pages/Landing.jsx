import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LiquidGlassCard from '../components/LiquidGlassCard';
import Shuffle from '../components/Shuffle';

function Landing() {
  const location = useLocation();

  // Handle scroll from navigation state
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.state]);

  return (
    <div className="landing">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content animate-fadeIn">
            <span className="hero-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              AI-Powered Documentation
            </span>
            
            <div className="hero-title-wrapper">
              <Shuffle
                text="VibeDocs"
                tag="h1"
                className="shuffle-hero-title"
                shuffleDirection="up"
                duration={0.5}
                shuffleTimes={2}
                stagger={0.04}
                ease="power4.out"
                triggerOnHover={true}
                triggerOnce={false}
                threshold={0.2}
                rootMargin="0px"
              />
            </div>
            
            <h2 className="hero-subtitle">
              Generate Professional
              <span className="text-gradient"> README Files</span>
              <br />in Seconds
            </h2>
            
            <p className="hero-description">
              Transform your GitHub repositories into beautifully documented projects. 
              Let AI analyze your code and create stunning READMEs automatically.
            </p>
            
            <div className="hero-actions">
              <SignedOut>
                <Link to="/sign-up" className="btn btn-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  Connect GitHub
                </Link>
                <Link to="/sign-in" className="btn btn-secondary">
                  Sign In
                </Link>
              </SignedOut>
              
              <SignedIn>
                <Link to="/dashboard" className="btn btn-primary">
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Powerful <span className="text-gradient">Features</span>
            </h2>
            <p className="section-description">
              Everything you need to create professional documentation for your projects.
            </p>
          </div>
          
          <div className="grid grid-3">
            <LiquidGlassCard glowIntensity="md" shadowIntensity="sm" blurIntensity="md" className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </div>
              <h3 className="feature-title">GitHub Integration</h3>
              <p className="feature-description">
                Connect your GitHub account and import repositories directly from your dashboard.
              </p>
            </LiquidGlassCard>
            
            <LiquidGlassCard glowIntensity="md" shadowIntensity="sm" blurIntensity="md" className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 className="feature-title">AI-Powered Analysis</h3>
              <p className="feature-description">
                Our AI understands your code structure, dependencies, and purpose to write accurate docs.
              </p>
            </LiquidGlassCard>
            
            <LiquidGlassCard glowIntensity="md" shadowIntensity="sm" blurIntensity="md" className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <h3 className="feature-title">Live Editor</h3>
              <p className="feature-description">
                Edit and preview your README in real-time with our side-by-side Markdown editor.
              </p>
            </LiquidGlassCard>
            
            <LiquidGlassCard glowIntensity="md" shadowIntensity="sm" blurIntensity="md" className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <h3 className="feature-title">Beautiful Templates</h3>
              <p className="feature-description">
                Choose from Minimalist, Professional, and Portfolio styles to match your brand.
              </p>
            </LiquidGlassCard>
            
            <LiquidGlassCard glowIntensity="md" shadowIntensity="sm" blurIntensity="md" className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <h3 className="feature-title">Media Support</h3>
              <p className="feature-description">
                Add screenshots, GIFs, and badges to make your README stand out.
              </p>
            </LiquidGlassCard>
            
            <LiquidGlassCard glowIntensity="md" shadowIntensity="sm" blurIntensity="md" className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
              </div>
              <h3 className="feature-title">Direct Commit</h3>
              <p className="feature-description">
                Commit your generated README directly to your repository with one click.
              </p>
            </LiquidGlassCard>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="section-description">
              Three simple steps to professional documentation.
            </p>
          </div>
          
          <div className="steps">
            <LiquidGlassCard glowIntensity="sm" shadowIntensity="md" blurIntensity="md" className="step">
              <div className="step-number">1</div>
              <h3 className="step-title">Connect</h3>
              <p className="step-description">
                Sign in with your GitHub account and grant access to your repositories.
              </p>
            </LiquidGlassCard>
            
            <LiquidGlassCard glowIntensity="sm" shadowIntensity="md" blurIntensity="md" className="step">
              <div className="step-number">2</div>
              <h3 className="step-title">Select</h3>
              <p className="step-description">
                Choose a repository from your dashboard or paste a GitHub URL.
              </p>
            </LiquidGlassCard>
            
            <LiquidGlassCard glowIntensity="sm" shadowIntensity="md" blurIntensity="md" className="step">
              <div className="step-number">3</div>
              <h3 className="step-title">Generate</h3>
              <p className="step-description">
                Click generate and watch AI create a beautiful README in seconds.
              </p>
            </LiquidGlassCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <LiquidGlassCard glowIntensity="lg" shadowIntensity="lg" blurIntensity="lg" className="cta-card">
            <h2 className="cta-title">Ready to Create Amazing Docs?</h2>
            <p className="cta-description">
              Join thousands of developers who save hours on documentation.
            </p>
            <SignedOut>
              <Link to="/sign-up" className="btn btn-primary">
                Get Started for Free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            </SignedIn>
          </LiquidGlassCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;
