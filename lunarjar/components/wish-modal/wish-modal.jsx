import { useState } from 'react';
import { X, Heart, MessageCircle, Share2, User, Check } from 'lucide-react';

const WishModal = ({ wish, isOpen, onClose }) => {
  const [isLiked, setIsLiked] = useState(wish?.isLiked || false);
  const [likeCount, setLikeCount] = useState(wish?.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { id: 1, author: 'Chen Ming', text: '恭喜发财! Wishing you prosperity! 🧧', time: '2 hours ago' },
    { id: 2, author: 'Wang Fang', text: 'Beautiful wish for the new year! 🎊', time: '5 hours ago' }
  ]);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !wish) return null;

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setComments([
      { id: Date.now(), author: 'You', text: comment, time: 'Just now' },
      ...comments
    ]);
    setComment('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/wish/${wish.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '20px',
          maxWidth: '500px',
          width: '100%',
          border: '3px solid #DC143C',
          animation: 'modalScale 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ color: '#8B0000', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            Wish Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#666',
              fontSize: '24px',
              lineHeight: '1'
            }}
          >
            ×
          </button>
        </div>

        {/* Author Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
          {wish.author?.avatar ? (
            <img src={wish.author.avatar} alt={wish.author.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          ) : (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #DC143C, #8B0000)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: '600', color: '#333' }}>
              {wish.author?.isAnonymous ? 'Anonymous' : (wish.author?.name || 'Anonymous')}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>{formatDate(wish.createdAt)}</div>
          </div>
        </div>

        {/* Wish Content */}
        <p style={{
          fontSize: '18px',
          fontStyle: 'italic',
          marginBottom: '20px',
          color: '#333',
          lineHeight: '1.6',
          padding: '15px',
          background: '#f9f9f9',
          borderRadius: '10px',
          borderLeft: '4px solid #DC143C'
        }}>
          "{wish.text}"
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: showComments ? '20px' : '0' }}>
          <button
            onClick={handleLike}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background: isLiked ? '#DC143C' : '#f0f0f0',
              color: isLiked ? 'white' : '#DC143C',
              transition: 'all 0.2s'
            }}
          >
            <Heart style={{ width: '16px', height: '16px', fill: isLiked ? 'currentColor' : 'none' }} />
            {likeCount}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background: '#f0f0f0',
              color: '#DC143C',
              transition: 'all 0.2s'
            }}
          >
            <MessageCircle style={{ width: '16px', height: '16px' }} />
            {wish.comments || comments.length}
          </button>

          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background: '#f0f0f0',
              color: '#DC143C',
              transition: 'all 0.2s'
            }}
          >
            {copied ? (
              <>
                <Check style={{ width: '16px', height: '16px' }} />
                Copied!
              </>
            ) : (
              <>
                <Share2 style={{ width: '16px', height: '16px' }} />
                Share
              </>
            )}
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h4 style={{ color: '#8B0000', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold' }}>
              Comments
            </h4>

            {/* Comment Form */}
            <div style={{ marginBottom: '15px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your blessing..."
                style={{
                  flex: 1,
                  padding: '10px 15px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(e)}
                onFocus={(e) => e.target.style.borderColor = '#DC143C'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <button
                onClick={handleAddComment}
                style={{
                  padding: '10px 20px',
                  background: '#DC143C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Send
              </button>
            </div>

            {/* Comments List */}
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {comments.map((c) => (
                <div key={c.id} style={{
                  background: '#f9f9f9',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #DC143C, #8B0000)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User style={{ width: '12px', height: '12px', color: 'white' }} />
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '13px', color: '#333' }}>{c.author}</span>
                    <span style={{ fontSize: '11px', color: '#999' }}>{c.time}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#666', margin: 0, paddingLeft: '32px' }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default WishModal;