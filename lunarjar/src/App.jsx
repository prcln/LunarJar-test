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
import ShareTree from '../components/share-tree/share-tree.jsx';
import CreateTree from '../components/create-tree/create-tree.jsx';
import TreeList from '../components/tree-list/tree-list.jsx';

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
              <FormRender isGlobalRender={true} />
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
          path="/create" 
          element={
            <ProtectedRoute>
              <CreateTree />
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
          path="/share" 
          element={
            <ProtectedRoute>
              <ShareTree />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/user/tree/:tree" 
          element={
            <ProtectedRoute>
              <FormRender isGlobalRender={false} />
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
              <TreeList userId={user?.uid} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/me/tree/:treeId" 
          element={
            <ProtectedRoute>
              <FormRender isGlobalRender={false} userId={user?.uid} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </main>
    </div>
  );
}

export default App;
