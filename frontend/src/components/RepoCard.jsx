import { Link } from 'react-router-dom';

// Language colors for GitHub-like display
const languageColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
};

function RepoCard({ repo }) {
  const {
    id,
    name,
    full_name,
    description,
    language,
    stargazers_count,
    forks_count,
    visibility,
  } = repo;

  const languageColor = languageColors[language] || '#8b8b8b';

  return (
    <div className="tilt-card-container noselect">
      <div className="tilt-card-canvas">
        {/* 5x5 tracker grid for 3D tilt effect */}
        {[...Array(25)].map((_, i) => (
          <div key={i} className={`tracker tr-${i + 1}`} />
        ))}
        
        <div className="tilt-card-inner">
          {/* Default view - Repo name (visible when not hovering) */}
          <p className="tilt-card-prompt">{name}</p>
          
          {/* Hover view - Full details */}
          <div className="tilt-card-details">
            <h3 className="tilt-card-title">{name}</h3>
            <p className="tilt-card-desc">
              {description || 'No description available'}
            </p>
            
            <div className="tilt-card-meta">
              {language && (
                <span className="tilt-card-stat">
                  <span className="language-dot" style={{ backgroundColor: languageColor }} />
                  {language}
                </span>
              )}
              <span className="tilt-card-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {stargazers_count}
              </span>
              <span className="tilt-card-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <circle cx="12" cy="18" r="3" />
                  <circle cx="6" cy="6" r="3" />
                  <circle cx="18" cy="6" r="3" />
                  <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" />
                  <path d="M12 12v3" />
                </svg>
                {forks_count}
              </span>
            </div>
          </div>
          
          {/* Visibility badge */}
          <span className="tilt-card-badge">{visibility}</span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="tilt-card-actions">
        <Link to={`/generator/${id}`} className="btn btn-primary btn-sm">
          Generate Docs
        </Link>
        <a 
          href={`https://github.com/${full_name}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
        >
          View Repo
        </a>
      </div>
    </div>
  );
}

export default RepoCard;
