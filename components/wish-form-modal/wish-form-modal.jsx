import { db } from '../../firebase.js';
import { collection, doc, increment, addDoc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { auth } from '../../firebase.js';
import { X } from 'lucide-react';

import './WishFormModal.css'

export default function WishFormModal({ currentTreeId, onSubmitSuccess, isOpen, onClose }) {
  const [wishData, setWishData] = useState({
      wish: '',
      name: '',
      isAnonymous: false,
      category: 'personal',
      decoration: 'envelope',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [charCount, setCharCount] = useState(0);

  const isValid = wishData.wish.trim() && (wishData.name.trim() || wishData.isAnonymous);

  useEffect(() => {
    console.log('Component mounted - ready to connect to Firebase');
  }, []);

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
  };

  const handleNameChange = (e) => {
    setWishData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleAnonymousToggle = () => {
    setWishData(prev => ({
      ...prev,
      isAnonymous: !prev.isAnonymous,
      name: !prev.isAnonymous ? '' : prev.name
    }));
  };

  const handleCategoryChange = (e) => {
    setWishData(prev => ({ ...prev, category: e.target.value }));
  };

  const handleDecoChange = (e) => {
    setWishData(prev => ({ ...prev, decoration: e.target.value }));
  };

  const handleWishChange = (e) => {
    const value = e.target.value;
    setWishData(prev => ({ ...prev, wish: value }));
    setCharCount(value.length);
  };

  const handleSubmit = async () => {
    if (isSubmitting || !isValid) return;

    setIsSubmitting(true);

    const wishPayload = {
      userId: auth.currentUser?.uid,
      treeId: currentTreeId,
      wish: wishData.wish,
      name: wishData.isAnonymous ? 'Anonymous' : wishData.name,
      isAnonymous: wishData.isAnonymous,
      category: wishData.category,
      decoration: wishData.decoration,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isLiked: false
    };

    try {
      console.log('Saving wish to Firebase:', wishPayload);      
      
      const docRef = await addDoc(collection(db, "wishes"), wishPayload);
      
      console.log('✅ Wish saved successfully with ID:', docRef.id);
      showMessage('Your wish has been added to the tree! ✨', 'success');

      const treeRef = doc(db, 'trees', currentTreeId);
      await updateDoc(treeRef, {
        wishCount: increment(1)
      });

      setTimeout(() => {
        resetForm();
      }, 1000);
      

      console.log('🔄 Calling onSubmitSuccess callback');
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Firebase error:', error);
      
      if (error.code === 'permission-denied') {
        showMessage('Permission denied. Please check Firebase security rules.', 'error');
      } else if (error.code === 'unavailable') {
        showMessage('Firebase is temporarily unavailable. Please try again.', 'error');
      } else {
        showMessage('Something went wrong. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setWishData({
      wish: '',
      name: '',
      isAnonymous: false,
      category: 'personal',
      decoration: 'envelope',
    });
    setCharCount(0);
    setMessage({ text: '', type: '' });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div className="modal-overlay-wish" onClick={handleClose}>
        {/* Modal Content */}
        <div className="modal-content-wish" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header-wish">
            <div className="modal-header-content">
              <div className="header-icon-wish">
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
              </div>
              <div>
                <h2 className="modal-title-wish">Make a Wish</h2>
                <p className="modal-subtitle-wish">Share your hopes and dreams</p>
              </div>
            </div>
            <button 
              className="modal-close-btn-wish" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <div className="form-container-wish">
            {/* Name Field */}
            <div className="form-group-wish">
              <label htmlFor="name">Your Name</label>
              <input 
                type="text" 
                id="name" 
                className="form-input-wish" 
                placeholder="Enter your name" 
                maxLength="50"
                value={wishData.name}
                onChange={handleNameChange}
                disabled={wishData.isAnonymous || isSubmitting}
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="toggle-container-wish">
              <div 
                className={`toggle-switch-wish ${wishData.isAnonymous ? 'active' : ''}`}
                onClick={handleAnonymousToggle}
              >
                <div className="toggle-knob-wish"></div>
              </div>
              <label className="toggle-label-wish">
                Make this wish anonymous
              </label>
            </div>

            {/* Category Selection */}
            <div className="form-group-wish">
              <label htmlFor="category">Wish Category</label>
              <select 
                id="category" 
                className="form-select-wish"
                value={wishData.category}
                onChange={handleCategoryChange}
                disabled={isSubmitting}
              >
                <option value="personal">Personal Growth</option>
                <option value="career">Career & Success</option>
                <option value="relationships">Love & Relationships</option>
                <option value="health">Health & Wellness</option>
                <option value="dreams">Dreams & Aspirations</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Decoration Selection */}
            <div className="form-group-wish">
              <label htmlFor="decoration">Wish Decoration</label>
              <select 
                id="decoration" 
                className="form-select-wish"
                value={wishData.decoration}
                onChange={handleDecoChange}
                disabled={isSubmitting}
              >
                <option value="envelope">📧 Envelope</option>
                <option value="lantern">🏮 Lantern</option>
                <option value="blossom">🌸 Blossom</option>
              </select>
            </div>

            {/* Wish Text Area */}
            <div className="form-group-wish">
              <label htmlFor="wish">Your Wish</label>
              <textarea 
                id="wish" 
                className="form-textarea-wish" 
                placeholder="Write your wish here... What do you hope for?" 
                maxLength="500"
                value={wishData.wish}
                onChange={handleWishChange}
                disabled={isSubmitting}
              />
              <div className="character-count-wish">
                <span>{charCount}</span>/500 characters
              </div>
            </div>

            {/* Message Container */}
            {message.text && (
              <div className={`message-wish ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button 
              className="submit-btn-wish"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner-wish"></div>
                  Adding to tree...
                </>
              ) : (
                <>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                  Add Wish to Tree
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}