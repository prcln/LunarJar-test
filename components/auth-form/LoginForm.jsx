import { useState } from 'react';
import { GoogleIcon, FacebookIcon } from '../../utils/Icons';
import { validateInviteCode } from '../../alpha-testing/validate-code';
import PasswordInput from './PasswordInput/PasswordInput';

export default function LoginForm({ 
  onLogin, 
  onGoogleSignIn, 
  onFacebookSignIn,
  onSwitchToSignup,
  onSwitchToInviteCode,
  onSwitchToForgotPassword, 
  loading, 
  error 
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');



  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="auth-container">
      <div className="auth-form active">
        <h2> {import.meta.env.VITE_ALPHASTAGE !== 'true' ? 'Welcome Back' : 'Welcome to Alpha Testing'} </h2>
        { import.meta.env.VITE_ALPHASTAGE !== 'true' && (<div>
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
      </div>)}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="loginEmail">Email Address</label>
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
              type="password" 
              id="loginPassword"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="forgot-password-link">
              <span className="toggle-link" onClick={onSwitchToForgotPassword}>
                Forgot password?
              </span>
            </div>
          </div>
          <button 
            type="submit"
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? <span className="loading"></span> : 'Sign In'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>
        
        <div className="toggle-text">
          Don't have an account? 
          {
          import.meta.env.VITE_ALPHASTAGE !== 'true' && (
            <span className="toggle-link" onClick={onSwitchToSignup}>
              Sign up here
            </span>
          )
          }
          <span className="toggle-link" onClick={onSwitchToInviteCode}>Sign up with invite code</span>
        </div>
      </div>
    </div>
  );
}