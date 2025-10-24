import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';

// Project Imports
import { db } from '../../firebase.js';
import WishRender from '../../components/wish-render/wish-render.jsx';
import ShareModal from '../../components/share-modal/ShareModal.jsx';
import ErrorDisplay from '../../components/errordisplay/errordisplay.jsx';
import ApricotTreeDemo from '../../components/tree/realtree.jsx';
import WishFormModal from '../../components/wish-form-modal/wish-form-modal.jsx';
import { useUserAuth } from '../../context/AuthContext.jsx';
import './UserTree.css';

/**
 * Main component for displaying a user's wish tree page.
 * It handles fetching tree data, authentication, and rendering wishes.
 */
function UserTree() {
  const { slug } = useParams();

  // --- State Management ---
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishRefreshTrigger, setWishRefreshTrigger] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { user } = useUserAuth();

  // --- Hooks ---
  // Invite Link Regen Timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // Effect for fetching and listening to tree data in real-time
  useEffect(() => {
    if (!slug) {
      setError('No tree specified in the URL.');
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe = () => {};

    const setupListener = async () => {
      try {
        const treesRef = collection(db, 'trees');
        const q = query(treesRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("This Wish Tree could not be found.");
        }

        const treeDoc = querySnapshot.docs[0];
        const treeDocRef = doc(db, 'trees', treeDoc.id);

        unsubscribe = onSnapshot(treeDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setTreeData({ id: docSnap.id, ...docSnap.data() });
            setError(null);
          } else {
            throw new Error("This Wish Tree no longer exists.");
          }
          setLoading(false);
        }, (err) => {
            console.error("Error with Firestore listener:", err);
            setError("Could not connect to the Wish Tree data.");
            setLoading(false);
        });

      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    setupListener();

    return () => unsubscribe();
  }, [slug]);

  // --- Event Handlers ---
  const handleWishSubmitted = () => {
    setWishRefreshTrigger(prev => prev + 1);
  };

  const handleRegenerateInviteLink = useCallback(async () => {
    if (isRegenerating || cooldown > 0 || !treeData?.id) return;
    
    setIsRegenerating(true);
    
    try {
      const newToken = nanoid(10);
      const treeDocRef = doc(db, 'trees', treeData.id);
      await updateDoc(treeDocRef, { inviteToken: newToken });
      setCooldown(30);
    } catch (err) {
      console.error("Error regenerating link:", err);
    } finally {
      setIsRegenerating(false);
    }
  }, [treeData?.id, isRegenerating, cooldown]);

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-icon">🌳</div>
          <div className="loading-text">Loading your wish tree...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay 
        message={error}
        title="Unable to Load Tree"
        onRefresh={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="user-tree-page">
      {/* Tree Visualization */}
      <div className="tree-visualization-section">
        <div className="tree-header">
          <h1 className="tree-title">🌸 {treeData?.name || 'Apricot Blossom Wish Tree'} 🌸</h1>
          <p className="tree-subtitle">Click on the decorations to read wishes!</p>
        </div>
        <div className="tree-container">
          <ApricotTreeDemo currentTreeId={treeData?.id} refreshTrigger={wishRefreshTrigger} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="options-container">
        <button onClick={() => setIsShareModalOpen(true)} className="action-button">
          Share Tree
        </button>
        <button onClick={() => setIsFormModalOpen(true)} className="action-button">
          Send a Wish
        </button>
      </div>

      {/* Wish Render */}
      <div className="wish-render-container">
        <WishRender 
          currentTreeId={treeData?.id} 
          refreshTrigger={wishRefreshTrigger} 
          treeName={treeData?.name}
          currentUserId={user?.uid}
        />
      </div>

      {/* Modals */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        treeData={treeData}
        user={user}
        onRegenerateInviteLink={handleRegenerateInviteLink}
        isRegenerating={isRegenerating}
        cooldown={cooldown}
      />
      <WishFormModal
        currentTreeId={treeData.id}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmitSuccess={handleWishSubmitted}
      />
    </div>
  );
}

export default UserTree;