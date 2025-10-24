import { useState, useEffect } from 'react';
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

  // Update view based on user state
  useEffect(() => {
    if (user) {
      setView('dashboard');
    } else if (view === 'dashboard') {
      setView('login');
    }
  }, [user, view]);

  const handleInviteCodeValidated = (code, ref, data) => {
    setValidatedCode(code);
    setCodeRef(ref);
    setCodeData(data);
    setView('signin'); 
  };

  // Clear messages when view changes
  useEffect(() => {
    clearMessages();
  }, [view, clearMessages]);

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

  return <UserDashboard user={user} onSignOut={handleSignOut} />;
}