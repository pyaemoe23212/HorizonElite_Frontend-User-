import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../Services/api';

export interface User {
  title?: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  email_address: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt_token'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profileData = await api.getProfile() as unknown as User;
        if (!cancelled) {
          setUser(profileData);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load profile:', error);
          logout();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
