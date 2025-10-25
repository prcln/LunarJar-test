import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useUserAuth } from "../context/AuthContext"; // Assuming you have this
import { LanguageProvider } from '../context/LanguageContext.jsx';


import './App.css'


// named export {}
// default export no {}
import UserTree from '../pages/UserTree/UserTree.jsx';
import AuthComponent from '../components/auth-form/AuthComponent.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import CreateTree from '../components/create-tree/create-tree.jsx';
import TreeList from '../components/tree-list/tree-list.jsx';
import DecorationPositionFinder from '../components/svg-pos-finder/posfinder.jsx';

// Pages
import PublicTree from '../pages/PublicTree/PublicTree.jsx'
import Privacy from '../pages/Privacy/Privacy.jsx';
import Terms from '../pages/Terms/terms.jsx';
import ShortLinkRedirectPage from '../components/Redirect.jsx';

import { AdminPanel } from '../components/admin-panel/AdminPanel.jsx';
import MainLayout from '../components/MainLayout/MainLayout.jsx';


function App() {
  // All state logic (useState, useEffect) is now in AuthProvider!
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          {/* === Public Routes (No Navbar/Footer) === */}
          <Route path="/login" element={<AuthComponent />} />

          {/* === Protected Routes (With Navbar/Footer) === */}
          {/* The ProtectedRoute checks if the user is logged in. */}
          {/* The MainLayout provides the Navbar, Footer, and main content area. */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<PublicTree key="public" isGlobalRender={true} />} />
              <Route key="create" path="/create" element={<CreateTree />} />
              <Route path="/me/trees" element={<TreeList key="mytree" />} />
              <Route path="/me/tree/:slug" element={<UserTree key="personalMe" isGlobalRender={false} />} />
              <Route path="/user/tree/:tree" element={<UserTree key="personalOther" isGlobalRender={false} />} />
              <Route path="/public/trees" element={<TreeList key="publictree" isPublic={true} />} />
              <Route path="/panel" element={<AdminPanel />} />
              <Route path="/pos" element={<DecorationPositionFinder />} />
              <Route key="community" path="/community" element={<PublicTree key="communitytree"         isPublic={true} />} />
              {/* ... add all other protected routes here ... */}
            </Route>
          </Route>
          
          {/* === Public Static Routes (With Navbar/Footer but no protection) === */}
          <Route element={<MainLayout />}>
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/c/:shortId" element={<ShortLinkRedirectPage />} />
              <Route path="/tree/:slug" element={<UserTree key="personalOther" isGlobalRender={false} />} />
          </Route>
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;