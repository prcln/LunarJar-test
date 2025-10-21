import React, { useState, useRef } from 'react';
import { Copy, Check, Trash2, Download } from 'lucide-react';

const DecorationPositionFinder = () => {
  const [positions, setPositions] = useState([]);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);
  const [imageUrl, setImageUrl] = useState('');
  const [decorationType, setDecorationType] = useState('lantern');

  const handleClick = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPositions([...positions, { 
      x: parseFloat(x.toFixed(1)), 
      y: parseFloat(y.toFixed(1)),
      type: decorationType,
      id: Date.now()
    }]);
  };

  const removePosition = (id) => {
    setPositions(positions.filter(p => p.id !== id));
  };

  const clearAll = () => {
    setPositions([]);
  };

  const generateCode = () => {
    return `const decorationPositions = [
${positions.map(p => `  { x: ${p.x}, y: ${p.y}, type: '${p.type}' },`).join('\n')}
];`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJSON = () => {
    const data = JSON.stringify(positions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decoration-positions.json';
    a.click();
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#8B0000', 
          marginBottom: '10px',
          fontSize: '32px'
        }}>
          🌸 Decoration Position Finder 🌸
        </h1>
        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          marginBottom: '30px',
          fontSize: '16px'
        }}>
          Click on the tree to place decorations and get their coordinates
        </p>

        {/* Controls */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Tree Image URL:
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste your tree.svg URL or use file upload"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Decoration Type:
              </label>
              <select
                value={decorationType}
                onChange={(e) => setDecorationType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="lantern">🏮 Lantern</option>
                <option value="envelope">🧧 Red Envelope</option>
                <option value="blossom">🌸 Blossom</option>
              </select>
            </div>

            <button
              onClick={clearAll}
              style={{
                padding: '10px 20px',
                background: '#DC143C',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold'
              }}
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Tree Canvas */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '15px', color: '#333' }}>Click to Place Decorations</h2>
            <div
              ref={containerRef}
              onClick={handleClick}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                background: imageUrl 
                  ? `url(${imageUrl}) center/contain no-repeat`
                  : 'repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 20px 20px',
                border: '3px solid #8B0000',
                borderRadius: '8px',
                cursor: 'crosshair',
                overflow: 'hidden'
              }}
            >
              {/* Show placed decorations */}
              {positions.map((pos) => (
                <div
                  key={pos.id}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removePosition(pos.id);
                  }}
                  title="Click to remove"
                >
                  {pos.type === 'lantern' && <span style={{ fontSize: '24px' }}>🏮</span>}
                  {pos.type === 'envelope' && <span style={{ fontSize: '24px' }}>🧧</span>}
                  {pos.type === 'blossom' && <span style={{ fontSize: '24px' }}>🌸</span>}
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    marginTop: '4px'
                  }}>
                    {pos.x}, {pos.y}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ 
              marginTop: '10px', 
              fontSize: '12px', 
              color: '#666',
              textAlign: 'center'
            }}>
              {positions.length} decorations placed • Click decoration to remove
            </p>
          </div>

          {/* Code Output */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h2 style={{ margin: 0, color: '#333' }}>Generated Code</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={copyCode}
                  style={{
                    padding: '8px 16px',
                    background: copied ? '#28a745' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={downloadJSON}
                  style={{
                    padding: '8px 16px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  <Download size={14} />
                  JSON
                </button>
              </div>
            </div>

            <pre style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '15px',
              borderRadius: '6px',
              overflow: 'auto',
              maxHeight: '500px',
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              {positions.length > 0 ? generateCode() : '// Click on the tree to place decorations\n// Positions will appear here'}
            </pre>

            {/* Position List */}
            {positions.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ color: '#333', marginBottom: '10px' }}>Position List:</h3>
                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {positions.map((pos, index) => (
                    <div
                      key={pos.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: index % 2 === 0 ? '#f8f9fa' : 'white',
                        borderRadius: '4px',
                        marginBottom: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <span>
                        #{index + 1}: {pos.type === 'lantern' ? '🏮' : pos.type === 'envelope' ? '🧧' : '🌸'} 
                        <code style={{ 
                          marginLeft: '8px',
                          background: '#e9ecef',
                          padding: '2px 6px',
                          borderRadius: '3px'
                        }}>
                          x: {pos.x}%, y: {pos.y}%
                        </code>
                      </span>
                      <button
                        onClick={() => removePosition(pos.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc3545',
                          cursor: 'pointer',
                          fontSize: '18px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#856404', marginTop: 0 }}>📝 How to Use:</h3>
          <ol style={{ color: '#856404', lineHeight: '1.8', marginBottom: 0 }}>
            <li>Paste your tree SVG URL in the input field above, or upload your tree.svg to your project and use the path</li>
            <li>Select the decoration type you want to place (Lantern, Red Envelope, or Blossom)</li>
            <li>Click on the tree where you want to place decorations</li>
            <li>The coordinates will appear as percentages (responsive!)</li>
            <li>Click on a placed decoration to remove it</li>
            <li>Copy the generated code and paste it into your <code>decorationPositions</code> array</li>
            <li>Or download as JSON for later use</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DecorationPositionFinder;