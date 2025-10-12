import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
      'auth/popup-blocked': 'Popup was blocked. Please allow popups and try again.',
      'auth/popup-closed-by-user': 'Sign-in was cancelled.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials.'
    };
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  };

  const handleEmailLogin = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess('Successfully signed in!');
      return true;
    } catch (err) {
      setError(getErrorMessage(err.code));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (email, password, confirmPassword) => {
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setSuccess('Account created successfully! Please check your email to verify your account.');
      return true;
    } catch (err) {
      setError(getErrorMessage(err.code));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      setSuccess('Successfully signed in with Google!');
      return true;
    } catch (err) {
      setError(getErrorMessage(err.code));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new FacebookAuthProvider();
    
    // Option 1: Request only public_profile (no email)
    // provider.addScope('public_profile');
    
    // Option 2: Request email + public_profile (recommended - default)
    provider.addScope('email');
    provider.addScope('public_profile');
    
    // Optional: Set custom parameters
    provider.setCustomParameters({
      'display': 'popup'
    });
    
    try {
      await signInWithPopup(auth, provider);
      setSuccess('Successfully signed in with Facebook!');
      return true;
    } catch (err) {
      setError(getErrorMessage(err.code));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSuccess('Successfully signed out!');
      return true;
    } catch (err) {
      setError('Error signing out. Please try again.');
      return false;
    }
  };

  const handlePasswordReset = async (email) => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Check your inbox.');
      return true;
    } catch (err) {
      setError(getErrorMessage(err.code));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return {
    user,
    loading,
    error,
    success,
    handleEmailLogin,
    handleEmailSignup,
    handleGoogleSignIn,
    handleFacebookSignIn,
    handleSignOut,
    handlePasswordReset,
    clearMessages
  };
};