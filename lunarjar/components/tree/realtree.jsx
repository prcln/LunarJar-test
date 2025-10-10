import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, Star } from 'lucide-react';

// Import your WishModal component
import WishModal from '../wish-modal/wish-modal';

// Services
import wishService from '../../utils/services/wishServices';
import { decoIcon } from '../../utils/decorations/decorations';

const ApricotTreeWithDecorations = ({ wishes = [], onDecorationClick }) => {
  const [hoveredDecoration, setHoveredDecoration] = useState(null);
  
  // Define decoration positions on the tree (as percentages for responsiveness)
  // These are positioned to look natural on branches
  const decorationPositions = [
    { x: 56.6, y: 24.9 },
    { x: 27.6, y: 52.9 },
    { x: 78, y: 47.6 },
    { x: 82.3, y: 63.7 },
    { x: 11.3, y: 49.2 },
    { x: 36.3, y: 28.6 },
    { x: 62.7, y: 20 },
    { x: 63.7, y: 13.1 },
    { x: 41.3, y: 14.4 },
  ];

  const getDecoType = (wish) => {
    if (wish?.decoration) {
      return wish.decoration;
    }
  }

const renderDecoration = (wish, index) => {
  const isHovered = hoveredDecoration === index;
  const decorationType = getDecoType(wish, index);
  
  return decoIcon({ iconType: decorationType, isHovered });
};

  return (
    <div className="apricot-tree-container">
      {/* SVG Tree Background */}
      <div className="tree-svg-wrapper">
        <img 
          src="../../file.svg" 
          alt="Apricot Blossom Tree"
          className="tree-svg"
        />
      </div>

      {/* Decorations Overlay */}
      <div className="decorations-layer">
        {decorationPositions.map((position, index) => {
          const wish = wishes[index];
          
          return (
            <div
              key={index}
              className="decoration-wrapper"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
              onMouseEnter={() => setHoveredDecoration(index)}
              onMouseLeave={() => setHoveredDecoration(null)}
              onClick={() => wish && onDecorationClick(wish, index)}
            >
              {renderDecoration(wish, index)}
              
              {/* Tooltip on hover */}
              {hoveredDecoration === index && (
                <div className="decoration-tooltip">
                  {wish ? (
                    <div>
                      <div className="tooltip-title">Wish #{index + 1}</div>
                      <div className="tooltip-preview">
                        {wish.text?.substring(0, 30)}...
                      </div>
                    </div>
                  ) : (
                    <div className="tooltip-title">Empty Slot</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .apricot-tree-container {
          position: relative;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          aspect-ratio: 1 / 1;
        }

        .tree-svg-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .tree-svg {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .decorations-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .decoration-wrapper {
          position: absolute;
          transform: translate(-50%, -50%);
          cursor: pointer;
          pointer-events: auto;
          transition: transform 0.2s ease;
          z-index: 10;
        }

        .decoration-wrapper:hover {
          transform: translate(-50%, -50%) scale(1.2);
          z-index: 20;
        }

        /* Red Lantern */
        .decoration-lantern {
          position: relative;
          width: 24px;
          height: 32px;
        }

        .lantern-top {
          width: 20px;
          height: 4px;
          background: #8B4513;
          margin: 0 auto;
          border-radius: 2px;
        }

        .lantern-body {
          width: 24px;
          height: 22px;
          background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%);
          border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
          margin-top: 2px;
          box-shadow: 0 2px 8px rgba(220, 20, 60, 0.4);
        }

        .lantern-bottom {
          width: 12px;
          height: 6px;
          background: #FFD700;
          margin: 0 auto;
          border-radius: 0 0 50% 50%;
        }

        .lantern-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          background: radial-gradient(circle, rgba(220, 20, 60, 0.3) 0%, transparent 70%);
          pointer-events: none;
        }

        .decoration-lantern.hovered .lantern-glow {
          animation: pulse 1s infinite;
        }

        /* Red Envelope (Hongbao) */
        .decoration-envelope {
          width: 20px;
          height: 28px;
          position: relative;
        }

        .envelope-flap {
          width: 20px;
          height: 10px;
          background: linear-gradient(135deg, #B22222 0%, #8B0000 100%);
          clip-path: polygon(0 0, 100% 0, 50% 100%);
        }

        .envelope-body {
          width: 20px;
          height: 18px;
          background: linear-gradient(180deg, #DC143C 0%, #B22222 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .envelope-text {
          color: #FFD700;
          font-size: 12px;
          font-weight: bold;
          font-family: serif;
        }

        .decoration-envelope.hovered {
          animation: swing 0.5s ease-in-out;
        }

        /* Blossom Sparkle */
        .decoration-blossom {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .blossom-sparkle {
          width: 20px;
          height: 20px;
          color: #FFB6C1;
          filter: drop-shadow(0 0 4px rgba(255, 182, 193, 0.8));
        }

        .decoration-blossom.hovered .blossom-sparkle {
          animation: sparkle 1s infinite;
          color: #FF69B4;
        }

        /* Tooltip */
        .decoration-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(139, 0, 0, 0.95);
          color: #FFD700;
          padding: 8px 12px;
          border-radius: 8px;
          white-space: nowrap;
          font-size: 12px;
          margin-bottom: 8px;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 1px solid #FFD700;
          z-index: 100;
        }

        .tooltip-title {
          font-weight: bold;
          margin-bottom: 4px;
        }

        .tooltip-preview {
          font-size: 10px;
          color: #FFF;
          max-width: 150px;
          white-space: normal;
        }

        /* Animations */
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        @keyframes swing {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(10deg);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.3) rotate(180deg);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

// Example usage component
export default function ApricotTreeDemo() {
  const [selectedWish, setSelectedWish] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [treeWishes, setTreeWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const treeId = 'ffn8D9wDbT3Fg4njcT1L';
  // Load wishes when component mounts or treeId changes
  useEffect(() => {
    const loadWishes = async () => {
      if (!treeId) {
        console.warn('No treeId provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await wishService.getWishesByTree(treeId, {
          limitCount: 50, // Adjust as needed
          orderByField: 'createdAt',
          orderDirection: 'asc'
        });

        setTreeWishes(result.wishes);
        console.log(`✅ Loaded ${result.wishes.length} wishes for tree`);
      } catch (err) {
        console.error('❌ Error loading wishes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadWishes();
  }, [treeId]);


  // Handle decoration click
  const handleDecorationClick = (wish, index) => {
    // Format wish data for the modal
    const formattedWish = {
      id: wish?.id || `wish-${index}`,
      text: wish?.wish || wish?.text || `Wish #${index + 1}`,
      author: {
        name: wish?.name || wish?.author || 'Anonymous',
        avatar: wish?.avatar || null,
        isAnonymous: !wish?.name && !wish?.author
      },
      createdAt: wish?.createdAt ? new Date(wish.createdAt) : new Date(),
      likes: wish?.likes || 0,
      comments: wish?.comments || 0,
      isLiked: wish?.isLiked || false,
      category: wish?.category || 'other',
      treeId: wish?.treeId || treeId
    };

    setSelectedWish(formattedWish);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedWish(null), 300);
  };

  return (
    <div style={{ padding: '40px', background: 'linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '36px', color: '#8B0000', fontFamily: 'serif', marginBottom: '10px' }}>
          🌸 Apricot Blossom Wish Tree 🌸
        </h1>
        <p style={{ fontSize: '18px', color: '#666' }}>
          Click on the decorations to read wishes!
        </p>
      </div>

      <ApricotTreeWithDecorations 
        wishes={treeWishes}
        onDecorationClick={handleDecorationClick}
      />

      {/* Uncomment when you have WishModal component */}
       <WishModal 
        wish={selectedWish}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  ); 
}