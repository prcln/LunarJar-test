// utils/checkAdmin.js
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { db } from '../firebase.js';

/**
 * Check if a user is an admin
 * @param {string} userId - The user's ID
 * @returns {Promise<boolean>} - True if user is admin
 */
export const checkIsAdmin = async (userId) => {
  if (!userId) return false;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.log('❌ User document not found:', userId);
      return false;
    }
    
    const userData = userDoc.data();
    const isAdmin = userData.isAdmin === true || userData.role === 'admin';
    console.log('🔍 Checking admin for user:', userId, 'Result:', isAdmin);
    return isAdmin;
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return false;
  }
};

/**
 * List of admin user IDs (fallback/override method)
 * Add your user ID here for quick testing
 */
const ADMIN_USER_IDS = [
  // 'your-firebase-user-id-here',
  // 'another-admin-id',
  'Zsrixv8t5cX0GOyQ7h0r6mu3ZDC3'
];

/**
 * Quick check if user ID is in hardcoded admin list
 */
export const isAdminById = (userId) => {
  return ADMIN_USER_IDS.includes(userId);
};

/**
 * Comprehensive admin check (checks both Firestore and hardcoded list)
 */
export const isUserAdmin = async (userId) => {
  if (!userId) {
    console.log('❌ No userId provided to isUserAdmin');
    return false;
  }
  
  console.log('🔍 Checking if user is admin:', userId);
  
  // Check hardcoded list first (faster)
  if (isAdminById(userId)) {
    console.log('✅ User is admin (hardcoded list)');
    return true;
  }
  
  // Then check Firestore
  const result = await checkIsAdmin(userId);
  console.log('✅ User admin check result:', result);
  return result;
};