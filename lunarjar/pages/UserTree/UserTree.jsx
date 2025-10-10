import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { db } from '../../firebase.js';

import WishForm from '../../components/wish-form/wish-form.jsx';
import WishRender from '../../components/wish-render/wish-render.jsx';
import ShareTree from '../../components/share-tree/share-tree.jsx';
import './UserTree.css'; // Add the CSS file
import { fetchTreeBySlug } from '../../utils/fetchTreeBySlug.js';
import ApricotTreeDemo from '../../components/tree/realtree.jsx';

function UserTree({ isGlobalRender = false, userId, userMail }) {
  const { slug } = useParams();
  const [treeId, setTreeId] = useState(null);
  const [treeName, setTreeName] = useState(null);
  const [loading, setLoading] = useState(!isGlobalRender);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
        const tree = await fetchTreeBySlug(slug, userId);
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
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌳</div>
          <div style={{ fontSize: '18px', color: '#8B0000' }}>Loading your wish tree...</div>
        </div>
      </div>
    );
  }

  if (error && !isGlobalRender) {
    return (
      <ErrorDisplay 
        message={error}
        title="Unable to Load Tree"
        variant="centered"
        showBackButton={true}
        showRefreshButton={true}
        onRefresh={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="user-tree-page">
      {/* Top Section - Wish Tree Visualization */}
      <div className="tree-visualization-section">
        <div className="tree-header">
          <h1 className="tree-title">
            🌸 {treeName || 'Apricot Blossom Wish Tree'} 🌸
          </h1>
          <p className="tree-subtitle">
            Click on the decorations to read wishes!
          </p>
        </div>
        
        {/* Apricot Tree with Decorations */}
        <div className="tree-container">
          <ApricotTreeDemo
            currentTreeId={treeId}
          />
        </div>
      </div>

      {/* Main Content Grid */}
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
          <div className="share-tree-container">
            <ShareTree 
              currentTreeId={treeId}
              slug={slug}
            />
          </div>
        )}

        {/* Bottom right - Wish Render */}
        <div className="wish-render-container">
          <WishRender 
            currentTreeId={treeId} 
            refreshTrigger={refreshKey} 
            isGlobalRender={isGlobalRender}
            treeName={treeName}
            currentUserId={userId}
            currentUserMail={userMail}
          />
        </div>
      </div>
    </div>
  );
}

export default UserTree;