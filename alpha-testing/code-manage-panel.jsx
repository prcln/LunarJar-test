import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { Search, Filter, Plus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import './code-manage-panel.css';

// --- Helper Components ---

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <div>Loading codes...</div>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="error-message">
      <strong>Error:</strong> {message}
    </div>
  );
}

function CodeTableRow({ code }) {
  const usedAtDate = code.usedAt?.seconds 
    ? new Date(code.usedAt.seconds * 1000).toLocaleString() 
    : '-';

  return (
    <tr>
      <td>
        <span className="code-cell">{code.code}</span>
      </td>
      <td>
        <span className={`status-badge ${code.used ? 'used' : 'available'}`}>
          {code.used ? 'Used' : 'Available'}
        </span>
      </td>
      <td>{code.usedBy || '-'}</td>
      <td>{usedAtDate}</td>
    </tr>
  );
}

function AddCodeModal({ isOpen, onClose, onAdd }) {
  const [numberOfCodes, setNumberOfCodes] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase() + 
           Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const codes = [];
      for (let i = 0; i < numberOfCodes; i++) {
        codes.push({
          code: generateCode(),
          used: false,
          usedBy: null,
          usedAt: null,
          createdAt: serverTimestamp()
        });
      }
      
      await onAdd(codes);
      setNumberOfCodes(1);
      onClose();
    } catch (error) {
      console.error('Error generating codes:', error);
      alert('Failed to generate codes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Generate New Invite Codes</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="numberOfCodes">Number of codes to generate:</label>
            <input
              id="numberOfCodes"
              type="number"
              min="1"
              max="100"
              value={numberOfCodes}
              onChange={(e) => setNumberOfCodes(parseInt(e.target.value) || 1)}
              className="form-input"
              disabled={isGenerating}
            />
          </div>
          <div className="modal-actions">
            <button 
              type="button" 
              className="modal-btn cancel" 
              onClick={onClose}
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-btn submit"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : `Generate ${numberOfCodes} Code${numberOfCodes > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Component ---

export function AdminInviteCodes() {
  const [codes, setCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ITEMS_PER_PAGE = 8;

  const loadCodes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const codesCollection = collection(db, 'inviteCodes');
      const q = query(codesCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setCodes([]);
      } else {
        const codesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCodes(codesData);
      }
    } catch (err) {
      console.error("Failed to fetch invite codes:", err);
      setError("Could not load invite codes. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const handleAddCodes = async (newCodes) => {
    try {
      const codesCollection = collection(db, 'inviteCodes');
      
      for (const code of newCodes) {
        await addDoc(codesCollection, code);
      }
      
      await loadCodes();
      alert(`Successfully generated ${newCodes.length} code${newCodes.length > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Error adding codes:', error);
      throw error;
    }
  };

  // Filter and search logic
  const filteredCodes = codes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (code.usedBy && code.usedBy.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'available' && !code.used) ||
                         (filterStatus === 'used' && code.used);
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCodes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCodes = filteredCodes.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Statistics
  const stats = {
    total: codes.length,
    available: codes.filter(c => !c.used).length,
    used: codes.filter(c => c.used).length
  };

  if (isLoading) {
    return (
      <div className="admin-wrapper">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-wrapper">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
      <div className="admin-container">
        <div className="header">
          <h2>Invite Codes Manager</h2>
          <div className="header-actions">
            <button className="action-btn secondary" onClick={loadCodes}>
              <RefreshCw size={18} />
              Refresh
            </button>
            <button className="action-btn" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              Add Codes
            </button>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-label">Total Codes</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card available">
            <div className="stat-label">Available</div>
            <div className="stat-value">{stats.available}</div>
          </div>
          <div className="stat-card used">
            <div className="stat-label">Used</div>
            <div className="stat-value">{stats.used}</div>
          </div>
        </div>

        <div className="controls">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by code or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <button
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              <Filter size={18} />
              All
            </button>
            <button
              className={`filter-btn ${filterStatus === 'available' ? 'active' : ''}`}
              onClick={() => setFilterStatus('available')}
            >
              Available
            </button>
            <button
              className={`filter-btn ${filterStatus === 'used' ? 'active' : ''}`}
              onClick={() => setFilterStatus('used')}
            >
              Used
            </button>
          </div>
        </div>

        {filteredCodes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No invite codes found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Used By</th>
                    <th>Used At</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCodes.map(code => (
                    <CodeTableRow key={code.id} code={code} />
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                
                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                  <span className="pagination-count">
                    ({startIndex + 1}-{Math.min(endIndex, filteredCodes.length)} of {filteredCodes.length})
                  </span>
                </div>

                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        <AddCodeModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddCodes}
        />
      </div>
  );
}