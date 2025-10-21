// getUserTreeRoleHK.js
import { useState, useEffect } from "react";
import { getUserTreeRole } from "../utils/checkPerm";

export function getUserTreeRoleHK(currentUserId, currentTreeId, currentUserMail) {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      if (currentUserId && currentTreeId) {
        const role = await getUserTreeRole(currentUserId, currentTreeId, currentUserMail);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    };
    checkRole();
  }, [currentUserId, currentTreeId, currentUserMail]);

  return userRole;
};

import { canDeleteWish } from "../utils/checkPerm";

export function useWishPermissions(wishes, currentUserId) {
  const [wishPermissions, setWishPermissions] = useState({});
  
  useEffect(() => {
    const checkWishPermissions = async () => {
      if (!currentUserId || wishes.length === 0) return;

      const permissions = {};
      
      for (const wish of wishes) {
        const canDelete = await canDeleteWish(currentUserId, wish.id, wish.treeId);
        permissions[wish.id] = { canDelete };
      }
      
      setWishPermissions(permissions);
      console.log('🔐 Wish permissions calculated:', permissions);
    };

    checkWishPermissions();
  }, [wishes, currentUserId]);

  return wishPermissions;
};
