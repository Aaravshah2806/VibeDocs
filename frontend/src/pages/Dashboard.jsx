import { useState } from 'react';
import { useUser, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RepoCard from '../components/RepoCard';

// Mock data for demonstration
const mockRepos = [
  {
    id: 1,
    name: 'awesome-project',
    full_name: 'user/awesome-project',
    description: 'A full-stack web application built with React and Node.js featuring real-time collaboration.',
    language: 'JavaScript',
    stargazers_count: 128,
    forks_count: 24,
    visibility: 'public',
    updated_at: '2024-01-20T10:30:00Z',
  },
  {
    id: 2,
    name: 'machine-learning-toolkit',
    full_name: 'user/machine-learning-toolkit',
    description: 'A comprehensive toolkit for machine learning experiments with PyTorch and TensorFlow integration.',
    language: 'Python',
    stargazers_count: 256,
    forks_count: 48,
    visibility: 'public',
    updated_at: '2024-01-18T15:45:00Z',
  },
  {
    id: 3,
    name: 'rust-cli-tools',
    full_name: 'user/rust-cli-tools',
    description: 'High-performance command-line utilities written in Rust for system administration.',
    language: 'Rust',
    stargazers_count: 89,
    forks_count: 12,
    visibility: 'public',
    updated_at: '2024-01-15T08:20:00Z',
  },
  {
    id: 4,
    name: 'design-system',
    full_name: 'user/design-system',
    description: 'A modern design system with reusable components for React applications.',
    language: 'TypeScript',
    stargazers_count: 342,
    forks_count: 67,
    visibility: 'public',
    updated_at: '2024-01-22T12:00:00Z',
  },
];

function Dashboard() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [repos] = useState(mockRepos);

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
              {repos.reduce((acc, repo) => acc + repo.stargazers_count, 0)}
            </div>
            <div className="stat-label">Total Stars</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">READMEs Generated</div>
          </div>
        </div>

        {filteredRepos.length > 0 ? (
          <div className="repos-grid">
            {filteredRepos.map(repo => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        ) : (
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
