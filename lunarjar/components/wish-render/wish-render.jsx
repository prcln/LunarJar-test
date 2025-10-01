import { db } from '../../firebase.js';
import { collection, addDoc, getDocs, query, where, orderBy, limit, doc, deleteDoc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { useState, useEffect } from 'react';
import { canDeleteWish, getUserTreeRole } from '../../utils/checkPerm.js';

import './wish-render.css';

export default function WishRender({ currentTreeId='', refreshTrigger = 0, isGlobalRender=false, treeName, currentUserId, currentUserMail }) {
  console.log('🎯 WishRender received:', { currentTreeId, refreshTrigger, isGlobalRender, currentUserId, currentUserMail });

  const [wishes, setWishes] = useState([]);
  const [displayedWishes, setDisplayedWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [currentLimit, setCurrentLimit] = useState(10);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [deletingWishId, setDeletingWishId] = useState(null);
  const [wishPermissions, setWishPermissions] = useState({});

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

  // Check user's role on this tree
  useEffect(() => {
    const checkRole = async () => {
      if (currentUserId && currentTreeId) {
        const role = await getUserTreeRole(currentUserId, currentTreeId, currentUserMail);
        setUserRole(role);
        console.log('👤 User role on this tree:', role);
      } else {
        setUserRole(null);
      }
    };
    checkRole();
  }, [currentUserId, currentTreeId]);

  // Check permissions for each wish when wishes load
  useEffect(() => {
    const checkWishPermissions = async () => {
      if (!currentUserId || wishes.length === 0) return;

      const permissions = {};
      
      for (const wish of wishes) {
        const canDelete = await canDeleteWish(currentUserId, wish.id, wish.treeId);
        permissions[wish.id] = { canDelete };
      }
      
      setWishPermissions(permissions);
      console.log('🔐 Wish permissions calculated:', permissions);
    };

    checkWishPermissions();
  }, [wishes, currentUserId]);

  // Delete wish function
  const handleDeleteWish = async (wishId, treeId) => {
    const hasPermission = wishPermissions[wishId]?.canDelete;
    
    if (!hasPermission) {
      alert('You do not have permission to delete this wish.');
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
        if (treeRef.wishCount > 0) {
        await updateDoc(treeRef, {
          wishCount: increment(-1)
        });
        }
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

      let q;
      
      if (isGlobalRender) {
        q = query(
          collection(db, "wishes"),
          orderBy("createdAt", "desc"),
          limit(currentLimit)
        );
      } else {
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
        const allWishesSnapshot = await getDocs(collection(db, "wishes"));
        totalCount = allWishesSnapshot.size;

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
        if (currentTreeId) {
          const treeWishesQuery = query(
            collection(db, "wishes"),
            where("treeId", "==", currentTreeId)
          );
          const treeWishesSnapshot = await getDocs(treeWishesQuery);
          totalCount = treeWishesSnapshot.size;

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

  useEffect(() => {
    console.log('🔄 useEffect triggered:', { refreshTrigger, currentLimit, currentTreeId });
    loadWishes();
  }, [refreshTrigger, currentLimit, currentTreeId, isGlobalRender]);

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

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const loadMore = () => {
    setCurrentLimit(prev => prev + 10);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };

  // Role badge display
  const getRoleBadge = () => {
    if (!userRole) return null;
    
    const badges = {
      'admin': { text: '👑 Admin', color: '#d97706' },
      'owner': { text: '🌳 Owner', color: '#059669' },
      'collaborator': { text: '🤝 Collaborator', color: '#3b82f6' }
    };
    
    const badge = badges[userRole];
    if (!badge) return null;
    
    return (
      <div className="stat-item" style={{ color: badge.color }}>
        {badge.text}
      </div>
    );
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
        {getRoleBadge()}
      </div>

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
              const canDelete = wishPermissions[wish.id]?.canDelete || false;

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
                      {canDelete && (
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
                            cursor: deletingWishId === wish.id ? 'not-allowed' : 'pointer',
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