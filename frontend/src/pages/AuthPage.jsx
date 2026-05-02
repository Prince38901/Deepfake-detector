// frontend/src/pages/AuthPage.jsx - Authentication Page
import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [mfaCode, setMfaCode] = useState('');
  const { login, register, verifyMFA, loading, mfaRequired } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Login successful!');
        navigate('/');
      } else {
        await register(formData.email, formData.password, formData.name);
        toast.success('Registration successful!');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMFASubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyMFA(mfaCode);
      toast.success('MFA verified!');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (mfaRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <form onSubmit={handleMFASubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-white">Verify MFA</h2>
          <input
            type="text"
            placeholder="Enter MFA Code"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            className="w-full px-4 py-2 mb-4 bg-gray-700 text-white rounded-lg focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">{isLogin ? 'Login' : 'Register'}</h2>
        
        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-4 bg-gray-700 text-white rounded-lg focus:outline-none"
            required
          />
        )}
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 mb-4 bg-gray-700 text-white rounded-lg focus:outline-none"
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 mb-6 bg-gray-700 text-white rounded-lg focus:outline-none"
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg disabled:opacity-50 mb-4"
        >
          {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
        </button>
        
        <p className="text-center text-gray-400">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:text-blue-400"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </form>
    </div>
  );
}

export default AuthPage;
