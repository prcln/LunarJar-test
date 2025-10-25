// hooks/useProtectedRoute.js
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook to handle protected routes and redirects
 */
export const useProtectedRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Redirect to login with current page as return URL
   * @param {string} customPath - Optional custom path to redirect to after login
   */
  const redirectToLogin = (customPath = null) => {
    const returnUrl = customPath || location.pathname + location.search;
    navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
  };

  /**
   * Redirect to signup with current page as return URL
   * @param {string} customPath - Optional custom path to redirect to after signup
   */
  const redirectToSignup = (customPath = null) => {
    const returnUrl = customPath || location.pathname + location.search;
    navigate(`/signup?redirect=${encodeURIComponent(returnUrl)}`);
  };

  /**
   * Navigate to a path with state for redirect
   * @param {string} path - Path to navigate to
   * @param {Object} options - Additional navigation options
   */
  const navigateWithState = (path, options = {}) => {
    navigate(path, {
      state: { from: location.pathname + location.search },
      ...options
    });
  };

  return {
    redirectToLogin,
    redirectToSignup,
    navigateWithState,
    currentPath: location.pathname + location.search
  };
};

/**
 * Component to protect routes that require authentication
 */
export const RequireAuth = ({ children, user, fallback = null }) => {
  const { redirectToLogin } = useProtectedRoute();

  if (!user) {
    redirectToLogin();
    return fallback || <div>Redirecting to login...</div>;
  }

  return children;
};