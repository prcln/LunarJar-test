import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { auth } from '../firebase.js';

// named export {}
// default export no {}
import WishForm from "../components/wish-form/wish-form.jsx"
import WishRender from "../components/wish-render/wish-render.jsx";
import FormRender from '../pages/form+render.jsx';
import AuthComponent from '../components/auth-form/auth-form.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Navbar from '../components/navbar/Navbar.jsx';

//       <Route path="/" element={<>      <WishForm/> <WishRender/> </>} />

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {location.pathname !== '/login' && <Navbar />}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Routes>
        {/* Redirect to home if already logged in */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <AuthComponent />} 
        />
        
        {/* Protected routes - require authentication */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <FormRender />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/form" 
          element={
            <ProtectedRoute>
              <WishForm />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/render" 
          element={
            <ProtectedRoute>
              <WishRender />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tree/:userId" 
          element={
            <ProtectedRoute>
              <WishForm />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tree/:userId/wish/:wishId" 
          element={
            <ProtectedRoute>
              <WishForm />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/me/tree" 
          element={
            <ProtectedRoute>
              <WishForm />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </main>
    </div>
  );
}

export default App;
