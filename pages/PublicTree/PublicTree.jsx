import { useState, useEffect } from 'react';

import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { db } from '../../firebase.js';

import WishForm from '../../components/wish-form/wish-form.jsx';
import WishRender from '../../components/wish-render/wish-render.jsx';
import ShareTree from '../../components/share-tree/share-tree.jsx';
import './UserTree.css'; // Add the CSS file
import { fetchTreeBy } from '../../utils/fetchTreeBySlug.js';

function PublicTree({ isGlobalRender = false, userId, userMail }) {
  const slug = import.meta.env.VITE_COMMUNITY_TREE_ID;
  const [treeId, setTreeId] = useState(null);
  const [treeName, setTreeName] = useState(null);
  const [loading, setLoading] = useState(!isGlobalRender);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  console.log(slug);
  const handleWishSubmitted = () => {
    console.log('🔄 Refreshing wishes...');
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    if (isGlobalRender) {
      setLoading(false);
      return;
    }

    const loadTree = async () => {
      try {
        setLoading(true);
        const tree = await fetchTreeBy(slug, userId);
        setTreeId(tree.id);
        setTreeName(tree.name);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load tree');
      } finally {
        setLoading(false);
      }
    };

    loadTree();
  }, [slug, userId, isGlobalRender]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        Loading tree... 🌳
      </div>
    );
  }

  if (error && !isGlobalRender) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px', color: '#e53e3e', marginBottom: '20px' }}>
          {error}
        </div>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="form-render-page">
      {/* Left side - Wish Form */}
      <div className="wish-form-container">
        <WishForm 
          currentTreeId={treeId} 
          onSubmitSuccess={handleWishSubmitted} 
        />
      </div>

      {/* Top right - Share Tree */}
      {!isGlobalRender && (
        <ShareTree 
        currentTreeId={treeId}
        slug={slug}
        />
      )}

      {/* Bottom right - Wish Render */}
      <WishRender 
        currentTreeId={treeId} 
        refreshTrigger={refreshKey} 
        isGlobalRender={isGlobalRender}
        treeName={treeName}
        currentUserId={userId}
        currentUserMail={userMail}
      />
    </div>
  );
}

export default PublicTree;