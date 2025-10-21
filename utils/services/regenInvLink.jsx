import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Your Firebase setup
import { generateUniqueToken } from '../generateToken';

// This function is in your parent component (e.g., TreePage.jsx)
export const handleRegenerate = async (treeId) => {
  if (!treeId) return;

  // 1. Generate the new token
  const newToken = generateUniqueToken();

  // 2. Get a reference to the tree document in Firestore
  const treeDocRef = doc(db, 'trees', treeId);

  try {
    // 3. Update only the inviteToken field in the database
    await updateDoc(treeDocRef, {
      inviteToken: newToken
    });
    alert("Success! A new invite link has been generated.");
  } catch (error) {
    console.error("Error regenerating link:", error);
    alert("Could not generate a new link. Please try again.");
  }
};