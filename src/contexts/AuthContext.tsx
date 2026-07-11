import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../Services/api';
import { AuthContext, type User } from './authContextValue';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt_token'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
  }, []);

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
          const status = (error as { status?: number })?.status;
          if (status !== 401) {
            console.error('Failed to load profile:', error);
          }
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
  }, [token, logout]);

  const login = useCallback((newToken: string, userData: User) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
    setUser(userData);
  }, []);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const contextValue = useMemo(
    () => ({ user, token, isAuthenticated: !!token, isLoading, login, logout, updateUser }),
    [user, token, isLoading, login, logout, updateUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
