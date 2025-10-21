import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Heart, MessageCircle, Share2, User, Check } from 'lucide-react';
import './wish-modal.css';

const WishModal = ({ 
  wish, 
  isOpen, 
  onClose,
  currentIndex = 0,
  totalWishes = 0,
  onNavigate
 }) => {
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

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < totalWishes - 1;

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
    navigator.clipboard.writeText(`${window.location.origin}/tree/${wish.id}`);
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

  const handleNavigation = (direction) => {
    if (onNavigate) {
      onNavigate(direction);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft' && hasPrev) {
      handleNavigation('prev');
    } else if (e.key === 'ArrowRight' && hasNext) {
      handleNavigation('next');
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="wish-modal-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Navigation Buttons */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation('prev');
          }}
          className="wish-modal-nav-button wish-modal-nav-prev"
          aria-label="Previous wish"
        >
          <ChevronLeft className="wish-modal-nav-icon" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation('next');
          }}
          className="wish-modal-nav-button wish-modal-nav-next"
          aria-label="Next wish"
        >
          <ChevronRight className="wish-modal-nav-icon" />
        </button>
      )}

      {/* Modal Content */}
      <div
        className="wish-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="wish-modal-header">
          <h2 className="wish-modal-title">Wish Details</h2>
          <button
            onClick={onClose}
            className="wish-modal-close"
          >
            ×
          </button>
        </div>

        {/* Author */}
        <div className="wish-modal-author">
          {wish.author?.avatar ? (
            <img
              src={wish.author.avatar}
              alt={wish.author.name}
              className="wish-modal-avatar"
            />
          ) : (
            <div className="wish-modal-avatar-placeholder">
              <User className="wish-modal-avatar-icon" />
            </div>
          )}
          <div>
            <div className="wish-modal-author-name">
              {wish.author?.isAnonymous
                ? 'Anonymous'
                : wish.author?.name || 'Anonymous'}
            </div>
            <div className="wish-modal-author-date">{formatDate(wish.createdAt)}</div>
          </div>
        </div>

        {/* Wish Content */}
        <p className="wish-modal-text">
          "{wish.text}"
        </p>

        {/* Action Buttons */}
        <div className="wish-modal-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            className={`wish-modal-action-btn ${isLiked ? 'liked' : ''}`}
          >
            <Heart
              className={`wish-modal-action-icon ${isLiked ? 'filled' : ''}`}
            />
            {likeCount}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(!showComments);
            }}
            className="wish-modal-action-btn"
          >
            <MessageCircle className="wish-modal-action-icon" />
            {wish.comments || comments.length}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="wish-modal-action-btn"
          >
            {copied ? (
              <>
                <Check className="wish-modal-action-icon" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="wish-modal-action-icon" />
                Share
              </>
            )}
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="wish-modal-comments">
            <h4 className="wish-modal-comments-title">Comments</h4>

            {/* Comment Input */}
            <div className="wish-modal-comment-input">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your blessing..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(e)}
                className="wish-modal-input"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddComment(e);
                }}
                className="wish-modal-send-btn"
              >
                Send
              </button>
            </div>

            {/* Comments List */}
            <div className="wish-modal-comments-list">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="wish-modal-comment"
                >
                  <div className="wish-modal-comment-header">
                    <div className="wish-modal-comment-avatar">
                      <User className="wish-modal-comment-avatar-icon" />
                    </div>
                    <span className="wish-modal-comment-author">{c.author}</span>
                    <span className="wish-modal-comment-time">{c.time}</span>
                  </div>
                  <p className="wish-modal-comment-text">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WishModal;