import { useState } from 'react';

export default function ForgotPasswordForm({ 
  onPasswordReset, 
  onSwitchToLogin, 
  loading, 
  error, 
  success 
}) {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onPasswordReset(email);
    if (result) {
      setEmail('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form active">
        <h2>Reset Password</h2>
        <p className="forgot-description">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="resetEmail">Email Address</label>
            <input 
              type="email" 
              id="resetEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <button 
            type="submit"
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? <span className="loading"></span> : 'Send Reset Link'}
          </button>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </form>
        
        <div className="toggle-text">
          Remember your password? <span className="toggle-link" onClick={onSwitchToLogin}>Sign in here</span>
        </div>
      </div>
    </div>
  );
}