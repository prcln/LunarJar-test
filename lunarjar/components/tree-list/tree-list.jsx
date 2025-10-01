import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase.js';
import { collection, addDoc, getDocs, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { useNavigate } from 'react-router-dom';

import '../wish-render/wish-render.css';

const TreeList = ({ userId, isPublic=false }) => {
  const navigate = useNavigate();
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedTrees, setDisplayedTrees] = useState([]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchUserTrees();
  }, [userId]);

  useEffect(() => {
    let filtered = trees;
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(tree => 
        tree.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setDisplayedTrees(filtered);
  }, [searchTerm, trees]);
  // Debug
  console.log(userId);

  const fetchUserTrees = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading trees from Firebase...');

      let q;
      
      if (isPublic) {
        q = query(
          collection(db, 'trees'),
          where('isPublic', '==', true),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(
          collection(db, 'trees'), 
          where('ownerId', '==', userId),
          orderBy("createdAt", "desc")
        );
      }

      const querySnapshot = await getDocs(q);
      
      const userTrees = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userTrees.push({
          id: doc.id,
          ...data,
          wishCount: data.wishCount || 0
        });
      });
      console.log(`✅ Loaded ${userTrees.length} trees from Firebase`);

      setTrees(userTrees);
      setDisplayedTrees(userTrees);
      setLoading(false);
      
    } catch (err) {
      setError('Failed to load trees. Please try again.');
      console.error('Error fetching trees:', err);
      setLoading(false);
    }
  };

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleTreeClick = (tree) => {
    console.log('Selected tree:', tree);
    navigate(`/me/tree/${tree}`);
  };

  const handleCreateTree = () => {
    console.log('Create new tree');
    // Navigate to create tree page
    navigate('/create');
  };


  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleDateString();
    }
    
    return 'Unknown date';
  };

  if (loading) {
    return (
      <div className="wishes-container">
        <div className="loading-wishes">
          Loading your trees... 🌳
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishes-container">
        <div className="no-wishes">
          {error}
        </div>
        <button
          onClick={fetchUserTrees}
          className="load-more-btn"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="wishes-container">
      <div className="wishes-title">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
        </svg>
        My Wish Trees
      </div>
      
      <div className="wishes-stats">
        <div className="stat-item">
          <strong>{trees.length}</strong> Total Trees
        </div>
        <div className="stat-item">
          <strong>{trees.reduce((sum, tree) => sum + tree.wishCount, 0)}</strong> Total Wishes
        </div>
      </div>

      <div className="filter-controls" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search trees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', flex: 1 }}
        />
        <button
          onClick={handleCreateTree}
          style={{ 
            padding: '8px 16px', 
            borderRadius: '4px', 
            border: 'none',
            background: '#10b981',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Create New Tree
        </button>
      </div>

      <div className="accordion-container">
        {displayedTrees.length === 0 ? (
          <div className="no-wishes">
            {searchTerm 
              ? 'No trees found matching your search. 🔍'
              : 'No trees yet. Create your first wish tree! 🌟'
            }
          </div>
        ) : (
          <>
            {displayedTrees.map((tree, index) => {
              const isExpanded = expandedIndex === index;

              return (
                <div key={tree.id} className="accordion-item">
                  <div 
                    className={`accordion-header ${isExpanded ? 'active' : ''}`}
                    onClick={() => toggleAccordion(index)}
                  >
                    <div className="accordion-title">
                      <span className="category-badge category-dreams">
                        {tree.wishCount} {tree.wishCount === 1 ? 'wish' : 'wishes'}
                      </span>
                      <span>{tree.name}</span>
                    </div>
                    <svg 
                      className={`accordion-icon ${isExpanded ? 'expanded' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                  
                  <div className={`accordion-content ${isExpanded ? 'expanded' : ''}`}>
                    <div className="wish-content">
                      Tree ID: {tree.id}
                    </div>
                    <div className="wish-meta">
                      <span className="wish-date">Created {formatDate(tree.createdAt)}</span>
                      <button
                        onClick={() => handleTreeClick(tree.slug)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          background: '#10b981',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        View Tree
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default TreeList;