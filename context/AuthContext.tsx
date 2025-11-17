import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { useCondo } from './CondoDataContext';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { users } = useCondo();

  useEffect(() => {
    try {
      const item = window.sessionStorage.getItem('authUser');
      if (item) {
        setCurrentUser(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Error reading sessionStorage key “authUser”:', error);
      window.sessionStorage.removeItem('authUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email: string, pass: string): boolean => {
    // Para este projeto, a senha é verificada de forma estática.
    const isAdminCredentials = email === 'admin@condo.com' && pass === 'admin';
    
    if (isAdminCredentials) {
      const user = users.find(u => u.email === email);
      if (user) {
        setCurrentUser(user);
        window.sessionStorage.setItem('authUser', JSON.stringify(user));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    window.sessionStorage.removeItem('authUser');
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
