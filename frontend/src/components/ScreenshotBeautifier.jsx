import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

function ScreenshotBeautifier({ isOpen, onClose, onInsert }) {
  const [image, setImage] = useState(null);
  const [padding, setPadding] = useState(40);
  const [shadow, setShadow] = useState('medium'); // none, small, medium, large
  const [background, setBackground] = useState('gradient-1'); // gradient-1, gradient-2, solid, transparent
  const [borderRadius, setBorderRadius] = useState(12);
  const exportRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setImage(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType(item.types.find(t => t.startsWith('image/')));
          const reader = new FileReader();
          reader.onload = (e) => setImage(e.target.result);
          reader.readAsDataURL(blob);
          return;
        }
      }
      alert('No image found in clipboard');
    } catch (err) {
      console.error('Paste failed:', err);
      // Fallback for older browsers
      alert('Please use Ctrl+V / Cmd+V to paste an image onto the page.');
    }
  };

  const handleInsert = async () => {
    if (!exportRef.current) return;
    
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: null,
        scale: 2
      });
      
      canvas.toBlob((blob) => {
        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'readme-screenshot.png';
        a.click();
        URL.revokeObjectURL(url);
        
        // Insert markdown
        if (onInsert) {
          onInsert('readme-screenshot.png');
          onClose();
        }
      });
    } catch (err) {
      console.error('Insert failed:', err);
      alert('Failed to process image.');
    }
  };

  const handleExport = async () => {
    if (!exportRef.current) return;
    
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: null,
        scale: 2 // High res
      });
      
      canvas.toBlob((blob) => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]);
        alert('Image copied to clipboard!');
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export image.');
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0, 
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(5px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    },
    modal: {
      background: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      width: '900px',
      maxWidth: '100%',
      height: '80vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },
    header: {
      padding: '1.5rem',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    body: {
      flex: 1,
      display: 'flex',
      overflow: 'hidden'
    },
    sidebar: {
      width: '250px',
      padding: '1.5rem',
      borderRight: '1px solid var(--border-color)',
      overflowY: 'auto',
      background: 'rgba(0,0,0,0.2)'
    },
    previewArea: {
      flex: 1,
      padding: '2rem',
      background: '#1a1b1e', // Dark neutral background for contrast
      backgroundImage: 'radial-gradient(#2a2b2e 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      overflow: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    controlGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.9rem',
      color: 'var(--text-muted)'
    },
    select: {
      width: '100%',
      padding: '8px',
      borderRadius: '6px',
      background: 'var(--bg-input)',
      border: '1px solid var(--border-color)',
      color: 'var(--text-main)'
    },
    exportContainer: {
      transition: 'all 0.3s ease',
      display: 'inline-block' 
    },
    windowFrame: {
      background: '#fff',
      borderRadius: `${borderRadius}px`,
      overflow: 'hidden',
      boxShadow: getShadow(shadow),
      position: 'relative',
      lineHeight: 0 // fixes bottom gap
    },
    windowHeader: {
      height: '30px',
      background: '#f1f1f1',
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      gap: '6px'
    },
    dot: { width: '10px', height: '10px', borderRadius: '50%' },
    bgGradients: {
      'transparent': 'transparent',
      'solid': '#ffffff',
      'gradient-1': 'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)', // Berry
      'gradient-2': 'linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)', // Unicorn
      'gradient-3': 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)', // Ocean
      'gradient-4': 'linear-gradient(135deg, #8EC5FC 0%, #E0C3FC 100%)', // Lavender
    }
  };

  function getShadow(type) {
    if (type === 'none') return 'none';
    if (type === 'small') return '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    if (type === 'medium') return '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    if (type === 'large') return '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    return 'none';
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} onPaste={handlePaste}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>🖼️ Screenshot Beautifier</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => document.getElementById('file-upload').click()}>
              Upload
            </button>
            <input 
              id="file-upload" 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                if(e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = (e) => setImage(e.target.result);
                  reader.readAsDataURL(e.target.files[0]);
                }
              }}
            />
            <button className="btn btn-primary" onClick={handleExport} disabled={!image}>
              Copy to Clipboard
            </button>
            <button className="btn btn-secondary" onClick={handleInsert} disabled={!image}>
              Download & Insert
            </button>
            <button className="btn-ghost" onClick={onClose}>&times;</button>
          </div>
        </div>

        <div style={styles.body}>
           {/* Sidebar Controls */}
           <div style={styles.sidebar}>
             <div style={styles.controlGroup}>
               <label style={styles.label}>Background</label>
               <select style={styles.select} value={background} onChange={e => setBackground(e.target.value)}>
                 <option value="transparent">Transparent</option>
                 <option value="solid">Solid White</option>
                 <option value="gradient-1">Berry Gradient</option>
                 <option value="gradient-2">Unicorn Gradient</option>
                 <option value="gradient-3">Ocean Gradient</option>
                 <option value="gradient-4">Lavender Gradient</option>
               </select>
             </div>

             <div style={styles.controlGroup}>
               <label style={styles.label}>Padding: {padding}px</label>
               <input 
                 type="range" min="0" max="100" 
                 value={padding} onChange={e => setPadding(Number(e.target.value))} 
                 style={{ width: '100%' }}
               />
             </div>

             <div style={styles.controlGroup}>
               <label style={styles.label}>Corner Radius: {borderRadius}px</label>
               <input 
                 type="range" min="0" max="24" 
                 value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))} 
                 style={{ width: '100%' }}
               />
             </div>

             <div style={styles.controlGroup}>
               <label style={styles.label}>Shadow</label>
               <select style={styles.select} value={shadow} onChange={e => setShadow(e.target.value)}>
                 <option value="none">None</option>
                 <option value="small">Small</option>
                 <option value="medium">Medium</option>
                 <option value="large">Large</option>
               </select>
             </div>
             
             <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
               💡 Tip: Paste an image (Ctrl+V) directly anywhere in this window.
             </p>
           </div>

           {/* Preview Area */}
           <div 
             style={styles.previewArea} 
             onDragOver={handleDragOver} 
             onDrop={handleDrop}
           >
             {!image ? (
               <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                 <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                 <p>Drag & Drop an image here<br/>or Paste from Clipboard</p>
               </div>
             ) : (
               <div 
                  ref={exportRef}
                  style={{
                    ...styles.exportContainer,
                    padding: `${padding}px`,
                    background: styles.bgGradients[background] || background
                  }}
               >
                 <div style={styles.windowFrame}>
                   <div style={styles.windowHeader}>
                     <div style={{ ...styles.dot, background: '#FF5F56' }}></div>
                     <div style={{ ...styles.dot, background: '#FFBD2E' }}></div>
                     <div style={{ ...styles.dot, background: '#27C93F' }}></div>
                   </div>
                   <img src={image} alt="Screenshot" style={{ display: 'block', maxWidth: '100%', maxHeight: '60vh' }} />
                 </div>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

export default ScreenshotBeautifier;
