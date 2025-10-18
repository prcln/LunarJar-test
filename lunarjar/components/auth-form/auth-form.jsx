import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../../firebase.js';

import '../../styles/public/auth.css'
import { GoogleIcon } from '../../utils/icon/GoogleIcon.jsx';

export default function AuthComponent() {
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot', 'dashboard'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setView('dashboard');
      } else {
        setView('login');
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Clear messages when view changes
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [view]);

  // Error message helper
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
      'auth/network-request-failed': 'Network error. Please check your connection.'
    };
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      .then(() => {
        setSuccess('Successfully signed in!');
      })
      .catch((err) => {
        setError(getErrorMessage(err.code));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle signup
  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate passwords
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    setLoading(true);
    
    createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
      .then((userCredential) => {
        return sendEmailVerification(userCredential.user);
      })
      .then(() => {
        setSuccess('Account created successfully! Please check your email to verify your account.');
        setSignupEmail('');
        setSignupPassword('');
        setConfirmPassword('');
      })
      .catch((err) => {
        setError(getErrorMessage(err.code));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle Google sign-in
  const handleGoogleSignIn = () => {
    setError('');
    setLoading(true);
    
    const provider = new GoogleAuthProvider();
    
    // Try popup first, fallback to redirect if blocked
    signInWithPopup(auth, provider)
      .then(() => {
        setSuccess('Successfully signed in with Google!');
      })
      .catch((err) => {
        // If popup is blocked, inform user or use redirect
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
          setError('Popup blocked. Redirecting to Google sign-in...');
          // Use redirect as fallback
          import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js')
            .then(({ signInWithRedirect }) => {
              signInWithRedirect(auth, provider);
            });
        } else {
          setError(getErrorMessage(err.code));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setSuccess('Successfully signed out!');
      })
      .catch(() => {
        setError('Error signing out. Please try again.');
      });
  };

  // Google icon SVG
  GoogleIcon();

  // Login Form
  if (view === 'login') {
    return (
      <div className="auth-container">
        <div className="auth-form active">
          <h2>Welcome Back</h2>
          
          <button 
            type="button" 
            className="btn btn-google"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <div>
            <div className="form-group">
              <label htmlFor="loginEmail">Email Address</label>
              <input 
                type="email" 
                id="loginEmail"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="loginPassword">Password</label>
              <input 
                type="password" 
                id="loginPassword"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : 'Sign In'}
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
          
          <div className="toggle-text">
            Don't have an account? <span className="toggle-link" onClick={() => setView('signup')}>Sign up here</span>
          </div>
        </div>
      </div>
    );
  }

  // Signup Form
  if (view === 'signup') {
    return (
      <div className="auth-container">
        <div className="auth-form active">
          <h2>Create Account</h2>
          
          <button 
            type="button" 
            className="btn btn-google"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <div>
            <div className="form-group">
              <label htmlFor="signupEmail">Email Address</label>
              <input 
                type="email" 
                id="signupEmail"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signupPassword">Password</label>
              <input 
                type="password" 
                id="signupPassword"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : 'Create Account'}
            </button>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </div>
          
          <div className="toggle-text">
            Already have an account? <span className="toggle-link" onClick={() => setView('login')}>Sign in here</span>
          </div>
        </div>
      </div>
    );
  }

  // User Dashboard
  return (
    <div className="auth-container">
      <div className="auth-form active">
        <div className="user-info show">
          {user?.photoURL && (
            <img 
              className="user-avatar" 
              src={user.photoURL} 
              alt="User Avatar"
            />
          )}
          <h3>{user?.displayName ? `Welcome, ${user.displayName}!` : 'Welcome!'}</h3>
          <p>{user?.email}</p>
          <p>
            <strong>Status:</strong>{' '}
            <span style={{ color: user?.emailVerified ? '#27ae60' : '#e74c3c' }}>
              {user?.emailVerified ? 'Verified ✓' : 'Not Verified (Check your email)'}
            </span>
          </p>
        </div>
        <button className="btn btn-danger" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}