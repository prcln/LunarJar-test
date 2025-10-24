import { useState } from 'react';
import { GoogleIcon, FacebookIcon } from '../../utils/Icons';
import PasswordInput from './PasswordInput/PasswordInput';

export default function SignupForm({ 
  onSignup, 
  onGoogleSignIn,
  onFacebookSignIn, 
  onSwitchToLogin, 
  loading, 
  error, 
  success 
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onSignup(email, password, confirmPassword);
    if (result) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form active">
        <h2>Create Account</h2>
        
        <button 
          type="button" 
          className="btn btn-google"
          onClick={onGoogleSignIn}
          disabled={loading}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <button 
          type="button" 
          className="btn btn-facebook"
          onClick={onFacebookSignIn}
          disabled={loading}
        >
          <FacebookIcon />
          Continue with Facebook
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signupEmail">Email Address</label>
            <input 
              type="email" 
              id="signupEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="signupPassword">Password</label>
            <input 
              type="password" 
              id="signupPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <PasswordInput
              type="password" 
              id="confirmPassword"
              value={confirmPassword}
              placeholder="Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button 
            type="submit"
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? <span className="loading"></span> : 'Create Account'}
          </button>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </form>
        
        <div className="toggle-text">
          Already have an account? <span className="toggle-link" onClick={onSwitchToLogin}>Sign in here</span>
        </div>
      </div>
    </div>
  );
}