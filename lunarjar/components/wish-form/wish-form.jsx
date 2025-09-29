import { db } from '../../firebase.js';
import { collection, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

import { useState, useEffect } from 'react';
import { auth } from '../../firebase.js';

import './wish-form.css'

export default function WishForm({currentTreeId, onSubmitSuccess}) {
  const [wishData, setWishData] = useState({
    name: '',
    wish: '',
    category: 'personal',
    isAnonymous: false,
    treeId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [charCount, setCharCount] = useState(0);

  // Update submit button validation
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

  const handleWishChange = (e) => {
    const value = e.target.value;
    setWishData(prev => ({ ...prev, wish: value }));
    setCharCount(value.length);
  };

  const handleSubmit = async () => {
    if (isSubmitting || !isValid) return;

    setIsSubmitting(true);

    const wishPayload = {
      name: wishData.isAnonymous ? 'Anonymous' : wishData.name,
      wish: wishData.wish,
      category: wishData.category,
      isAnonymous: wishData.isAnonymous,
      userId: auth.currentUser?.uid,
      treeId: currentTreeId,
      timestamp: new Date(),
      createdAt: new Date().toISOString()
    };

    try {
      console.log('Saving wish to Firebase:', wishPayload);      
      
      // Add document to 'wishes' collection
      const docRef = await addDoc(collection(db, "wishes"), wishPayload);
      
      console.log('✅ Wish saved successfully with ID:', docRef.id);
      showMessage('Your wish has been added to the tree! ✨', 'success');
      resetForm();

      // Add this console.log
      console.log('🔄 Calling onSubmitSuccess callback');
      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        console.warn('⚠️ onSubmitSuccess prop is not provided!');
      }
      
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
      name: '',
      wish: '',
      category: 'personal',
      isAnonymous: false
    });
    setCharCount(0);
  };



  return (
    <div className="form-container">
      {/* Name Field */}
      <div className="form-group">
        <label htmlFor="name">Your Name</label>
        <input 
          type="text" 
          id="name" 
          className="form-input" 
          placeholder="Enter your name" 
          maxLength="50"
          value={wishData.name}
          onChange={handleNameChange}
          disabled={wishData.isAnonymous}
        />
      </div>

      {/* Anonymous Toggle */}
      <div className="toggle-container">
        <div 
          className={`toggle-switch ${wishData.isAnonymous ? 'active' : ''}`}
          id="anonymousToggle"
          onClick={handleAnonymousToggle}
        >
          <div className="toggle-knob"></div>
        </div>
        <label className="toggle-label" htmlFor="anonymousToggle">
          Make this wish anonymous
        </label>
      </div>

      {/* Category Selection */}
      <div className="form-group">
        <label htmlFor="category">Wish Category</label>
        <div className="select-container">
          <select 
            id="category" 
            className="form-select"
            value={wishData.category}
            onChange={handleCategoryChange}
          >
            <option value="personal">Personal Growth</option>
            <option value="career">Career & Success</option>
            <option value="relationships">Love & Relationships</option>
            <option value="health">Health & Wellness</option>
            <option value="dreams">Dreams & Aspirations</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Wish Text Area */}
      <div className="form-group">
        <label htmlFor="wish">Your Wish</label>
        <div className="textarea-container">
          <textarea 
            id="wish" 
            className="form-textarea" 
            placeholder="Write your wish here... What do you hope for?" 
            maxLength="500"
            value={wishData.wish}
            onChange={handleWishChange}
          />
          <div className="character-count">
            <span id="charCount">{charCount}</span>/500 characters
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        id="submitBtn" 
        className="submit-btn"
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="loading-spinner"></div>
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

      {/* Message Container */}
      {message.text && (
        <div id="messageContainer" style={{ display: 'block' }}>
          <div className={`${message.type}-message`}>{message.text}</div>
        </div>
      )}
    </div>
  );
}