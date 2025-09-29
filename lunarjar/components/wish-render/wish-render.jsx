import { db } from '../../firebase.js';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { useState, useEffect } from 'react';

import './wish-render.css';

export default function WishRender({ currentTreeId='', refreshTrigger = 0, isGlobalRender=false }) {
  console.log('🎯 WishRender received refreshTrigger:', refreshTrigger);

  const [wishes, setWishes] = useState([]);
  const [displayedWishes, setDisplayedWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [currentLimit, setCurrentLimit] = useState(10);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Load wishes from Firebase
  const loadWishes = async () => {
    setLoading(true);
    
    try {
      console.log('Loading wishes from Firebase...');

      // Query wishes from Firebase
      const q = isGlobalRender
      ? query(
          collection(db, "wishes"),
          orderBy("timestamp", "desc"),
          limit(currentLimit)
        )
      : query(
          collection(db, "wishes"),
          where("treeId", "==", currentTreeId),
          orderBy("timestamp", "desc"),
          limit(currentLimit)
        );
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
    } finally {
      setLoading(false);
    }
  };

  // Update statistics
  const updateStats = async () => {
    try {
      // Get total count
      const allWishesSnapshot = await getDocs(collection(db, "wishes"));
      const totalCount = allWishesSnapshot.size;

      // Get today's count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();
      
      const todayQuery = query(
        collection(db, "wishes"),
        where("createdAt", ">=", todayISO)
      );
      const todaySnapshot = await getDocs(todayQuery);
      const todayCount = todaySnapshot.size;

      setStats({ total: totalCount, today: todayCount });
      
      console.log('📊 Stats updated:', { total: totalCount, today: todayCount });
      
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  // Load wishes on mount and when refreshTrigger or currentLimit changes
  useEffect(() => {
    console.log('🔄 useEffect triggered, refreshTrigger:', refreshTrigger);
    loadWishes();
  }, [refreshTrigger, currentLimit]);

  // Filter wishes by category and search term
  useEffect(() => {
    let filtered = wishes;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(wish => wish.category === filterCategory);
    }
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(wish => 
        wish.wish.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wish.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        Wishes from Our Community
      </div>
      
      <div className="wishes-stats">
        <div className="stat-item">
          <strong id="totalWishes">{stats.total}</strong> Total Wishes
        </div>
        <div className="stat-item">
          <strong id="todayWishes">{stats.today}</strong> Today
        </div>
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