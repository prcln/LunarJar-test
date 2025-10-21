import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the import path as needed

export default function ShortLinkRedirectPage() {
  const { shortId } = useParams(); // 1. Get the shortId from the URL
  const navigate = useNavigate(); // 2. Get the navigation function

  useEffect(() => {
    const findTreeAndRedirect = async () => {
      if (!shortId) {
        navigate('/'); // Redirect home if no ID is present
        return;
      }

      // 3. Query Firestore for the tree with the matching shortId
      const treesRef = collection(db, 'trees');
      const q = query(treesRef, where('inviteToken', '==', shortId), limit(1));
      
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 4. If a tree is found, get its slug
        const treeData = querySnapshot.docs[0].data();
        const slug = treeData.slug;
        
        // 5. Redirect the user to the full URL
        navigate(`/tree/${slug}`, { replace: true });
      } else {
        // 6. If no tree is found, redirect to a "not found" page or home
        console.error('No tree found for shortId:', shortId);
        navigate('/not-found', { replace: true });
      }
    };

    findTreeAndRedirect();
  }, [shortId, navigate]);

  // 7. Display a loading message while the lookup happens
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Finding your Wish Tree...</h2>
    </div>
  );
}