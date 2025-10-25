// utils/userRoles.js

/**
 * User Role Definitions
 */
export const USER_ROLES = {
  GUEST: 'guest',           // Not signed in
  AUTHENTICATED: 'authenticated', // Signed in user
  TREE_OWNER: 'tree_owner',      // Owner of a specific tree
  ADMIN: 'admin'            // Admin privileges
};

/**
 * Permission Definitions
 */
export const PERMISSIONS = {
  // Tree permissions
  VIEW_PUBLIC_TREES: 'view_public_trees',
  VIEW_PRIVATE_TREE_WITH_LINK: 'view_private_tree_with_link',
  CREATE_TREE: 'create_tree',
  DELETE_TREE: 'delete_tree',
  EDIT_TREE: 'edit_tree',
  SHARE_TREE: 'share_tree',
  REGENERATE_INVITE_LINK: 'regenerate_invite_link',
  
  // Wish permissions
  VIEW_WISHES: 'view_wishes',
  CREATE_WISH: 'create_wish',
  EDIT_OWN_WISH: 'edit_own_wish',
  DELETE_OWN_WISH: 'delete_own_wish',
  DELETE_ANY_WISH: 'delete_any_wish',
  
  // Community permissions
  VIEW_COMMUNITY_TREE: 'view_community_tree',
  CONTRIBUTE_TO_COMMUNITY: 'contribute_to_community',
};

/**
 * Role-Permission Matrix
 */
const rolePermissions = {
  [USER_ROLES.GUEST]: [
    PERMISSIONS.VIEW_PUBLIC_TREES,
    PERMISSIONS.VIEW_PRIVATE_TREE_WITH_LINK,
    PERMISSIONS.VIEW_WISHES,
    PERMISSIONS.VIEW_COMMUNITY_TREE,
  ],
  
  [USER_ROLES.AUTHENTICATED]: [
    PERMISSIONS.VIEW_PUBLIC_TREES,
    PERMISSIONS.VIEW_PRIVATE_TREE_WITH_LINK,
    PERMISSIONS.VIEW_WISHES,
    PERMISSIONS.CREATE_TREE,
    PERMISSIONS.CREATE_WISH,
    PERMISSIONS.EDIT_OWN_WISH,
    PERMISSIONS.DELETE_OWN_WISH,
    PERMISSIONS.VIEW_COMMUNITY_TREE,
    PERMISSIONS.CONTRIBUTE_TO_COMMUNITY,
  ],
  
  [USER_ROLES.TREE_OWNER]: [
    PERMISSIONS.VIEW_PUBLIC_TREES,
    PERMISSIONS.VIEW_PRIVATE_TREE_WITH_LINK,
    PERMISSIONS.VIEW_WISHES,
    PERMISSIONS.CREATE_TREE,
    PERMISSIONS.DELETE_TREE,
    PERMISSIONS.EDIT_TREE,
    PERMISSIONS.SHARE_TREE,
    PERMISSIONS.REGENERATE_INVITE_LINK,
    PERMISSIONS.CREATE_WISH,
    PERMISSIONS.EDIT_OWN_WISH,
    PERMISSIONS.DELETE_OWN_WISH,
    PERMISSIONS.DELETE_ANY_WISH,
    PERMISSIONS.VIEW_COMMUNITY_TREE,
    PERMISSIONS.CONTRIBUTE_TO_COMMUNITY,
  ],
  
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS), // All permissions
};

/**
 * Get user's role for a specific tree
 */
export const getUserRole = (user, treeData) => {
  if (!user) {
    return USER_ROLES.GUEST;
  }
  
  // Check if user is admin (you can add admin UIDs to Firebase or config)
  if (isAdmin(user.uid)) {
    return USER_ROLES.ADMIN;
  }
  
  // Check if user owns the tree
  if (treeData && treeData.ownerId === user.uid) {
    return USER_ROLES.TREE_OWNER;
  }
  
  return USER_ROLES.AUTHENTICATED;
};

/**
 * Check if user is admin (implement your own logic)
 */
const isAdmin = (uid) => {
  // You can store admin UIDs in Firebase config or environment variables
  const adminUIDs = import.meta.env.REACT_APP_ADMIN_UIDS?.split(',') || [];
  return adminUIDs.includes(uid);
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (role, permission) => {
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
};

/**
 * Check if user can perform an action on a tree
 */
export const canPerformAction = (user, treeData, permission) => {
  const role = getUserRole(user, treeData);
  return hasPermission(role, permission);
};

/**
 * Check if user can access a tree
 */
export const canAccessTree = (user, treeData, inviteToken = null) => {
  // Safety check
  if (!treeData) {
    return false;
  }

  // Public trees are accessible to everyone
  if (treeData.isPublic === true) {
    return true;
  }
  
  // Tree owner can always access their own tree
  if (user && treeData.ownerId && treeData.ownerId === user.uid) {
    return true;
  }
  
  // Admins can always access
  if (user && isAdmin(user.uid)) {
    return true;
  }
  
  // Private trees with valid invite token
  if (!treeData.isPublic && inviteToken && treeData.inviteToken === inviteToken) {
    return true;
  }
  
  return false;
};

/**
 * Get user's display role name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [USER_ROLES.GUEST]: 'Guest',
    [USER_ROLES.AUTHENTICATED]: 'User',
    [USER_ROLES.TREE_OWNER]: 'Tree Owner',
    [USER_ROLES.ADMIN]: 'Admin',
  };
  return roleNames[role] || 'Unknown';
};

/**
 * Hook to check permissions (use in components)
 */
export const usePermissions = (user, treeData) => {
  const role = getUserRole(user, treeData);
  
  return {
    role,
    roleDisplayName: getRoleDisplayName(role),
    can: (permission) => hasPermission(role, permission),
    canAccessTree: (inviteToken) => canAccessTree(user, treeData, inviteToken),
  };
};