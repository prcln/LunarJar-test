import { db } from '../../firebase.js';
import { collection, addDoc, getDocs, query, where, orderBy, limit, doc, deleteDoc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { useState, useEffect } from 'react';
import { isUserAdmin } from '../../utils/checkAdmin.js';

import './wish-render.css';

export default function WishRender({ currentTreeId='', refreshTrigger = 0, isGlobalRender=false, treeName, currentUserId }) {
  console.log('🎯 WishRender received:', { currentTreeId, refreshTrigger, isGlobalRender, currentUserId });

  const [wishes, setWishes] = useState([]);
  const [displayedWishes, setDisplayedWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [currentLimit, setCurrentLimit] = useState(10);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingWishId, setDeletingWishId] = useState(null);

  const categoryColors = {
    'personal': 'category-personal',
    'career': 'category-career', 
    'relationships': 'category-relationships',
    'health': 'category-health',
    'dreams': 'category-dreams',
    'other': 'category-other'
  };

  const categoryNames = {
    'personal': 'Personal Growth',
    'career': 'Career & Success',
    'relationships': 'Love & Relationships', 
    'health': 'Health & Wellness',
    'dreams': 'Dreams & Aspirations',
    'other': 'Other'
  };

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUserId) {
        console.log('🔍 Checking admin status for:', currentUserId);
        const adminStatus = await isUserAdmin(currentUserId);
        setIsAdmin(adminStatus);
        console.log('👤 Admin status result:', adminStatus);
      } else {
        console.log('⚠️ No currentUserId provided');
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [currentUserId]);

  // Delete wish function
  const handleDeleteWish = async (wishId, treeId) => {
    if (!isAdmin) {
      alert('You do not have permission to delete wishes.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this wish? This action cannot be undone.');
    if (!confirmDelete) return;

    setDeletingWishId(wishId);

    try {
      // Delete the wish document
      await deleteDoc(doc(db, 'wishes', wishId));
      
      // Decrement the wishCount in the tree document
      if (treeId) {
        const treeRef = doc(db, 'trees', treeId);
        await updateDoc(treeRef, {
          wishCount: increment(-1)
        });
      }

      console.log('✅ Wish deleted successfully');
      
      // Remove from local state
      setWishes(prev => prev.filter(w => w.id !== wishId));
      setDisplayedWishes(prev => prev.filter(w => w.id !== wishId));
      
      // Update stats
      await updateStats();
      
    } catch (error) {
      console.error('❌ Error deleting wish:', error);
      alert('Failed to delete wish. Please try again.');
    } finally {
      setDeletingWishId(null);
    }
  };

  // Load wishes from Firebase
  const loadWishes = async () => {
    setLoading(true);
    
    try {
      console.log('📥 Loading wishes from Firebase...');
      console.log('Context:', { isGlobalRender, currentTreeId, currentLimit });

      // Query wishes from Firebase
      let q;
      
      if (isGlobalRender) {
        // Global render: get all wishes, ordered by createdAt
        q = query(
          collection(db, "wishes"),
          orderBy("createdAt", "desc"),
          limit(currentLimit)
        );
      } else {
        // Tree-specific render
        if (!currentTreeId) {
          console.log('⚠️ No currentTreeId provided, skipping load');
          setLoading(false);
          return;
        }
        
        q = query(
          collection(db, "wishes"),
          where("treeId", "==", currentTreeId),
          orderBy("createdAt", "desc"),
          limit(currentLimit)
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const loadedWishes = [];
      querySnapshot.forEach((doc) => {
        loadedWishes.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Loaded ${loadedWishes.length} wishes from Firebase`);
      setWishes(loadedWishes);
      setDisplayedWishes(loadedWishes);
      
      // Update stats
      await updateStats();
      
    } catch (error) {
      console.error('❌ Error loading wishes:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update statistics
  const updateStats = async () => {
    try {
      let totalCount = 0;
      let todayCount = 0;

      if (isGlobalRender) {
        // Get all wishes for global render
        const allWishesSnapshot = await getDocs(collection(db, "wishes"));
        totalCount = allWishesSnapshot.size;

        // Get today's count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();
        
        const todayQuery = query(
          collection(db, "wishes"),
          where("createdAt", ">=", todayISO)
        );
        const todaySnapshot = await getDocs(todayQuery);
        todayCount = todaySnapshot.size;
      } else {
        // Get tree-specific counts
        if (currentTreeId) {
          const treeWishesQuery = query(
            collection(db, "wishes"),
            where("treeId", "==", currentTreeId)
          );
          const treeWishesSnapshot = await getDocs(treeWishesQuery);
          totalCount = treeWishesSnapshot.size;

          // Get today's count for this tree
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayISO = today.toISOString();
          
          const todayQuery = query(
            collection(db, "wishes"),
            where("treeId", "==", currentTreeId),
            where("createdAt", ">=", todayISO)
          );
          const todaySnapshot = await getDocs(todayQuery);
          todayCount = todaySnapshot.size;
        }
      }

      setStats({ total: totalCount, today: todayCount });
      
      console.log('📊 Stats updated:', { total: totalCount, today: todayCount });
      
    } catch (error) {
      console.error('❌ Error updating stats:', error);
    }
  };

  // Load wishes on mount and when refreshTrigger, currentLimit, or currentTreeId changes
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { refreshTrigger, currentLimit, currentTreeId });
    loadWishes();
  }, [refreshTrigger, currentLimit, currentTreeId, isGlobalRender]);

  // Filter wishes by category and search term
  useEffect(() => {
    let filtered = wishes;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(wish => wish.category === filterCategory);
    }
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(wish => 
        wish.wish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wish.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setDisplayedWishes(filtered);
  }, [filterCategory, searchTerm, wishes]);

  // Toggle accordion
  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Load more wishes
  const loadMore = () => {
    setCurrentLimit(prev => prev + 10);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="wishes-container">
      <div className="wishes-title">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
        Wishes from {!treeName ? 'Our Community' : treeName}
      </div>
      
      <div className="wishes-stats">
        <div className="stat-item">
          <strong id="totalWishes">{stats.total}</strong> Total Wishes
        </div>
        <div className="stat-item">
          <strong id="todayWishes">{stats.today}</strong> Today
        </div>
        {isAdmin && (
          <div className="stat-item" style={{ color: '#d97706' }}>
            👑 Admin Mode
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="filter-controls" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="all">All Categories</option>
          <option value="personal">Personal Growth</option>
          <option value="career">Career & Success</option>
          <option value="relationships">Love & Relationships</option>
          <option value="health">Health & Wellness</option>
          <option value="dreams">Dreams & Aspirations</option>
          <option value="other">Other</option>
        </select>
        
        <input
          type="text"
          placeholder="Search wishes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', flex: 1 }}
        />
      </div>

      <div className="accordion-container">
        {loading ? (
          <div className="loading-wishes">
            Loading wishes from the tree... 🌟
          </div>
        ) : displayedWishes.length === 0 ? (
          <div className="no-wishes">
            {searchTerm || filterCategory !== 'all' 
              ? 'No wishes found matching your criteria. 🔍'
              : 'No wishes yet. Be the first to make a wish! 🌟'
            }
          </div>
        ) : (
          <>
            {displayedWishes.map((wish, index) => {
              const categoryClass = categoryColors[wish.category] || 'category-other';
              const categoryName = categoryNames[wish.category] || wish.category;
              const isExpanded = expandedIndex === index;

              return (
                <div key={wish.id} className="accordion-item">
                  <div 
                    className={`accordion-header ${isExpanded ? 'active' : ''}`}
                    onClick={() => toggleAccordion(index)}
                  >
                    <div className="accordion-title">
                      <span className={`category-badge ${categoryClass}`}>
                        {categoryName}
                      </span>
                      <span>By {wish.name || 'Anonymous'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isAdmin && (
                        <button
                          className="delete-wish-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWish(wish.id, wish.treeId);
                          }}
                          disabled={deletingWishId === wish.id}
                          style={{
                            padding: '4px 8px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            opacity: deletingWishId === wish.id ? 0.5 : 1
                          }}
                          title="Delete wish"
                        >
                          {deletingWishId === wish.id ? '...' : '🗑️'}
                        </button>
                      )}
                      <svg 
                        className={`accordion-icon ${isExpanded ? 'expanded' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <div className={`accordion-content ${isExpanded ? 'expanded' : ''}`}>
                    <div className="wish-content">
                      "{wish.wish}"
                    </div>
                    <div className="wish-meta">
                      <span className="wish-author">— {wish.name || 'Anonymous'}</span>
                      <span className="wish-date">{formatDate(wish.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {wishes.length >= currentLimit && (
              <button className="load-more-btn" onClick={loadMore}>
                Load More Wishes
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}