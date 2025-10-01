import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { db } from '../firebase.js';

export const fetchTreeBySlug = async ( slug, userId ) => {

  if (!slug) {
    throw new Error('No tree slug provided');
  }

  if (!userId) {
    throw new Error('User not authenticated');
  }

  console.log(slug);

  try {
    const q = query(
      collection(db, "trees"),
      where("slug", "==", slug)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Tree not found');
    }

    const treeDoc = querySnapshot.docs[0];
    const tree = {
      id: treeDoc.id,
      ...treeDoc.data()
    };

    return tree;

  } catch (err) {
      console.error('Error fetching tree:', err);
      throw err;
  }
}; 
 