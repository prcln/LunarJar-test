export default function UserDashboard({ user, onSignOut }) {
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
          <p><p>{user?.email || 'Email not provided by Facebook'}</p></p>
          <p>
            <strong>Status:</strong>{' '}
            <span style={{ color: user?.emailVerified ? '#27ae60' : '#e74c3c' }}>
              {user?.emailVerified ? 'Verified ✓' : 'Not Verified (Check your email)'}
            </span>
          </p>
        </div>
        <button className="btn btn-danger" onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}