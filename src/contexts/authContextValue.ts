import { createContext } from 'react';

export interface User {
  title?: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  email_address: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
