import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { auth } from '../../firebase.js';
import './Navbar.css';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { t, language, setLanguage } = useLanguage();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Wish Tree
        </Link>

        {/* Desktop Menu */}
        <div className="desktop-menu">
          <Link to="/me/trees" className={`nav-link ${isActive('/me/trees')}`}>
            {t('navMyTree')}
          </Link>
          <Link to="/create" className={`nav-link ${isActive('/create')}`}>
            {t('navCreateTree')}
          </Link>
          <Link to="/community" className={`nav-link ${isActive('/community')}`}>
            {t('navComTree')}
          </Link>
          <Link to="/public/trees" className={`nav-link ${isActive('/public/trees')}`}>
            {t('navPubTree')}
          </Link>
        </div>

        {/* User Section */}
        <div className="user-section">
          {user && (
            <>
              <div className="user-info">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="user-avatar"
                  />
                )}
                <span className="user-name">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </div>
              
              <button onClick={handleLogout} className="logout-btn">
                {t('navLogOut')}
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link 
          to="/me/trees" 
          className={`mobile-link ${isActive('/')}`}
          onClick={() => setMenuOpen(false)}
        >
          {t('navMyTree')}
        </Link>
        <Link 
          to="/create" 
          className={`mobile-link ${isActive('/form')}`}
          onClick={() => setMenuOpen(false)}
        >
          {t('navCreateTree')}
        </Link>
        <Link 
          to="/community" 
          className={`mobile-link ${isActive('/render')}`}
          onClick={() => setMenuOpen(false)}
        >
          {t('navComTree')}
        </Link>
        <Link 
          to="/public/trees" 
          className={`mobile-link ${isActive('/me/tree')}`}
          onClick={() => setMenuOpen(false)}
        >
          {t('navPubTree')}
        </Link>
        {user && (
          <button 
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }} 
            className="mobile-logout-btn"
          >
            {t('navLogOut')}
          </button>
        )}
      </div>
    </nav>
  );
}