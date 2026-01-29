import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser, useAuth, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import MarkdownPreview from '../components/MarkdownPreview';
import { generateReadme, getGeneration, importRepo, fetchRepos, fetchRepoByIdentifier, getApiBaseUrl } from '../services/api';

const templates = [
  { 
    id: 'minimalist', 
    name: 'Minimalist', 
    description: 'Clean and simple - only essential info',
    icon: '📄'
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    description: 'Detailed and complete documentation',
    icon: '💼'
  },
  { 
    id: 'portfolio', 
    name: 'Portfolio', 
    description: 'Showcase-ready with visual appeal',
    icon: '🚀'
  },
];

function Generator() {
  const { repoId, owner, repo } = useParams();
  const identifier = owner && repo ? `${owner}/${repo}` : repoId;
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [repoInfo, setRepoInfo] = useState(null);
  const [dbRepoId, setDbRepoId] = useState(null); // DB UUID when repo loaded via fetch endpoint
  const [generationStatus, setGenerationStatus] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const loadRepoInfoRef = useRef(null);

  // Fetch repo info on mount: try list first, then fetch by id or owner/repo
  useEffect(() => {
    async function loadRepoInfo() {
      if (!isSignedIn || !identifier) return;
      setRepoInfo(null);
      setDbRepoId(null);
      setLoadError(null);

      try {
        const token = await getToken();
        try {
          const repos = await fetchRepos(token);
          const match = repos.find(
            (r) =>
              String(r.id) === String(identifier) ||
              (r.full_name && r.full_name === identifier)
          );
          if (match) {
            setRepoInfo(match);
            return;
          }
        } catch (e) {
          console.warn('fetchRepos failed, trying fetch-by-identifier:', e);
        }

        const fetched = await fetchRepoByIdentifier(token, identifier);
        const repoName = fetched.full_name?.split("/").pop() || fetched.name || identifier;
        setRepoInfo({
          full_name: fetched.full_name || identifier,
          name: repoName,
          description: null,
          id: fetched.id,
        });
        setDbRepoId(fetched.id);      } catch (err) {
        console.error('Failed to load repo info:', err);
        const msg = err.message || 'Could not load repository from GitHub';
        const isNetwork = /failed to fetch|networkerror|load failed/i.test(msg);
        setLoadError(
          isNetwork
            ? 'Cannot reach the API. Start the backend (e.g. `python run.py` in /backend) and ensure it runs on port 8000.'
            : msg
        );
      }
    }

    loadRepoInfoRef.current = loadRepoInfo;
    if (isLoaded && isSignedIn) {
      loadRepoInfo();
    }
  }, [isLoaded, isSignedIn, identifier, getToken]);

  const retryLoad = () => {
    setLoadError(null);
    setError(null);
    loadRepoInfoRef.current?.();
  };

  if (!isLoaded) {
    return (
      <div className="generator">
        <Navbar />
        <div className="container">
          <div className="loading-state">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationStatus('Starting generation...');
    setContent('');

    try {
      const token = await getToken();
      console.log('Token obtained:', token ? 'Yes' : 'No');
      
      let idForGenerate = dbRepoId;

      if (!idForGenerate) {
        setGenerationStatus('Importing repository...');
        if (repoInfo && repoInfo.full_name) {
          const importData = {
            id: repoInfo.id,
            name: repoInfo.name,
            full_name: repoInfo.full_name,
            description: repoInfo.description || '',
            language: repoInfo.language || 'Unknown',
            stargazers_count: repoInfo.stargazers_count ?? 0,
            forks_count: repoInfo.forks_count ?? 0,
            visibility: repoInfo.visibility || 'public',
            default_branch: repoInfo.default_branch || 'main',
            updated_at: repoInfo.updated_at || new Date().toISOString(),
          };
          const importedRepo = await importRepo(token, importData);
          idForGenerate = importedRepo.id;
        } else {
          throw new Error(
            'Could not load repository. Please open it from the Dashboard or check your GitHub connection.'
          );
        }
      }

      setGenerationStatus('Generating README with AI...');
      const response = await generateReadme(token, idForGenerate, selectedTemplate);
      console.log('Generation response:', response);
      
      if (response.status === 'pending') {
        // Poll for completion
        setGenerationStatus('AI is writing your README...');
        let attempts = 0;
        const maxAttempts = 60; // 60 seconds max
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const generation = await getGeneration(token, response.generation_id);
          console.log('Generation status:', generation.status);
          
          if (generation.status === 'completed') {
            setContent(generation.content);
            setGenerationStatus(null);
            break;
          } else if (generation.status === 'failed') {
            throw new Error('Generation failed. Please try again.');
          }
          
          attempts++;
          setGenerationStatus(`AI is writing your README... (${attempts}s)`);
        }
        
        if (attempts >= maxAttempts) {
          throw new Error('Generation timed out. Please try again.');
        }
      } else if (response.content) {
        // Synchronous response with content
        setContent(response.content);
        setGenerationStatus(null);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      console.error('Generation error:', err);
      const msg = err.message || 'Failed to generate README';
      const isNetwork = /failed to fetch|networkerror|load failed/i.test(msg);
      setError(
        isNetwork
          ? 'Cannot reach the API. Start the backend (e.g. `python run.py` in /backend) and ensure it runs on port 8000.'
          : msg
      );
      setGenerationStatus(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert('README copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="generator">
      <Navbar />
      
      <div className="container">
        <div className="generator-header">
          <Link to="/dashboard" className="btn btn-ghost" style={{ marginBottom: 'var(--space-4)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="generator-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            README Generator
          </h1>
          <p className="generator-subtitle">
            {repoInfo ? (
              <>
                <strong>{repoInfo.full_name}</strong>
                {repoInfo.description && <span> - {repoInfo.description}</span>}
              </>
            ) : (
              `Repository: ${identifier || '…'}`
            )}
          </p>
        </div>

        {/* Template Selector */}
        <div className="template-selector">
          {templates.map(template => (
            <div
              key={template.id}
              className={`template-option ${selectedTemplate === template.id ? 'active' : ''}`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="template-option-icon">{template.icon}</div>
              <div className="template-option-title">{template.name}</div>
              <div className="template-option-desc">{template.description}</div>
            </div>
          ))}
        </div>

        {/* Load Error (could not fetch repo from GitHub) */}
        {loadError && (
          <div className="card" style={{ 
            borderColor: 'var(--error)', 
            background: 'rgba(239, 68, 68, 0.1)',
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-4)'
          }}>
            <p style={{ color: 'var(--error)', margin: 0 }}>❌ {loadError}</p>
            <p style={{ color: 'var(--text-muted)', margin: 'var(--space-2) 0 0', fontSize: '0.9rem' }}>
              Make sure the repo exists, you have access to it, and GitHub is connected in your account.
            </p>
            <button type="button" className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }} onClick={retryLoad}>
              Retry loading repository
            </button>
          </div>
        )}

        {/* Generation Error */}
        {error && (
          <div className="card" style={{ 
            borderColor: 'var(--error)', 
            background: 'rgba(239, 68, 68, 0.1)',
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-4)'
          }}>
            <p style={{ color: 'var(--error)', margin: 0 }}>❌ {error}</p>
          </div>
        )}

        {/* Generate Button */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleGenerate}
            disabled={isGenerating || !!loadError || (!repoInfo && !dbRepoId)}
            style={{ width: '100%', padding: 'var(--space-4)' }}
          >
            {isGenerating ? (
              <>
                <span className="animate-pulse">{generationStatus || 'Generating...'}</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Generate {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} README
              </>
            )}
          </button>
        </div>

        {/* Editor Layout */}
        <div className="generator-layout">
          <div className="generator-panel">
            <div className="panel-header">
              <span className="panel-title">📝 Editor</span>
              <button className="btn btn-ghost" onClick={handleCopy} disabled={!content}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </button>
            </div>
            <div className="panel-content">
              <textarea
                className="editor-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isGenerating ? generationStatus : "Click 'Generate' to create your README..."}
              />
            </div>
          </div>

          <div className="generator-panel">
            <div className="panel-header">
              <span className="panel-title">👁️ Preview</span>
            </div>
            <div className="panel-content" style={{ padding: 0, overflow: 'auto' }}>
              {content ? (
                <MarkdownPreview content={content} />
              ) : (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {isGenerating ? generationStatus : 'Preview will appear here'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="generator-actions">
          <button className="btn btn-secondary" onClick={handleDownload} disabled={!content}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download README.md
          </button>
          <button className="btn btn-primary" disabled={!content}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            Commit to GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

export default Generator;
