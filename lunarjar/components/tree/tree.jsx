import React, { useState } from 'react';
import { Sparkles, Gift, Star } from 'lucide-react';
import { db } from '../../firebase.js';
import { collection, addDoc, getDoc, getDocs, query, where, orderBy, limit, doc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import WishModal from '../wish-modal/wish-modal';

import './tree.css'

const WishDecorationSystem = ({ 
  wishCount = 0, 
  daysUntilNewYear = 90,
  wishes = []
}) => {
  const maxSlots = 50;
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [selectedWish, setSelectedWish] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const growthStage = Math.floor(wishCount / 5);
  const festivenessLevel = daysUntilNewYear <= 30 ? 'high' : 
                          daysUntilNewYear <= 60 ? 'medium' : 'low';
  
  const decorationTypes = ['ball', 'star', 'gift', 'sparkle'];
  const ballColors = ['ball-red', 'ball-blue', 'ball-gold', 'ball-green', 'ball-purple'];
  const getBallColor = (index) => ballColors[index % ballColors.length];

  const slots = Array.from({ length: maxSlots }, (_, i) => ({
    id: i,
    filled: i < wishCount,
    type: decorationTypes[i % decorationTypes.length],
    wish: wishes[i] || null
  }));

  const handleDecorationClick = (wish, index) => {
    // Transform wish data to match WishModal format
    const formattedWish = {
      id: wish?.id || `wish-${index}`,
      text: wish?.text || wish?.message || `Wish #${index + 1}`,
      author: {
        name: wish?.author || wish?.name || 'Anonymous',
        //avatar: wish?.avatar || null,
        isAnonymous: !wish?.isAnonymous 
      },
      createdAt: wish?.timestamp,
      likes: wish?.likes || 0,
      comments: wish?.comments || 0,
      isLiked: wish?.isLiked || false
    };
    
    setSelectedWish(formattedWish);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedWish(null), 300); // Wait for animation to finish
  };
  
  const renderDecoration = (slot, index) => {
    const hoverClass = hoveredSlot === slot.id ? 'decoration-hover' : '';
    
    switch (slot.type) {
      case 'ball':
        return (
          <div className={`wish-ball ${getBallColor(index)} ${hoverClass}`}>
            <div className="ball-shine"></div>
          </div>
        );
      case 'star':
        return <Star className={`decoration-icon star-icon ${hoverClass}`} />;
      case 'gift':
        return <Gift className={`decoration-icon gift-icon ${hoverClass}`} />;
      case 'sparkle':
        return <Sparkles className={`decoration-icon sparkle-icon ${hoverClass}`} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="wish-container">
      <div className="content-wrapper">
        <div className="header">
          <h1 className="title">
            <Sparkles className="title-icon" />
            Wish Decoration Tree
            <Sparkles className="title-icon" />
          </h1>
          <p className="subtitle">
            {daysUntilNewYear} days until New Year!
          </p>
        </div>
        
        <div className="stats-panel">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{wishCount}</div>
              <div className="stat-label">Current Wishes</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{maxSlots - wishCount}</div>
              <div className="stat-label">Empty Slots</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">Stage {growthStage}</div>
              <div className="stat-label">Growth Level</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((wishCount % 5) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="festiveness-indicator">
            <div className="festiveness-badge">
              <div className={`festiveness-dot festiveness-${festivenessLevel}`}></div>
              <span className="festiveness-text">
                Festiveness: {festivenessLevel.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="decoration-container">
          <div className="slots-grid">
            {slots.map((slot, index) => (
              <div
                key={slot.id}
                className="slot-wrapper"
                onMouseEnter={() => setHoveredSlot(slot.id)}
                onMouseLeave={() => setHoveredSlot(null)}
              >
                {slot.filled ? (
                  <div 
                    className="filled-slot clickable-decoration"
                    onClick={() => handleDecorationClick(slot.wish, index)}
                  >
                    {renderDecoration(slot, index)}
                    
                    {hoveredSlot === slot.id && (
                      <div className="tooltip">
                        {slot.wish ? (
                          <div>
                            <div className="tooltip-title">Wish #{index + 1}</div>
                            <div className="tooltip-content">
                              {slot.wish.text || slot.wish.message || 'A wonderful wish'}
                            </div>
                          </div>
                        ) : (
                          <div className="tooltip-title">Wish #{index + 1}</div>
                        )}
                        <div className="tooltip-arrow"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-slot">
                    <div className={`empty-circle ${hoveredSlot === slot.id ? 'empty-hover' : ''}`}></div>
                    
                    {hoveredSlot === slot.id && (
                      <div className="tooltip">
                        <div className="tooltip-title">Empty Slot #{index + 1}</div>
                        <div className="tooltip-subtitle">Waiting for a wish...</div>
                        <div className="tooltip-arrow"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="footer-info">
          <p>Add more wishes to unlock new growth stages! 🎄</p>
          <p className="footer-subtitle">Each stage unlocks at 5, 10, 15, 20... wishes</p>
        </div>
      </div>

      {/* Wish Modal */}
      <WishModal 
        wish={selectedWish}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default function Tree() {
  const [wishCount, setWishCount] = useState(12);
  const [currWishes, setCurrWishes] = useState([]);

  const daysUntilNewYear = Math.ceil((new Date('2026-01-01') - new Date()) / (1000 * 60 * 60 * 24));

  // Load wishes from Firebase
  React.useEffect(() => {
    const loadWishes = async () => {
      try {
        console.log('📥 Loading wishes from Firebase...');

        const q = query(
          collection(db, "wishes"),
          orderBy("createdAt", "desc"),
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
        setCurrWishes(loadedWishes);
        setWishCount(loadedWishes.length);

      } catch (error) {
        console.error('❌ Error loading wishes:', error);
        console.error('Error details:', error.message);
      }
    };
    
    loadWishes();
  }, []); // Empty dependency array means this runs once on mount

  const sampleWishes = [
    { id: 1, text: 'I wish for world peace', author: 'Alice' },
    { id: 2, text: 'May everyone find happiness', author: 'Bob' },
    { id: 3, text: 'Health and prosperity for all', author: 'Charlie' },
    { id: 4, text: 'A year full of love', author: 'Diana' },
    { id: 5, text: 'Success in my endeavors', author: 'Eve' },
    { id: 6, text: 'Joy and laughter every day', author: 'Frank' },
    { id: 7, text: 'To travel the world', author: 'Grace' },
    { id: 8, text: 'Learning new things', author: 'Henry' },
    { id: 9, text: 'Stronger friendships', author: 'Ivy' },
    { id: 10, text: 'Making a difference', author: 'Jack' },
    { id: 11, text: 'Finding inner peace', author: 'Kate' },
    { id: 12, text: 'New adventures ahead', author: 'Leo' }
  ];
  
  return (
    <div>
      <WishDecorationSystem 
        wishCount={wishCount}
        daysUntilNewYear={daysUntilNewYear}
        wishes={currWishes}
      />
      
      <div className="demo-controls">
        <div className="controls-title">Demo Controls</div>
        <div className="controls-buttons">
          <button
            onClick={() => setWishCount(Math.max(0, wishCount - 1))}
            className="control-btn btn-minus"
            disabled={wishCount === 0}
          >
            -
          </button>
          <span className="control-count">{wishCount}</span>
          <button
            onClick={() => setWishCount(Math.min(50, wishCount + 1))}
            className="control-btn btn-plus"
            disabled={wishCount === 50}
          >
            +
          </button>
        </div>
        <div className="controls-hint">
          Adjust wish count (0-50)
        </div>
      </div>
    </div>
  );
}