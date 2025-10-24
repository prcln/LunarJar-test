import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useUserAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userProfileRef = doc(db, 'users', currentUser.uid);
        const userProfileSnap = await getDoc(userProfileRef);

        if (userProfileSnap.exists()) {
          // ✅ Handles a fully registered user
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            ...userProfileSnap.data()
          });
        } else {
          // ✨ FIX: Handles a "pending" user who is authenticated
          // but doesn't have a profile in the database yet.
          setUser({
            uid: currentUser.uid,
            email: currentUser.email
          });
        }
      } else {
        // ✅ Handles a logged-out user
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}