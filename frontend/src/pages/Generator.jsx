import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import MarkdownPreview from '../components/MarkdownPreview';

const templates = [
  { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple' },
  { id: 'professional', name: 'Professional', description: 'Detailed and complete' },
  { id: 'portfolio', name: 'Portfolio', description: 'Showcase-ready' },
];

const sampleReadme = `# 🚀 Awesome Project

A full-stack web application built with React and Node.js featuring real-time collaboration.

## ✨ Features

- 🔐 Secure authentication with JWT
- 📊 Real-time data synchronization
- 🎨 Modern, responsive UI design
- ⚡ Lightning-fast performance

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| Frontend | React, CSS3, Vite |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT, OAuth 2.0 |

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/user/awesome-project.git

# Navigate to the project directory
cd awesome-project

# Install dependencies
npm install

# Start the development server
npm run dev
\`\`\`

## 🚀 Usage

1. Open your browser and navigate to \`http://localhost:5173\`
2. Create an account or sign in
3. Start collaborating!

## 📄 License

This project is licensed under the MIT License.

---

Made with ❤️ by [Your Name](https://github.com/username)
`;

function Generator() {
  const { repoId } = useParams();
  const { isSignedIn, isLoaded } = useUser();
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [content, setContent] = useState(sampleReadme);
  const [isGenerating, setIsGenerating] = useState(false);

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
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setContent(sampleReadme);
    setIsGenerating(false);
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
          <p className="generator-subtitle">Repository ID: {repoId}</p>
        </div>

        {/* Template Selector */}
        <div className="template-selector">
          {templates.map(template => (
            <div
              key={template.id}
              className={`template-option ${selectedTemplate === template.id ? 'active' : ''}`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="template-option-title">{template.name}</div>
              <div className="template-option-desc">{template.description}</div>
            </div>
          ))}
        </div>

        {/* Generate Button */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ width: '100%', padding: 'var(--space-4)' }}
          >
            {isGenerating ? (
              <>
                <span className="animate-pulse">Generating...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Generate README with AI
              </>
            )}
          </button>
        </div>

        {/* Editor Layout */}
        <div className="generator-layout">
          <div className="generator-panel">
            <div className="panel-header">
              <span className="panel-title">📝 Editor</span>
              <button className="btn btn-ghost" onClick={handleCopy}>
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
                placeholder="Your README content will appear here..."
              />
            </div>
          </div>

          <div className="generator-panel">
            <div className="panel-header">
              <span className="panel-title">👁️ Preview</span>
            </div>
            <div className="panel-content" style={{ padding: 0, overflow: 'auto' }}>
              <MarkdownPreview content={content} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="generator-actions">
          <button className="btn btn-secondary" onClick={handleDownload}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download README.md
          </button>
          <button className="btn btn-primary">
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
