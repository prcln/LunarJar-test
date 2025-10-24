import { Navigate, Outlet } from 'react-router-dom';
import { useUserAuth } from '../context/AuthContext'; // 1. Import the hook

export default function ProtectedRoute() {
  // 2. Get user and loading state from the central context
  const { user, loading } = useUserAuth();

  // Show a loading indicator while the context is checking the user's status
  if (loading) {
    return <div>Loading...</div>;
  }

  // 3. If there is a user, render the nested child routes via <Outlet />.
  //    If not, redirect them to the login page.
  console.log(user);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}