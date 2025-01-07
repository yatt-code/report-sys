import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      auth.me()
        .then(data => setUser(data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login:', { email });
      const data = await auth.login(email, password);
      console.log('Login response:', data);
      
      localStorage.setItem('token', data.access_token);
      
      console.log('Getting user data...');
      const userData = await auth.me();
      console.log('User data:', userData);
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      console.log('Attempting signup:', userData);
      const data = await auth.signup(userData);
      console.log('Signup response:', data);
      
      // After signup, log them in automatically
      return login(userData.email, userData.password);
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response?.status === 404) {
        throw new Error('Registration endpoint not found. Please contact support.');
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated,
      login, 
      signup, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
