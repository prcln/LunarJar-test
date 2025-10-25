import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import UserDashboard from './UserDashboard';
import ForgotPasswordForm from './ForgotPasswordForm';
import './auth.css';
import InviteCodeForm from './InviteCodeForm';

export default function AuthComponent() {
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot', 'dashboard', 'invitecode'
  const [validatedCode, setValidatedCode] = useState(null);
  const [codeRef, setCodeRef] = useState(null);
  const [codeData, setCodeData] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Get redirect URL from query params or location state
  const redirectUrl = searchParams.get('redirect') || location.state?.from || '/me/trees';

  const {
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
  } = useAuth();

  // Update view and handle redirect when user logs in
  useEffect(() => {
    if (user) {
      // User is logged in
      if (view !== 'dashboard') {
        // Redirect to the intended page
        navigate(redirectUrl, { replace: true });
      }
    } else if (view === 'dashboard') {
      // User logged out, switch back to login
      setView('login');
    }
  }, [user, view, navigate, redirectUrl]);

  const handleInviteCodeValidated = (code, ref, data) => {
    setValidatedCode(code);
    setCodeRef(ref);
    setCodeData(data);
    setView('signup'); // Switch to signup after invite code validation
  };

  // Clear messages when view changes
  useEffect(() => {
    clearMessages();
  }, [view, clearMessages]);

  // Show loading state while checking auth
  if (loading && !user && view === 'login') {
    return (
      <div className="auth-loading">
        <div className="loading-spinner">🌳</div>
        <p>Loading...</p>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <LoginForm
        onLogin={handleEmailLogin}
        onGoogleSignIn={handleGoogleSignIn}
        onFacebookSignIn={handleFacebookSignIn}
        onSwitchToSignup={() => setView('signup')}
        onSwitchToInviteCode={() => setView('invitecode')}
        onSwitchToForgotPassword={() => setView('forgot')}
        loading={loading}
        error={error}
      />
    );
  }

  if (view === 'signup') {
    return (
      <SignupForm
        onSignup={handleEmailSignup}
        onGoogleSignIn={handleGoogleSignIn}
        onFacebookSignIn={handleFacebookSignIn}
        onSwitchToLogin={() => setView('login')}
        loading={loading}
        error={error}
        success={success}
        inviteCode={validatedCode}
        codeRef={codeRef}
        codeData={codeData}
      />
    );
  }

  if (view === 'forgot') {
    return (
      <ForgotPasswordForm
        onPasswordReset={handlePasswordReset}
        onSwitchToLogin={() => setView('login')}
        loading={loading}
        error={error}
        success={success}
      />
    );
  }

  if (view === 'invitecode') {
    return (
      <InviteCodeForm
        onValidated={handleInviteCodeValidated}
        onSwitchToLogin={() => setView('login')}
        loading={loading}
        error={error}
      />
    );
  }

  return;
}