import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <Link to="/" className="footer-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span>VibeDocs</span>
        </Link>

        <div className="footer-links">
          <a href="#features" className="footer-link">Features</a>
          <a href="#how-it-works" className="footer-link">How It Works</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">
            GitHub
          </a>
          <Link to="/sign-in" className="footer-link">Sign In</Link>
        </div>

        <p className="footer-copyright">
          © {new Date().getFullYear()} VibeDocs. Built with ❤️ for developers.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
