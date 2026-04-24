import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Login from './pages/Login';

// Auth context for managing login state across the app
export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Protected route wrapper — redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Login page — full screen, no navbar */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } />

          {/* Protected app shell */}
          <Route path="/*" element={
            <ProtectedRoute>
              {/* Root wrapper handles dark mode dynamic background mapping globally */}
              <div className="app-bg min-h-screen w-full font-sans transition-all duration-300">
                <Navbar />
                <main className="max-w-7xl mx-auto px-6 py-8">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analytics" element={<Analytics />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
