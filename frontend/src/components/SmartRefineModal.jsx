import { useState, useEffect, useRef } from 'react';

function SmartRefineModal({ isOpen, onClose, onRefine, position }) {
  const [instruction, setInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!instruction.trim()) return;

    setIsRefining(true);
    await onRefine(instruction);
    setIsRefining(false);
    setInstruction('');
    onClose();
  };

  const style = {
    position: 'absolute',
    top: position.top + window.scrollY + 10,
    left: position.left + window.scrollX,
    zIndex: 1000,
    width: '300px',
  };

  return (
    <div className="card refine-modal" style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent-primary)' }}>✨ Smart Refine</h4>
        <button onClick={onClose} className="btn-ghost" style={{ padding: '0 4px' }}>&times;</button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="input"
          placeholder="Make it funnier, fix grammar..."
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          disabled={isRefining}
          style={{ width: '100%', marginBottom: '8px' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isRefining} style={{ flex: 1 }}>
                {isRefining ? 'Refining...' : 'Refine'}
            </button>
        </div>
      </form>
    </div>
  );
}

export default SmartRefineModal;
