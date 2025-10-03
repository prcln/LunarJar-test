import { useState } from 'react';
import { X, Heart, MessageCircle, Share2, User, Sparkles, Check } from 'lucide-react';

import './wish-modal.css'


const WishModal = ({ wish = mockWish, isOpen, onClose }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
      <div className="relative max-w-lg w-full animate-hongbaoOpen">
        
        {/* Hongbao Envelope */}
        <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Decorative patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          {/* Gold trim top */}
          <div className="h-3 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"></div>

          {/* Header with Chinese decoration */}
          <div className="relative px-6 pt-8 pb-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-red-800 bg-opacity-50 hover:bg-opacity-70 transition-all text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Decorative cloud pattern */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-20 h-20 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
            </div>

            <div className="text-center relative z-10">
              <div className="inline-block mb-3">
                <div className="relative">
                  <Sparkles className="w-10 h-10 text-yellow-300 animate-pulse" />
                  <div className="absolute inset-0 bg-yellow-300 blur-lg opacity-50 animate-pulse"></div>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-yellow-300 mb-1" style={{ fontFamily: 'serif' }}>
                恭喜发财
              </h2>
              <p className="text-yellow-100 text-sm">Gōng Xǐ Fā Cái</p>
            </div>
          </div>

          {/* White paper content */}
          <div className="bg-gradient-to-b from-amber-50 to-yellow-50 rounded-t-3xl mx-3 mb-3 shadow-inner">
            
            {/* Gold seal decoration */}
            <div className="flex justify-center -mt-6 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-300">
                <span className="text-red-600 text-xl font-bold">福</span>
              </div>
            </div>

            {/* Author Info */}
            <div className="px-6 pb-4 border-b-2 border-red-100">
              <div className="flex items-center gap-3">
                {wish.author?.avatar ? (
                  <img src={wish.author.avatar} alt={wish.author.name} className="w-10 h-10 rounded-full border-2 border-red-300" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center border-2 border-red-300">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {wish.author?.isAnonymous ? 'Anonymous' : (wish.author?.name || 'Anonymous')}
                  </h3>
                  <p className="text-xs text-gray-500">{formatDate(wish.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Wish Content */}
            <div className="px-6 py-5 max-h-64 overflow-y-auto">
              <div className="relative">
                {/* Decorative quotes */}
                <div className="absolute -left-2 -top-2 text-4xl text-red-300 opacity-30 font-serif">"</div>
                <p className="text-gray-700 leading-relaxed text-center italic px-4 relative z-10">
                  {wish.text}
                </p>
                <div className="absolute -right-2 -bottom-2 text-4xl text-red-300 opacity-30 font-serif">"</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-5 flex items-center justify-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all shadow-md ${
                  isLiked
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    : 'bg-white text-red-600 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-bold">{likeCount}</span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-red-600 rounded-full font-medium hover:bg-red-50 transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-bold">{wish.comments || comments.length}</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-red-600 rounded-full font-medium hover:bg-red-50 transition-all shadow-md"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-bold">Share</span>
                  </>
                )}
              </button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="border-t-2 border-red-100 bg-gradient-to-b from-yellow-50 to-amber-50">
                <div className="px-6 py-4">
                  <h4 className="font-bold text-red-700 mb-3 text-sm">Blessings & Comments</h4>
                  
                  {/* Comment Form */}
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add your blessing..."
                        className="flex-1 px-3 py-2 text-sm border-2 border-red-200 rounded-full focus:outline-none focus:border-red-400 transition-colors bg-white"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(e)}
                      />
                      <button
                        onClick={handleAddComment}
                        className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-md text-sm"
                      >
                        Send
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {comments.map((c) => (
                      <div key={c.id} className="bg-white p-3 rounded-2xl shadow-sm border border-red-100">
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs text-gray-800">{c.author}</span>
                              <span className="text-xs text-gray-400">{c.time}</span>
                            </div>
                            <p className="text-xs text-gray-600">{c.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gold trim bottom */}
          <div className="h-3 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"></div>

          {/* Decorative golden coins floating */}
          <div className="absolute top-20 left-8 w-6 h-6 rounded-full bg-yellow-400 opacity-20 animate-float"></div>
          <div className="absolute top-32 right-12 w-4 h-4 rounded-full bg-yellow-300 opacity-30 animate-float-delayed"></div>
          <div className="absolute bottom-32 left-12 w-5 h-5 rounded-full bg-yellow-400 opacity-20 animate-float"></div>
        </div>
      </div>
    </div>
  );
};

export default WishModal;