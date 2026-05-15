import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const data = await api('/auth/me');
      const updatedUser = { ...data.user, organization: data.organization };
      localStorage.setItem('shinka-user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('shinka-token');
    const storedUser = localStorage.getItem('shinka-user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Fetch fresh profile in the background
      fetchProfile();
    }
    setLoading(false);

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      localStorage.setItem('shinka-token', data.token);
      localStorage.setItem('shinka-user', JSON.stringify(data.user));
      setUser(data.user);
      navigate('/');
      
      // Fetch the full profile to get organization data
      await fetchProfile();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (orgName, name, email, password) => {
    try {
      const data = await api('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ orgName, name, email, password }),
      });
      
      localStorage.setItem('shinka-token', data.token);
      localStorage.setItem('shinka-user', JSON.stringify(data.user));
      setUser(data.user);
      navigate('/');
      
      await fetchProfile();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (name, email, password) => {
    try {
      await api('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, email, password }),
      });
      await fetchProfile();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateOrganization = async (name) => {
    try {
      await api('/auth/organization', {
        method: 'PUT',
        body: JSON.stringify({ name }),
      });
      await fetchProfile();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('shinka-token');
    localStorage.removeItem('shinka-user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile, updateOrganization }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
