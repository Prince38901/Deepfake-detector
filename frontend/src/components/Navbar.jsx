// frontend/src/components/Navbar.jsx - Navigation Bar
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 fixed w-full top-0 z-50">
      <div className="px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold text-blue-500">
            🔍 Deepfake Detector
          </Link>
          <div className="flex space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link to="/detect" className="text-gray-300 hover:text-white">Detection</Link>
            <Link to="/admin" className="text-gray-300 hover:text-white">Admin</Link>
            <Link to="/field-ops" className="text-gray-300 hover:text-white">Field Ops</Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
