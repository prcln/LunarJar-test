import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase.js';
import './App.css'

// named export {}
// default export no {}
import WishForm from "../components/wish-form/wish-form.jsx"
import WishRender from "../components/wish-render/wish-render.jsx";
import UserTree from '../pages/UserTree/UserTree.jsx';
import AuthComponent from '../components/auth-form/AuthComponent.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Navbar from '../components/navbar/Navbar.jsx';
import ShareTree from '../components/share-tree/share-tree.jsx';
import CreateTree from '../components/create-tree/create-tree.jsx';
import TreeList from '../components/tree-list/tree-list.jsx';
import Tree from '../components/tree/tree.jsx';
import ApricotTreeDemo from '../components/tree/realtree.jsx';
import DecorationPositionFinder from '../components/svg-pos-finder/posfinder.jsx';

// Pages
import PublicTree from '../pages/PublicTree/PublicTree.jsx'
import Privacy from '../pages/Privacy/Privacy.jsx';
import Terms from '../pages/Terms/terms.jsx';
import ShortLinkRedirectPage from '../components/Redirect.jsx';
import Footer from '../components/footer/Footer.jsx';


//       <Route path="/" element={<>      <WishForm/> <WishRender/> </>} />

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { tree: treeId } = useParams();
  

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
        
        <Route
          path="/terms"
          element={<Terms />}      
        />

        <Route
          path="/privacy"
          element={<Privacy />}      
        />

        {/* Protected routes - require authentication */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <PublicTree 
              key="public" 
              isGlobalRender={true} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/tree" 
          element={
            <ProtectedRoute>
              <Tree 
              wishCount={20} 
              daysUntilNewYear={15} 
              />
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
          path="/user/tree/:tree" 
          element={
            <ProtectedRoute>
              <UserTree 
              isGlobalRender={false}
              userMail={user?.email}
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/public/trees" 
          element={
            <ProtectedRoute>
              <TreeList
              key="publictree" 
              isPublic={true}
              userId={user?.uid}
              />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/community/tree" 
          element={
            <ProtectedRoute>
              <PublicTree
              key="communitytree" 
              isPublic={true}
              userId={user?.uid}
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/me/tree" 
          element={
            <ProtectedRoute>
              <TreeList 
                key="mytree"
                userId={user?.uid}
                />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/me/tree/:slug" 
          element={
            <ProtectedRoute>
              <UserTree
              key="personalMe" 
              isGlobalRender={false} 
              userId={user?.uid}
              userMail={user?.email}
              />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/c/:shortId" 
          element={
            <ProtectedRoute>
              <ShortLinkRedirectPage/>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/tree/:slug" 
          element={
            <ProtectedRoute>
              <UserTree
              key="personalOther" 
              isGlobalRender={false} 
              userId={user?.uid} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/test" 
          element={
            <ProtectedRoute>
              <ApricotTreeDemo/>
            </ProtectedRoute>

          } 
        />

        <Route 
          path="/pos" 
          element={
            <ProtectedRoute>
              <DecorationPositionFinder/>
            </ProtectedRoute>
            
          } 
        />
      </Routes>
      </main>
      {location.pathname !== '/login' && <Footer />}
    </div>
  );
}

export default App;
