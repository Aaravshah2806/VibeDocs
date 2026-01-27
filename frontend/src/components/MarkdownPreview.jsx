import ReactMarkdown from 'react-markdown';

function MarkdownPreview({ content }) {
  return (
    <div className="markdown-preview">
      {content ? (
        <ReactMarkdown>{content}</ReactMarkdown>
      ) : (
        <div className="empty-state" style={{ padding: '2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Your README preview will appear here...
          </p>
        </div>
      )}
    </div>
  );
}

export default MarkdownPreview;
