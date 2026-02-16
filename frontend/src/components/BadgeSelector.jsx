import { useState, useEffect } from 'react';

function BadgeSelector({ isOpen, onClose, badges, onInsert }) {
  const [selected, setSelected] = useState(new Set());

  // Select all by default when badges change
  useEffect(() => {
    if (badges && badges.length > 0) {
      setSelected(new Set(badges.map(b => b.id)));
    }
  }, [badges]);

  if (!isOpen) return null;

  const toggleBadge = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleInsert = () => {
    const badgesToInsert = badges.filter(b => selected.has(b.id));
    onInsert(badgesToInsert);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="card modal-content" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ margin: 0 }}>🛡️ Detected Tech Stack</h3>
          <button className="btn-ghost" onClick={onClose}>&times;</button>
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          We found these technologies in your repository. Select the ones you want to display.
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
          gap: 'var(--space-3)', 
          overflowY: 'auto',
          padding: 'var(--space-2)',
          flex: 1
        }}>
          {badges.map(badge => (
            <div 
              key={badge.id}
              onClick={() => toggleBadge(badge.id)}
              style={{
                border: `1px solid ${selected.has(badge.id) ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                borderRadius: '8px',
                padding: 'var(--space-3)',
                cursor: 'pointer',
                background: selected.has(badge.id) ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <img src={badge.url} alt={badge.label} style={{ height: '20px' }} />
              <span style={{ fontSize: '0.8rem', color: selected.has(badge.id) ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                {badge.label}
              </span>
            </div>
          ))}
          {badges.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-4)' }}>
              No badges detected automatically.
            </div>
          )}
        </div>

        <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleInsert} disabled={selected.size === 0}>
            Insert {selected.size} Badges
          </button>
        </div>
      </div>
    </div>
  );
}

export default BadgeSelector;
