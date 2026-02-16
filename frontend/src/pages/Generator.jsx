import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser, useAuth, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import MarkdownPreview from '../components/MarkdownPreview';
import SmartRefineModal from '../components/SmartRefineModal';
import BadgeSelector from '../components/BadgeSelector';
import ScreenshotBeautifier from '../components/ScreenshotBeautifier';
import { generateReadme, getGeneration, importRepo, fetchRepos, fetchRepoByIdentifier, refineText, detectBadges, auditReadme } from '../services/api';

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
  const [currentGenerationId, setCurrentGenerationId] = useState(null);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [loadError, setLoadError] = useState(null);
  
  // Smart Refine State
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refinePosition, setRefinePosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');

  const textareaRef = useRef(null);

  // Auto-Badge State
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [detectedBadges, setDetectedBadges] = useState([]);
  const [isDetectingBadges, setIsDetectingBadges] = useState(false);

  // Vibe Check State
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

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
      
      if (response.generation_id) {
        setCurrentGenerationId(response.generation_id);
      }
      
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





  const handleTextSelect = (e) => {
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const selected = textarea.value.substring(start, end);
      // Only show for substantial selection
      if (selected.length > 5) {
        // Calculate position (approximation)
        // Get textarea coordinates
        const rect = textarea.getBoundingClientRect();
        
        // Simple positioning: near the mouse would be better, but we don't have the event here 
        // cleanly if triggered by keyboard. Let's position centered above textarea for now, 
        // or try to use the mouseup event which matches better.
        setSelectedText(selected);
      }
    }
  };

  const handleMouseUp = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const selected = textarea.value.substring(start, end);
      if (selected.length > 5) {
        setSelectedText(selected);
        // Position modal near the mouse release
        setRefinePosition({
          top: e.clientY - 80, // Position above cursor
          left: e.clientX - 150 // Center horizontally relative to cursor
        });
        setShowRefineModal(true);
      }
    } else {
      setShowRefineModal(false);
    }
  };
  
  const handleRefine = async (instruction) => {
    try {
      const token = await getToken();
      const response = await refineText(token, selectedText, instruction);
      
      if (response.refined_text && textareaRef.current) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        const newContent = 
          content.substring(0, start) + 
          response.refined_text + 
          content.substring(end);
          
        setContent(newContent);
        // Close modal handled by component on submit
      }
    } catch (err) {
      console.error("Refine error:", err);
      alert("Failed to refine text: " + err.message);
    }
  };

  const handleDetectBadges = async () => {
    setIsDetectingBadges(true);
    try {
      const token = await getToken();
      
      let idForBadge = dbRepoId;
      
      // Lazy import if not already in DB
      if (!idForBadge) {
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
              idForBadge = importedRepo.id;
              setDbRepoId(idForBadge); // Update state for future use
        } else {
             throw new Error("Repository info not loaded. Cannot detect badges.");
        }
      }

      const badges = await detectBadges(token, idForBadge);
      setDetectedBadges(badges);
      setShowBadgeModal(true);
    } catch (err) {
      console.error("Badge detection error:", err);
      alert("Failed to detect badges: " + err.message);
    } finally {
      setIsDetectingBadges(false);
    }
  };

  const handleInsertBadges = (badgesToInsert) => {
    if (badgesToInsert.length === 0) return;
    
    const badgeMarkdown = badgesToInsert.map(b => b.markdown).join(' ');
    
    // Insert at the top of the file, after title if exists, or just at very top
    // For simplicity, let's prepend to the top with a newline
    const newContent = badgeMarkdown + '\n\n' + content;
    setContent(newContent);
  };

  const handleAudit = async () => {
    if (!content) return;
    setIsAuditing(true);
    setAuditResult(null);
    try {
      const token = await getToken();
      const result = await auditReadme(token, content);
      setAuditResult(result);
    } catch (err) {
      console.error("Audit error:", err);
      alert("Failed to audit README: " + err.message);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="generator">
      <Navbar />
      
      {showRefineModal && (
        <SmartRefineModal 
          isOpen={showRefineModal}
          onClose={() => setShowRefineModal(false)}
          onRefine={handleRefine}
          position={refinePosition}
        />
      )}

      {showBadgeModal && (
        <BadgeSelector
          isOpen={showBadgeModal}
          onClose={() => setShowBadgeModal(false)}
          badges={detectedBadges}
          onInsert={handleInsertBadges}
        />
      )}

      {showScreenshotModal && (
        <ScreenshotBeautifier
          isOpen={showScreenshotModal}
          onClose={() => setShowScreenshotModal(false)}
        />
      )}
      
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
              <button 
                className="btn btn-ghost" 
                onClick={handleDetectBadges} 
                disabled={isDetectingBadges || (!repoInfo && !dbRepoId)}
                title="Auto-detect and insert tech stack badges"
              >
                {isDetectingBadges ? 'Scanning...' : '🛡️ Add Badges'}
              </button>
              <button 
                  className="btn btn-ghost" 
                  onClick={() => setShowScreenshotModal(true)}
                  title="Create beautiful screenshots"
              >
                🖼️ Beautify Screen
              </button>
            </div>
            <div className="panel-content">
              <textarea
                ref={textareaRef}
                className="editor-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onMouseUp={handleMouseUp}
                placeholder={isGenerating ? generationStatus : "Click 'Generate' to create your README..."}
              />
            </div>
            
            {/* Context/Audit Panel */}
            <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem' }}>🔍 Vibe Check</h4>
                <button className="btn btn-sm btn-secondary" onClick={handleAudit} disabled={isAuditing || !content}>
                  {isAuditing ? 'Checking...' : 'Check Score'}
                </button>
              </div>
              
              {auditResult && (
                <div className="animate-in fade-in slide-in-from-bottom-2" style={{ marginTop: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold', 
                      color: auditResult.grade.startsWith('A') ? 'var(--success)' : 
                             auditResult.grade.startsWith('B') ? 'var(--accent-primary)' : 
                             'var(--warning)'
                    }}>
                      {auditResult.grade} 
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Score: {auditResult.score}/100
                    </div>
                  </div>
                  
                  {auditResult.suggestions.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {auditResult.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--success)' }}>
                      Perfect vibe! Your README rocks. 🚀
                    </p>
                  )}
                </div>
              )}
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

        </div>
      </div>
    </div>
  );
}

export default Generator;
