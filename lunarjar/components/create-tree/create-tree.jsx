import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { auth, db } from '../../firebase.js';

import './create-tree.css'

export default function CreateTree() {
const [user, setUser] = useState(null);
const [treeName, setTreeName] = useState('');
const [isPublic, setIsPublic] = useState(true);
const [collaborators, setCollaborators] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [message, setMessage] = useState({ type: '', text: '' });

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  return () => unsubscribe();
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!user) {
    setMessage({ type: 'error', text: 'You must be logged in to create a tree' });
    return;
  }

  if (!treeName.trim()) {
    setMessage({ type: 'error', text: 'Please enter a tree name' });
    return;
  }

  setIsLoading(true);
  setMessage({ type: '', text: '' });

  try {
    // Parse collaborators from comma-separated emails
    const collaboratorsList = collaborators
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const treeData = {
      name: treeName.trim(),
      ownerId: user.uid,
      isPublic: isPublic,
      collaborators: collaboratorsList,
      createdAt: serverTimestamp(),
      timestamp: new Date()
    };

    const docRef = await addDoc(collection(db, 'trees'), treeData);
    
    setMessage({ type: 'success', text: 'Tree created successfully!' });
    
    // Reset form
    setTreeName('');
    setCollaborators('');
    setIsPublic(true);
    
    // Redirect after 2 seconds
    setTimeout(() => {
      window.location.href = `/user/tree/${docRef.id}`;
    }, 2000);

  } catch (error) {
    console.error('Error creating tree:', error);
    setMessage({ type: 'error', text: 'Failed to create tree. Please try again.' });
  } finally {
    setIsLoading(false);
  }
};

if (!user) {
  return (
    <div className="create-tree-container">
      <div className="create-tree-card">
        <div className="login-prompt">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2>Please Log In</h2>
          <p>You need to be logged in to create a wish tree</p>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="create-tree-container">
    <div className="create-tree-card">
      <div className="tree-icon">
        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h1 className="create-tree-title">Create Your Wish Tree</h1>
      <p className="create-tree-subtitle">Start collecting wishes and dreams from your community</p>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-tree-form">
        <div className="form-group">
          <label htmlFor="treeName">Tree Name *</label>
          <input
            type="text"
            id="treeName"
            value={treeName}
            onChange={(e) => setTreeName(e.target.value)}
            placeholder="e.g., Family Wishes, Birthday Dreams..."
            className="form-input"
            disabled={isLoading}
            maxLength={50}
          />
          <span className="char-count">{treeName.length}/50</span>
        </div>

        <div className="form-group">
          <label htmlFor="collaborators">Collaborators (optional)</label>
          <input
            type="text"
            id="collaborators"
            value={collaborators}
            onChange={(e) => setCollaborators(e.target.value)}
            placeholder="Enter emails separated by commas"
            className="form-input"
            disabled={isLoading}
          />
          <span className="helper-text">Collaborators can add and manage wishes on your tree</span>
        </div>

        <div className="form-group-inline">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="toggle-input"
              disabled={isLoading}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">
              <strong>Public Tree</strong>
              <span className="toggle-description">
                {isPublic ? 'Anyone with the link can view' : 'Only you and collaborators can view'}
              </span>
            </span>
          </label>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75" />
              </svg>
              Creating Tree...
            </>
          ) : (
            <>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Tree
            </>
          )}
        </button>
      </form>
    </div>
  </div>
);
}