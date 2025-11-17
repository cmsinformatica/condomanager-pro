import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { useCondo } from './CondoDataContext';
import { verifyPassword, isHashed, hashPassword } from '../lib/passwordUtils';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (userId: string, newPassword: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProviderInner: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { users, updateUser } = useCondo();

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

  const login = async (email: string, pass: string): Promise<boolean> => {
    // Buscar usuário pelo email
    const user = users.find(u => u.email === email);
    
    if (user) {
      // Se o usuário tem senha cadastrada, verificar
      if (user.password) {
        // Verificar se é hash ou texto plano (para migração)
        if (isHashed(user.password)) {
          // Senha está em hash, usar verificação segura
          const isValid = await verifyPassword(pass, user.password);
          if (isValid) {
            const { password, ...userWithoutPassword } = user;
            setCurrentUser(userWithoutPassword);
            window.sessionStorage.setItem('authUser', JSON.stringify(userWithoutPassword));
            return true;
          }
        } else {
          // Senha em texto plano (legado), verificar diretamente
          // Mas também fazer hash e atualizar no banco
          if (user.password === pass) {
            const { password, ...userWithoutPassword } = user;
            setCurrentUser(userWithoutPassword);
            window.sessionStorage.setItem('authUser', JSON.stringify(userWithoutPassword));
            // Migrar senha para hash em background (não bloquear login)
            migratePasswordToHash(user.id, pass).catch(console.error);
            return true;
          }
        }
      } else {
        // Fallback: se não tem senha, verificar credenciais padrão do admin
        const isAdminCredentials = email === 'admin@condo.com' && pass === 'admin';
        if (isAdminCredentials) {
          const { password, ...userWithoutPassword } = user;
          setCurrentUser(userWithoutPassword);
          window.sessionStorage.setItem('authUser', JSON.stringify(userWithoutPassword));
          return true;
        }
      }
    }
    return false;
  };

  // Função auxiliar para migrar senha em texto plano para hash
  const migratePasswordToHash = async (userId: string, plainPassword: string) => {
    try {
      const hashedPassword = await hashPassword(plainPassword);
      const user = users.find(u => u.id === userId);
      if (user) {
        await updateUser(userId, {
          name: user.name,
          email: user.email,
          role: user.role,
          apartmentNumber: user.apartmentNumber,
          password: hashedPassword
        });
      }
    } catch (error) {
      console.error('Error migrating password to hash:', error);
    }
  };

  const changePassword = async (userId: string, newPassword: string): Promise<boolean> => {
    try {
      const hashedPassword = await hashPassword(newPassword);
      
      const user = users.find(u => u.id === userId);
      if (user) {
        await updateUser(userId, {
          name: user.name,
          email: user.email,
          role: user.role,
          apartmentNumber: user.apartmentNumber,
          password: hashedPassword
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
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
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <AuthProviderInner>{children}</AuthProviderInner>;
};
