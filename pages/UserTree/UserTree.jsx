import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { nanoid } from 'nanoid';

// Project Imports
import { db, auth } from '../../firebase.js';
import WishForm from '../../components/wish-form/wish-form.jsx';
import WishRender from '../../components/wish-render/wish-render.jsx';
import ShareModal from '../../components/share-modal/ShareModal.jsx';
import ErrorDisplay from '../../components/errordisplay/errordisplay.jsx';
import ApricotTreeDemo from '../../components/tree/realtree.jsx';
import './UserTree.css';

/**
 * Main component for displaying a user's wish tree page.
 * It handles fetching tree data, authentication, and rendering wishes.
 */
function UserTree() {
  const { slug } = useParams();

  // --- State Management ---
  const [user, setUser] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishRefreshTrigger, setWishRefreshTrigger] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0);


  // --- Hooks ---

  // Effect for handling user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    // Set up an interval to decrease the cooldown every second
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    // Clean up the interval when the component unmounts or cooldown reaches 0
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
    let unsubscribe = () => {}; // Initialize an empty unsubscribe function

    const setupListener = async () => {
      try {
        // First, find the tree's document ID using its slug
        const treesRef = collection(db, 'trees');
        const q = query(treesRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("This Wish Tree could not be found.");
        }

        const treeDoc = querySnapshot.docs[0];
        const treeDocRef = doc(db, 'trees', treeDoc.id);

        // Now, set up the real-time listener on that document
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

    // Cleanup: unsubscribe from the listener when the component unmounts or the slug changes
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

      // Start a 30-second cooldown after success
      setCooldown(30);

    } catch (err) {
      console.error("Error regenerating link:", err);
      // Optionally show an error to the user
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
      <div className="tree-visualization-section">
        <div className="tree-header">
          <h1 className="tree-title">🌸 {treeData?.name || 'Apricot Blossom Wish Tree'} 🌸</h1>
          <p className="tree-subtitle">Click on the decorations to read wishes!</p>
        </div>
        <div className="tree-container">
          <ApricotTreeDemo currentTreeId={treeData?.id} refreshTrigger={wishRefreshTrigger} />
        </div>
      </div>

      <div className="form-render-page">
        <div className="wish-form-container">
          <WishForm currentTreeId={treeData?.id} onSubmitSuccess={handleWishSubmitted} /> 
        </div>
        <div className="wish-render-container">
          <WishRender 
            currentTreeId={treeData?.id} 
            refreshTrigger={wishRefreshTrigger} 
            treeName={treeData?.name}
            currentUserId={user?.uid}
          />
        </div>
        <button onClick={() => setIsShareModalOpen(true)} className="share-tree-button">
          Share Tree
        </button>
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          treeData={treeData}
          user={user}
          onRegenerateInviteLink={handleRegenerateInviteLink}
          isRegenerating={isRegenerating}
          cooldown={cooldown}
        />
      </div>
    </div>
  );
}

export default UserTree;