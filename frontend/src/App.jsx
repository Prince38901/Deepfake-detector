// frontend/src/App.jsx - Main React Application
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DetectionPage from './pages/DetectionPage';
import AuthPage from './pages/AuthPage';
import AdminPanel from './pages/AdminPanel';
import FieldOpsPage from './pages/FieldOpsPage';
import { useAuthStore } from './store/authStore';

function App() {
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, restoreSession } = useAuthStore();

  useEffect(() => {
    // Restore user session from localStorage
    restoreSession();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Deepfake Detection System...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        {isAuthenticated && <Navbar />}
        <Toaster position="top-right" />
        
        <main className={isAuthenticated ? 'pt-20' : ''}>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected Routes */}
            {isAuthenticated ? (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/detect" element={<DetectionPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/field-ops" element={<FieldOpsPage />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/auth" replace />} />
            )}
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
