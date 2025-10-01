
import { doc, getDoc, getDocs, query, collection, where } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { db } from '../firebase.js';


// ==================== ADMIN CHECKS ====================

/**
 * List of admin user IDs (hardcoded for quick access)
 * Add your user ID here for testing
 */
const ADMIN_USER_IDS = [
  // 'your-firebase-user-id-here',
  //'Zsrixv8t5cX0GOyQ7h0r6mu3ZDC3'
];

/**
 * Check if user is a global admin
 * Admins can: delete any wish, manage any tree, access admin dashboard
 */
export const isUserAdmin = async (userId) => {
  if (!userId) return false;
  
  // Check hardcoded list first (faster)
  if (ADMIN_USER_IDS.includes(userId)) {
    console.log('✅ User is admin (hardcoded):', userId);
    return true;
  }
  
  // Check Firestore
  try {

    const q = query(
      collection(db, "users"),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);

    // Check if any documents were found
    if (querySnapshot.empty) {
      console.log("No user found");
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const isAdmin = userData.isAdmin === true || userData.role === 'admin';
    
    if (isAdmin) {
      console.log('✅ User is admin (Firestore):', userId);
    }
    
    return isAdmin;
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return false;
  }
};

// ==================== OWNER CHECKS ====================

/**
 * Check if user is the owner of a specific tree
 * Owners can: edit tree settings, delete tree, manage collaborators
 */
export const isTreeOwner = async (userId, treeId) => {
  if (!userId || !treeId) return false;
  
  try {
    const treeDoc = await getDoc(doc(db, 'trees', treeId));
    if (!treeDoc.exists()) return false;
    
    const treeData = treeDoc.data();
    const isOwner = treeData.ownerId === userId;
    
    console.log('🌳 Owner check:', { userId, treeId, isOwner });
    return isOwner;
  } catch (error) {
    console.error('❌ Error checking tree owner:', error);
    return false;
  }
};

/**
 * Check if user owns a specific wish
 */
export const isWishOwner = async (userId, wishId) => {
  if (!userId || !wishId) return false;
  
  try {
    const wishDoc = await getDoc(doc(db, 'wishes', wishId));
    if (!wishDoc.exists()) return false;
    
    const wishData = wishDoc.data();
    return wishData.userId === userId;
  } catch (error) {
    console.error('❌ Error checking wish owner:', error);
    return false;
  }
};

// ==================== COLLABORATOR CHECKS ====================

/**
 * Check if user is a collaborator on a specific tree
 * Collaborators can: add wishes, view private trees
 */
export const isTreeCollaborator = async (userId,userMail, treeId) => {
  if (!userMail || !treeId) return false;
  
  try {
    const treeDoc = await getDoc(doc(db, 'trees', treeId));
    if (!treeDoc.exists()) return false;
    
    const treeData = treeDoc.data();
    const collaborators = treeData.collaborators || [];
    
    // Debug
    console.log(collaborators);
    console.log(userMail);

    const isCollaborator = collaborators.includes(userMail);
    console.log('🤝 Collaborator check:', { userMail, treeId, isCollaborator });
    
    return isCollaborator;
  } catch (error) {
    console.error('❌ Error checking collaborator status:', error);
    return false;
  }
};

// ==================== COMBINED PERMISSION CHECKS ====================

/**
 * Check if user has any access to a tree (owner OR collaborator)
 */
export const hasTreeAccess = async (userId, treeId) => {
  if (!userId || !treeId) return false;
  
  const [isOwner, isCollaborator] = await Promise.all([
    isTreeOwner(userId, treeId),
    isTreeCollaborator(userId, treeId)
  ]);
  
  return isOwner || isCollaborator;
};

/**
 * Check if user can edit a tree (owner only, or admin)
 */
export const canEditTree = async (userId, treeId) => {
  if (!userId || !treeId) return false;
  
  const [isAdmin, isOwner] = await Promise.all([
    isUserAdmin(userId),
    isTreeOwner(userId, treeId)
  ]);
  
  return isAdmin || isOwner;
};

/**
 * Check if user can delete a wish
 * Rules: Admin can delete any wish, users can delete their own wishes, tree owner can delete wishes on their tree
 */
export const canDeleteWish = async (userId, wishId, treeId) => {
  if (!userId || !wishId) return false;
  
  const [isAdmin, isWishCreator, isOwner] = await Promise.all([
    isUserAdmin(userId),
    isWishOwner(userId, wishId),
    treeId ? isTreeOwner(userId, treeId) : Promise.resolve(false)
  ]);
  
  const canDelete = isAdmin || isWishCreator || isOwner;
  console.log('🗑️ Delete permission:', { userId, wishId, canDelete, reason: {
    isAdmin,
    isWishCreator, 
    isTreeOwner: isOwner
  }});
  
  return canDelete;
};

/**
 * Check if user can add wishes to a tree
 * Rules: Anyone can add to public trees, only owner/collaborators can add to private trees
 */
export const canAddWish = async (userId, treeId) => {
  if (!treeId) return false;
  
  try {
    const treeDoc = await getDoc(doc(db, 'trees', treeId));
    if (!treeDoc.exists()) return false;
    
    const treeData = treeDoc.data();
    
    // If tree is public, anyone can add wishes
    if (treeData.isPublic === true) return true;
    
    // If tree is private, check access
    if (!userId) return false;
    
    return await hasTreeAccess(userId, treeId);
  } catch (error) {
    console.error('❌ Error checking add wish permission:', error);
    return false;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get user's role on a specific tree
 * Returns: 'admin' | 'owner' | 'collaborator' | 'viewer' | null
 */
export const getUserTreeRole = async (userId, treeId, userMail) => {
  if (!userId || !treeId) return null;
  
  const [isAdmin, isOwner, isCollaborator] = await Promise.all([
    isUserAdmin(userId),
    isTreeOwner(userId, treeId),
    isTreeCollaborator(userId, userMail, treeId)
  ]);
  
  if (isAdmin) return 'admin';
  if (isOwner) return 'owner';
  if (isCollaborator) return 'collaborator';
  
  return 'viewer';
};

/**
 * Get all permissions for a user on a specific tree
 * Returns object with all permission booleans
 */
export const getTreePermissions = async (userId, treeId) => {
  if (!userId || !treeId) {
    return {
      canView: true,
      canAddWish: false,
      canEdit: false,
      canDelete: false,
      canManageCollaborators: false,
      role: null
    };
  }
  
  const [
    isAdmin,
    isOwner,
    isCollaborator,
    canAdd
  ] = await Promise.all([
    isUserAdmin(userId),
    isTreeOwner(userId, treeId),
    isTreeCollaborator(userId, userMail, treeId),
    canAddWish(userId, treeId)
  ]);
  
  const role = isAdmin ? 'admin' : isOwner ? 'owner' : isCollaborator ? 'collaborator' : 'viewer';
  
  return {
    canView: true,
    canAddWish: canAdd,
    canEdit: isAdmin || isOwner,
    canDelete: isAdmin || isOwner,
    canManageCollaborators: isAdmin || isOwner,
    isAdmin,
    isOwner,
    isCollaborator,
    role
  };
};