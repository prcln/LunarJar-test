import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import PasswordInput from './PasswordInput/PasswordInput';



export default function InviteCodeForm({
  onLogin, 
  onGoogleSignIn, 
  onFacebookSignIn,
  onSwitchToLogin,
  onSwitchToForgotPassword, 
  loading: externalLoading,
  error: externalError 
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateInviteCode = async (code) => {
    if (!code || code.trim() === '') {
      return { valid: false, error: 'Invite code is required' };
    }

    try {
      const codeRef = doc(db, 'inviteCodes', code.toUpperCase());
      const codeDoc = await getDoc(codeRef);

      if (!codeDoc.exists()) {
        return { valid: false, error: 'Invalid invite code' };
      }

      const codeData = codeDoc.data();

      if (codeData.used && codeData.maxUses === 1) {
        return { valid: false, error: 'This invite code has already been used' };
      }

      if (codeData.maxUses && codeData.usedCount >= codeData.maxUses) {
        return { valid: false, error: 'This invite code has reached its usage limit' };
      }

      return { valid: true, codeRef, codeData };
    } catch (err) {
      console.error('Error validating invite code:', err);
      return { valid: false, error: 'Error validating invite code' };
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true);

    try {
      // Validate invite code first
      const validation = await validateInviteCode(inviteCode);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Mark invite code as used
      await updateDoc(validation.codeRef, {
        used: true,
        usedBy: user.uid,
        usedAt: serverTimestamp(),
        usedCount: (validation.codeData.usedCount || 0) + 1
      });

      // Store user data with invite code info
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        inviteCode: inviteCode.toUpperCase(),
        createdAt: serverTimestamp(),
        role: 'alpha-tester'
      });

      // Success! User is created and logged in
      console.log('User created successfully');
    } catch (err) {
      console.error('Signup error:', err);
      
      // Handle Firebase auth errors
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'An error occurred during sign up.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="text-2xl font-bold mb-6">Sign Up - Alpha Testing</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py8 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp}>
        <div className="form-group">
          <label htmlFor="loginEmail">Email</label>
          <input
            type="text"
            id="loginEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="loginPassword">Password</label>
            <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            />
        </div>

        <div className="form-group">
          <label htmlFor="inviteCode">Invite Code</label>
            <input
            id="inviteCode"
            type="inviteCode"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="ALPHA2025"
            required
            />

          <p className="text-sm text-gray-500 mt-1">
            Don't have an invite code? <a className="toggle-link" href="https://www.facebook.com/hac.nt.92/" target="_blank">Contact us</a> for access.
          </p>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <div className="toggle-text">
          Already have an account? <span className="toggle-link" onClick={onSwitchToLogin}>Sign in here</span>
        </div>
      </form>
    </div>
  );
}