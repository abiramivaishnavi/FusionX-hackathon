import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import GlobalBackground from './components/GlobalBackground';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import RecommendationDetails from './pages/RecommendationDetails';
import Login from './pages/Login';
import CveDetails from './pages/CveDetails';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      
      <Route path="/*" element={
        <ProtectedRoute>
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/*" element={
                <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/cve/:id" element={<CveDetails />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                    <Route path="/recommendation/:id" element={<RecommendationDetails />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </main>
              } />
            </Routes>
          </>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-bg min-h-screen w-full font-sans transition-all duration-300 relative">
          <GlobalBackground />
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
