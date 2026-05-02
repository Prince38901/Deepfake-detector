// frontend/src/store/authStore.js - Authentication State Management with Zustand
import axios from 'axios';
import { create } from 'zustand';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  mfaRequired: false,
  loading: false,
  error: null,

  // Register new user
  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name
      });

      const { token, user, mfaSecret } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        loading: false
      });

      return { success: true, mfaSecret };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Login user
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { token, user, mfaRequired } = response.data;

      if (mfaRequired) {
        localStorage.setItem('mfaToken', token);
        set({ mfaRequired: true, loading: false });
        return { success: true, mfaRequired: true };
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        mfaRequired: false,
        loading: false
      });

      return { success: true, mfaRequired: false };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Verify MFA code
  verifyMFA: async (mfaCode) => {
    set({ loading: true, error: null });
    try {
      const mfaToken = localStorage.getItem('mfaToken');
      const response = await axios.post(`${API_URL}/auth/verify-mfa`, {
        mfaCode
      }, {
        headers: { Authorization: `Bearer ${mfaToken}` }
      });

      const { token, user } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('mfaToken');

      set({
        token,
        user,
        isAuthenticated: true,
        mfaRequired: false,
        loading: false
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'MFA verification failed';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      mfaRequired: false,
      error: null
    });
  },

  // Restore session from localStorage
  restoreSession: () => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true });
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  },

  // Get current user
  getCurrentUser: () => {
    return get().user;
  },

  // Update user profile
  updateProfile: async (updates) => {
    set({ loading: true, error: null });
    try {
      const token = get().token;
      const response = await axios.put(`${API_URL}/users/profile`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { user } = response.data;
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        loading: false
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Profile update failed';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }
}));

/**
 * Detection History Store
 */
export const useDetectionStore = create((set, get) => ({
  detections: [],
  selectedDetection: null,
  filter: 'all', // all, fake, real
  loading: false,

  // Add detection result
  addDetection: (detection) => {
    set((state) => ({
      detections: [detection, ...state.detections].slice(0, 100)
    }));
  },

  // Fetch detection history
  fetchDetections: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/detect/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ detections: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  // Select detection
  selectDetection: (detection) => {
    set({ selectedDetection: detection });
  },

  // Set filter
  setFilter: (filter) => {
    set({ filter });
  },

  // Get filtered detections
  getFilteredDetections: () => {
    const { detections, filter } = get();
    if (filter === 'fake') return detections.filter(d => d.isFake);
    if (filter === 'real') return detections.filter(d => !d.isFake);
    return detections;
  },

  // Clear history
  clearHistory: async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_URL}/detect/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ detections: [] });
    } catch (error) {
      console.error('Clear history error:', error);
    }
  }
}));

/**
 * Admin Dashboard Store
 */
export const useAdminStore = create((set, get) => ({
  stats: null,
  auditLogs: [],
  users: [],
  loading: false,

  // Fetch dashboard statistics
  fetchStats: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ stats: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  // Fetch audit logs
  fetchAuditLogs: async (limit = 50) => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/admin/audit-logs?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ auditLogs: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  // Fetch users
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ users: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${API_URL}/admin/users/${userId}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchUsers();
    } catch (error) {
      console.error('Update role error:', error);
    }
  }
}));
