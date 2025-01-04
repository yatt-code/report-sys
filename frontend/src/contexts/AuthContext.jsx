import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { access_token } = await auth.login(email, password);
    localStorage.setItem('token', access_token);
    const userData = await auth.me();
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const newUser = await auth.register(userData);
    const { access_token } = await auth.login(userData.email, userData.password);
    localStorage.setItem('token', access_token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
