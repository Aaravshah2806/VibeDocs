import { useState, useEffect } from 'react';
import { useUser, useAuth, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RepoCard from '../components/RepoCard';
import { fetchRepos } from '../services/api';

function Dashboard() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch repos from backend
  useEffect(() => {
    async function loadRepos() {
      if (!isSignedIn) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log('DEBUG: Getting token from Clerk...');
        const token = await getToken();
        console.log('DEBUG: Token received:', token ? 'Yes' : 'No');
        console.log('DEBUG: Calling fetchRepos...');
        const data = await fetchRepos(token);
        console.log('DEBUG: Repos received:', data);
        setRepos(data);
      } catch (err) {
        console.error('Failed to fetch repos:', err);
        setError(err.message || 'Failed to load repositories');
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && isSignedIn) {
      loadRepos();
    }
  }, [isLoaded, isSignedIn, getToken]);

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="container">
          <div className="loading-state">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Welcome back, <span className="text-gradient">{user?.firstName || 'Developer'}</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
              Select a repository to generate a README
            </p>
          </div>
          
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="input"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="card stat-card">
            <div className="stat-value">{repos.length}</div>
            <div className="stat-label">Repositories</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">
              {repos.reduce((acc, repo) => acc + (repo.stargazers_count || repo.stargrazers_count || 0), 0)}
            </div>
            <div className="stat-label">Total Stars</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">READMEs Generated</div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card empty-state">
            <div className="loading-spinner"></div>
            <h3 className="empty-state-title">Loading your repositories...</h3>
            <p className="empty-state-description">Fetching data from GitHub</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="card empty-state" style={{ borderColor: 'var(--error)' }}>
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <h3 className="empty-state-title">Failed to load repositories</h3>
            <p className="empty-state-description">{error}</p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: 'var(--space-4)' }}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Repos Grid */}
        {!loading && !error && filteredRepos.length > 0 && (
          <div className="repos-grid">
            {filteredRepos.map(repo => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRepos.length === 0 && (
          <div className="card empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <h3 className="empty-state-title">No repositories found</h3>
            <p className="empty-state-description">
              {searchQuery 
                ? 'Try adjusting your search query'
                : 'Connect your GitHub account to see your repositories'}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;
