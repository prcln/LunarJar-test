import { db } from '../../firebase.js';
import { collection, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Create a new tree for the current user
async function createUserTree(treeName, description) {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  try {
    const treeData = {
      ownerId: user.uid,
      name: treeName,
      description: description,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'trees'), treeData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating tree:', error);
  }
}